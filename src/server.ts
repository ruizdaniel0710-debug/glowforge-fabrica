import fs from "node:fs/promises";
import path from "node:path";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// ── Security headers applied to every response ──
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      
      // Serve files from the persistent data volume
      if (url.pathname.startsWith("/uploads/")) {
        try {
          const dataRoot = path.resolve(process.cwd(), "data");
          
          // ── PATH TRAVERSAL PROTECTION ──
          // Normalize the path and ensure it stays inside dataRoot
          const requestedPath = path.normalize(
            path.join(dataRoot, decodeURIComponent(url.pathname))
          );
          
          // CRITICAL: Block any path that escapes the data directory
          if (!requestedPath.startsWith(dataRoot + path.sep) && requestedPath !== dataRoot) {
            return addSecurityHeaders(new Response("Forbidden", { status: 403 }));
          }
          
          // Only allow safe file extensions (no .db, .sql, .env, etc.)
          const ext = path.extname(requestedPath).toLowerCase();
          const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".glb", ".gltf", ".stl", ".obj", ".3mf", ".zip"];
          if (!allowedExts.includes(ext)) {
            return addSecurityHeaders(new Response("Forbidden", { status: 403 }));
          }

          const buffer = await fs.readFile(requestedPath);
          const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".glb": "model/gltf-binary",
            ".gltf": "model/gltf+json",
            ".stl": "application/octet-stream",
            ".obj": "application/octet-stream",
            ".3mf": "application/octet-stream",
            ".zip": "application/zip",
          };
          const contentType = mimeTypes[ext] || "application/octet-stream";
          return addSecurityHeaders(
            new Response(buffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            })
          );
        } catch (err) {
          // File not found in data volume — let it fall through to static build
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const safeResponse = await normalizeCatastrophicSsrResponse(response);
      return addSecurityHeaders(safeResponse);
    } catch (error) {
      console.error(error);
      return addSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      );
    }
  },
};
