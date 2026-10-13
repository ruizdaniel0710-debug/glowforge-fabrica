import crypto from "crypto";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

/**
 * Best-effort client IP (Railway sits behind a proxy, so prefer X-Forwarded-For).
 */
export function getClientIp(): string {
  try {
    const fwd = getRequestHeader("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]!.trim();
    return getRequestIP() || "unknown";
  } catch {
    return "unknown";
  }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ── Server-side session management ──
// Uses a simple in-memory token store. Tokens expire after 8 hours.
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const activeSessions = new Map<string, { expiresAt: number }>();

function cleanEnv(val: string | undefined): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

export function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

/**
 * Verify login credentials and return a session token.
 * Returns null if credentials are invalid.
 */
export function serverLogin(username: string, password: string): string | null {
  const cleanUser = (username || "").trim();
  const cleanPass = (password || "").trim();

  const expectedUser = cleanEnv(process.env["ADMIN_USER"]) || "admin";
  const userOk = cleanUser.toLowerCase() === expectedUser.toLowerCase();

  if (!userOk) {
    console.warn(`[AUTH] Intento de login fallido: usuario '${cleanUser}' no coincide con '${expectedUser}'`);
    return null;
  }

  const envHash = cleanEnv(process.env["ADMIN_PASS_HASH"]);
  const envPass = cleanEnv(process.env["ADMIN_PASSWORD"] || process.env["ADMIN_PASS"]);
  const userPassHash = hashPassword(cleanPass);

  let passOk = false;

  // 1. Si en Railway se configuró contraseña en texto plano:
  if (envPass && cleanPass === envPass) {
    passOk = true;
  }
  // 2. Si en Railway se configuró ADMIN_PASS_HASH (acepta tanto el hash SHA-256 como el texto plano por si el usuario pegó la clave directamente):
  else if (envHash) {
    if (envHash.toLowerCase() === userPassHash.toLowerCase() || envHash === cleanPass) {
      passOk = true;
    }
  }
  // 3. Fallbacks incorporados (acepta tanto la nueva clave segura como la clásica):
  if (!passOk) {
    if (
      userPassHash === "924ebfd3c44d4071d98d54a614255e319a31878e8446feefb6a9537692b75f6b" || // SL-4TAchNZvqYMYJWSAak
      userPassHash === "53f6b5beb9d24a218af0412b94609d8f88a2fb3106fce252402bcd4eecd1a56b"    // snakelab2026
    ) {
      passOk = true;
    }
  }

  if (!passOk) {
    console.warn(`[AUTH] Intento de login fallido: contraseña incorrecta para usuario '${cleanUser}'`);
    return null;
  }

  // Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString("hex");
  activeSessions.set(token, { expiresAt: Date.now() + TOKEN_TTL_MS });

  // Cleanup expired sessions periodically
  cleanupSessions();

  console.log(`[AUTH] Sesión iniciada exitosamente para usuario '${cleanUser}'`);
  return token;
}

/**
 * Validate that a session token is still active.
 */
export function validateSession(token: string | null | undefined): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

/**
 * Invalidate a session token (logout).
 */
export function serverLogout(token: string): void {
  activeSessions.delete(token);
}

/**
 * Remove expired sessions from memory.
 */
function cleanupSessions(): void {
  const now = Date.now();
  for (const [key, session] of activeSessions) {
    if (now > session.expiresAt) {
      activeSessions.delete(key);
    }
  }
}

// ── Rate Limiting ──
// Simple in-memory sliding-window rate limiter per IP/key.
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request should be rate-limited.
 * Returns true if the request is ALLOWED, false if it should be BLOCKED.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count++;
  if (bucket.count > maxRequests) {
    return false; // Rate limited
  }
  return true;
}

/**
 * Stricter rate limit for sensitive operations (login, file upload).
 * 5 attempts per minute.
 */
export function checkStrictRateLimit(key: string): boolean {
  return checkRateLimit(key, 5, 60_000);
}

// Cleanup rate limit buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (now > bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  }
}, 5 * 60_000);
