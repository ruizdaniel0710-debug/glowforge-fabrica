import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const REQUEST_STATUSES = ["recibida", "en revisión", "cotizada", "aprobada", "en impresión", "enviada", "cancelada"] as const;

const fileSchema = z.object({ name: z.string().max(200), path: z.string().max(400).startsWith("requests/"), size: z.number().nonnegative() });

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += chars[b % chars.length];
  return `SNK-${out}`;
}

export const createCustomRequest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      notes: z.string().trim().max(600),
      files: z.array(fileSchema).min(1).max(8),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = makeCode();
    const { error } = await supabaseAdmin.from("custom_requests").insert({
      code,
      customer_name: data.name,
      email: data.email.toLowerCase(),
      notes: data.notes,
      files: data.files,
    });
    if (error) {
      console.error(error);
      throw new Error("No pudimos registrar la solicitud.");
    }
    return { code };
  });

export const lookupCustomRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().trim().max(20), email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req } = await supabaseAdmin
      .from("custom_requests")
      .select("id, code, customer_name, notes, files, status, quote_amount, created_at, updated_at")
      .eq("code", data.code.toUpperCase())
      .eq("email", data.email.toLowerCase())
      .maybeSingle();
    if (!req) return { found: false as const };
    const { data: replies } = await supabaseAdmin
      .from("request_replies")
      .select("id, message, amount, created_at")
      .eq("request_id", req.id)
      .order("created_at", { ascending: true });
    const files = ((req.files as { name: string }[]) ?? []).map((f) => f.name);
    return {
      found: true as const,
      request: { code: req.code, name: req.customer_name, notes: req.notes, files, status: req.status, quoteAmount: req.quote_amount, createdAt: req.created_at, updatedAt: req.updated_at },
      replies: replies ?? [],
    };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const listCustomRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("custom_requests")
      .select("*, request_replies(id, message, amount, created_at)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const out = [];
    for (const r of data ?? []) {
      const files = [];
      for (const f of (r.files as { name: string; path: string; size: number }[]) ?? []) {
        const { data: s } = await context.supabase.storage.from("custom-uploads").createSignedUrl(f.path, 3600);
        files.push({ name: f.name, size: f.size, url: s?.signedUrl ?? null });
      }
      out.push({ ...r, files, request_replies: [...(r.request_replies ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)) });
    }
    return out;
  });

export const updateCustomRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(REQUEST_STATUSES),
      message: z.string().trim().max(1000).optional(),
      amount: z.number().int().nonnegative().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: { status: string; updated_at: string; quote_amount?: number | null } = { status: data.status, updated_at: new Date().toISOString() };
    if (data.amount !== undefined) patch.quote_amount = data.amount;
    const { error } = await context.supabase.from("custom_requests").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.message) {
      const { error: e2 } = await context.supabase
        .from("request_replies")
        .insert({ request_id: data.id, message: data.message, amount: data.amount ?? null });
      if (e2) throw new Error(e2.message);
    }
    return { ok: true };
  });
