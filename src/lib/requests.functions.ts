import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { dbRun, dbAll, dbGet } from "./db";
import { Resend } from "resend";
import { assertAdmin } from "./auth.functions";
import { checkRateLimit, getClientIp } from "./server-auth";

const resend = process.env["RESEND_API_KEY"] ? new Resend(process.env["RESEND_API_KEY"]) : null;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export const REQUEST_STATUSES = ["recibida", "en revisión", "cotizada", "aprobada", "en impresión", "enviada", "cancelada"] as const;

const fileSchema = z.object({ name: z.string().max(200), path: z.string().max(400).startsWith("/uploads/requests/"), size: z.number().nonnegative() });

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += chars[b % chars.length];
  return `SNK-${out}`;
}

export const createCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      notes: z.string().trim().max(600),
      files: z.array(fileSchema).min(1).max(8),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkRateLimit(`create-request:${getClientIp()}`, 5, 60_000)) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const code = makeCode();
    try {
      await dbRun(`
        INSERT INTO custom_requests (code, customer_name, email, notes, files)
        VALUES (?, ?, ?, ?, ?)
      `, [code, data.name, data.email.toLowerCase(), data.notes, JSON.stringify(data.files)]);

      resend?.emails.send({
        from: 'SNAKELAB <ventas@snakelab.site>',
        to: data.email.toLowerCase(),
        subject: `Cotización Recibida - Código ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #7c3aed;">¡Hola, ${escapeHtml(data.name)}!</h2>
            <p>Hemos recibido tu solicitud de cotización correctamente.</p>
            <p>Tu código de seguimiento es: <strong>${code}</strong></p>
            <p>Puedes revisar el estado de tu cotización en nuestra página de <a href="https://snakelab.site/seguimiento">Seguimiento</a>.</p>
            <p>Pronto uno de nuestros expertos revisará los archivos y te enviará el valor final. ¡Gracias por elegir Snakelab!</p>
          </div>
        `
      })?.catch(console.error);

      return { code };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos registrar la solicitud.");
    }
  });

export const lookupCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ code: z.string().trim().max(20), email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    if (!checkRateLimit(`lookup-request:${getClientIp()}`, 15, 60_000)) {
      throw new Error("Demasiadas consultas. Intenta en un momento.");
    }
    const req = await dbGet(`SELECT * FROM custom_requests WHERE code = ? AND email = ?`, [data.code.toUpperCase(), data.email.toLowerCase()]);
    if (!req) return { found: false as const };
    
    const replies = await dbAll(`SELECT * FROM request_replies WHERE request_id = ? ORDER BY created_at ASC`, [req.id]);
    
    const files = (JSON.parse(req.files || '[]') as { name: string }[]).map((f) => f.name);
    
    return {
      found: true as const,
      request: {
        ...req,
        files,
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        quoteAmount: req.quote_amount,
      },
      replies: replies.map(r => ({
        ...r,
        created_at: r.created_at
      }))
    };
  });

export const listCustomRequests = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ _adminToken: z.string().max(128).optional() }).parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    const reqs = await dbAll(`SELECT * FROM custom_requests ORDER BY created_at DESC`);
    return reqs.map(req => ({
      ...req,
      files: JSON.parse(req.files || '[]'),
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      quoteAmount: req.quote_amount,
    }));
  });

export const updateCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      id: z.union([z.string(), z.number()]),
      status: z.enum(REQUEST_STATUSES),
      _adminToken: z.string().max(128).optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun(`UPDATE custom_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [data.status, Number(data.id)]);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos actualizar la solicitud.");
    }
  });

export const payCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({
    id: z.number(),
    code: z.string().trim().max(20),
    email: z.string().trim().email().max(255),
    shipping: z.object({
      phone: z.string().max(30),
      address: z.string().max(300),
      department: z.string().max(100),
      city: z.string().max(100),
      paymentMethod: z.string().max(50),
    })
  }).parse(d))
  .handler(async ({ data }) => {
    if (!checkRateLimit(`pay-request:${getClientIp()}`, 10, 60_000)) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    // Ownership check: only the customer who knows code + email can approve/pay
    const owned = await dbGet(
      `SELECT id FROM custom_requests WHERE id = ? AND code = ? AND email = ?`,
      [data.id, data.code.toUpperCase(), data.email.toLowerCase()]
    );
    if (!owned) throw new Error("Solicitud no encontrada.");
    try {
      await dbRun(`
        UPDATE custom_requests 
        SET status = 'aprobada', shipping_info = ?
        WHERE id = ?
      `, [JSON.stringify(data.shipping), data.id]);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos procesar el pago.");
    }
  });

export const uploadRequestFile = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Expected File");
    
    // 1. Validación de tamaño (Máximo 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`El archivo excede el límite de 25MB permitido.`);
    }

    // 2. Validación estricta de extensión para evitar ejecutables o scripts maliciosos
    const ext = file.name.split('.').pop()?.toLowerCase() || "";
    const allowedExtensions = ["stl", "obj", "3mf", "step", "stp", "zip", "png", "jpg", "jpeg", "webp"];
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Tipo de archivo no permitido: .${ext}. Solo se permiten imágenes o modelos 3D.`);
    }

    return { file };
  })
  .handler(async ({ data }) => {
    if (!checkRateLimit(`upload-request:${getClientIp()}`, 20, 60_000)) {
      throw new Error("Demasiadas subidas. Intenta en un momento.");
    }
    const { file } = data;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `req-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100)}`;
    
    // Ensure the uploads/requests directory exists
    const dirPath = path.resolve(process.cwd(), "public", "uploads", "requests");
    await fs.mkdir(dirPath, { recursive: true });
    
    const uploadPath = path.resolve(dirPath, filename);
    await fs.writeFile(uploadPath, buffer);
    return { path: `/uploads/requests/${filename}` };
  });

export const deleteCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: z.union([z.string(), z.number()]), _adminToken: z.string().max(128).optional() }).parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun(`DELETE FROM request_replies WHERE request_id = ?`, [Number(data.id)]);
      await dbRun(`DELETE FROM custom_requests WHERE id = ?`, [Number(data.id)]);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos eliminar la solicitud.");
    }
  });
