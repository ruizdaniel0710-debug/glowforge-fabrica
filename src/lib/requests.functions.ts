import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { dbRun, dbAll, dbGet } from "./db";

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
    const code = makeCode();
    try {
      await dbRun(`
        INSERT INTO custom_requests (code, customer_name, email, notes, files)
        VALUES (?, ?, ?, ?, ?)
      `, [code, data.name, data.email.toLowerCase(), data.notes, JSON.stringify(data.files)]);
      return { code };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos registrar la solicitud.");
    }
  });

export const lookupCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ code: z.string().trim().max(20), email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
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

export const listCustomRequests = createServerFn({ method: "GET" })
  .handler(async () => {
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
      status: z.enum(REQUEST_STATUSES)
    }).parse(d)
  )
  .handler(async ({ data }) => {
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
    shipping: z.object({
      phone: z.string(),
      address: z.string(),
      department: z.string(),
      city: z.string(),
      paymentMethod: z.string(),
    })
  }).parse(d))
  .handler(async ({ data }) => {
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
    const { file } = data;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `req-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Ensure the uploads/requests directory exists
    const dirPath = path.resolve(process.cwd(), "public", "uploads", "requests");
    await fs.mkdir(dirPath, { recursive: true });
    
    const uploadPath = path.resolve(dirPath, filename);
    await fs.writeFile(uploadPath, buffer);
    return { path: `/uploads/requests/${filename}` };
  });

export const deleteCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: z.union([z.string(), z.number()]) }).parse(d))
  .handler(async ({ data }) => {
    try {
      await dbRun(`DELETE FROM request_replies WHERE request_id = ?`, [Number(data.id)]);
      await dbRun(`DELETE FROM custom_requests WHERE id = ?`, [Number(data.id)]);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos eliminar la solicitud.");
    }
  });
