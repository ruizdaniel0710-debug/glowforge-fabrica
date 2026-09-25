import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs/promises";

const dbPath = path.resolve(process.cwd(), "data", "snake-lab.db");

export const REQUEST_STATUSES = ["recibida", "en revisión", "cotizada", "aprobada", "en impresión", "enviada", "cancelada"] as const;

const fileSchema = z.object({ name: z.string().max(200), path: z.string().max(400).startsWith("/uploads/requests/"), size: z.number().nonnegative() });

function initDb() {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      notes TEXT,
      files TEXT,
      status TEXT DEFAULT 'recibida',
      quote_amount REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS request_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      message TEXT,
      amount REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES custom_requests(id)
    );
  `);
  
  try {
    db.exec(`ALTER TABLE custom_requests ADD COLUMN shipping_info TEXT`);
  } catch (e) {
    // Column might already exist, ignore error
  }
  
  return db;
}

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
    const db = initDb();
    const code = makeCode();
    try {
      db.prepare(`
        INSERT INTO custom_requests (code, customer_name, email, notes, files)
        VALUES (?, ?, ?, ?, ?)
      `).run(code, data.name, data.email.toLowerCase(), data.notes, JSON.stringify(data.files));
      return { code };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos registrar la solicitud.");
    } finally {
      db.close();
    }
  });

export const lookupCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ code: z.string().trim().max(20), email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const db = initDb();
    try {
      const req = db.prepare(`SELECT * FROM custom_requests WHERE code = ? AND email = ?`).get(data.code.toUpperCase(), data.email.toLowerCase()) as any;
      if (!req) return { found: false as const };
      
      const replies = db.prepare(`SELECT * FROM request_replies WHERE request_id = ? ORDER BY created_at ASC`).all(req.id) as any[];
      
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
    } finally {
      db.close();
    }
  });

export const listCustomRequests = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = initDb();
    try {
      const reqs = db.prepare(`SELECT * FROM custom_requests ORDER BY created_at DESC`).all() as any[];
      return reqs.map(req => ({
        ...req,
        files: JSON.parse(req.files || '[]'),
        createdAt: req.created_at,
        updatedAt: req.updated_at,
        quoteAmount: req.quote_amount,
      }));
    } finally {
      db.close();
    }
  });

export const updateCustomRequest = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      id: z.union([z.string(), z.number()]),
      status: z.enum(REQUEST_STATUSES)
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const db = initDb();
    try {
      db.prepare(`UPDATE custom_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(data.status, Number(data.id));
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos actualizar la solicitud.");
    } finally {
      db.close();
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
    const db = initDb();
    try {
      db.prepare(`
        UPDATE custom_requests 
        SET status = 'aprobada', shipping_info = ?
        WHERE id = ?
      `).run(JSON.stringify(data.shipping), data.id);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos procesar el pago.");
    } finally {
      db.close();
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
    const db = initDb();
    try {
      db.prepare(`DELETE FROM request_replies WHERE request_id = ?`).run(Number(data.id));
      db.prepare(`DELETE FROM custom_requests WHERE id = ?`).run(Number(data.id));
      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error("No pudimos eliminar la solicitud.");
    } finally {
      db.close();
    }
  });
