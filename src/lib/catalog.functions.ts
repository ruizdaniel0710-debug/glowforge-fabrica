import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { dbRun, dbAll, dbGet, dbLastId, getDb } from "./db";
import { assertAdmin } from "./auth.functions";
import { checkRateLimit } from "./server-auth";

// Esquema de producto
const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).max(999999999),
  compare_price: z.number().max(999999999).optional().nullable(),
  category_id: z.number().optional().nullable(),
  sizes: z.array(z.string().max(50)).max(20).optional(),
  colors: z.array(z.string().max(20)).max(20).optional(),
  materials: z.array(z.string().max(50)).max(10).optional(),
  images: z.array(z.string().max(500)).max(20).optional(),
  stock: z.number().min(0).max(99999).optional(),
  production_days: z.number().min(0).max(365).optional(),
  variants: z.array(z.object({
    image: z.string().max(500),
    name: z.string().max(200),
    description: z.string().max(1000),
    price: z.number().min(0).max(999999999)
  })).max(50).optional(),
  _adminToken: z.string().optional(),
});

function safeParseArray(jsonStr: string | null | undefined): any[] {
  try {
    const parsed = JSON.parse(jsonStr || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const listProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const rows = await dbAll(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    // Parse JSON fields
    return rows.map(row => ({
      ...row,
      category: row.category_name || 'Sin Categoría',
      shortDescription: row.description?.replace(/[*_#~]/g, '').substring(0, 100) + ((row.description?.replace(/[*_#~]/g, '').length || 0) > 100 ? '...' : ''),
      images: JSON.parse(row.images || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      sizes: JSON.parse(row.sizes || '[]'),
      materials: JSON.parse(row.materials || '["PLA"]'),
      material: JSON.parse(row.materials || '["PLA"]')[0] || "PLA",
      image: JSON.parse(row.images || '[]')[0] || "",
      comparePrice: row.compare_price,
      productionDays: row.production_days,
      variants: safeParseArray(row.variants),
    }));
  });

export const listCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    return await dbAll("SELECT id, name FROM categories ORDER BY name ASC");
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productSchema.parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun(`
        INSERT INTO products (
          name, slug, description, price, compare_price, category_id,
          sizes, colors, materials, images, stock, production_days, variants
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.name,
        data.slug,
        data.description || "",
        data.price,
        data.compare_price || null,
        data.category_id || null,
        JSON.stringify(data.sizes || []),
        JSON.stringify(data.colors || []),
        JSON.stringify(data.materials || ["PLA"]),
        JSON.stringify(data.images || []),
        data.stock || 99,
        data.production_days || 3,
        JSON.stringify(data.variants || [])
      ]);
      
      const id = await dbLastId();
      return { success: true, id };
    } catch (e: any) {
      console.error("createProduct error:", e);
      throw new Error("Error creando el producto.");
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number() }).and(productSchema).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun(`
        UPDATE products SET
          name = ?, slug = ?, description = ?, price = ?, compare_price = ?,
          category_id = ?, sizes = ?, colors = ?, materials = ?, images = ?,
          stock = ?, production_days = ?, variants = ?
        WHERE id = ?
      `, [
        data.name,
        data.slug,
        data.description || "",
        data.price,
        data.compare_price || null,
        data.category_id || null,
        JSON.stringify(data.sizes || []),
        JSON.stringify(data.colors || []),
        JSON.stringify(data.materials || ["PLA"]),
        JSON.stringify(data.images || []),
        data.stock || 99,
        data.production_days || 3,
        JSON.stringify(data.variants || []),
        data.id
      ]);
      
      return { success: true };
    } catch (e: any) {
      console.error("updateProduct error:", e);
      throw new Error("Error actualizando el producto.");
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number(), _adminToken: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun('DELETE FROM products WHERE id = ?', [data.id]);
      return { success: true };
    } catch (e: any) {
      console.error("deleteProduct error:", e);
      throw new Error("Error eliminando el producto.");
    }
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const row = await dbGet(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `, [data.slug]);

    if (!row) return null;

    return {
      ...row,
      category: row.category_name || 'Sin Categoría',
      shortDescription: row.description?.replace(/[*_#~]/g, '').substring(0, 100) + ((row.description?.replace(/[*_#~]/g, '').length || 0) > 100 ? '...' : ''),
      images: JSON.parse(row.images || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      sizes: JSON.parse(row.sizes || '[]'),
      materials: JSON.parse(row.materials || '["PLA"]'),
      material: JSON.parse(row.materials || '["PLA"]')[0] || "PLA",
      image: JSON.parse(row.images || '[]')[0] || "",
      comparePrice: row.compare_price,
      productionDays: row.production_days,
      variants: safeParseArray(row.variants),
    };
  });

// Magic bytes for image format validation
const IMAGE_MAGIC_BYTES: Record<string, number[][]> = {
  png: [[0x89, 0x50, 0x4E, 0x47]],
  jpg: [[0xFF, 0xD8, 0xFF]],
  jpeg: [[0xFF, 0xD8, 0xFF]],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
  const signatures = IMAGE_MAGIC_BYTES[ext];
  if (!signatures) return false;
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

export const uploadImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const file = data.get("file");
    
    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      throw new Error("Expected File or Blob");
    }
    
    const fileName = (file as any).name || "upload.png";
    
    // 1. Size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`La imagen excede el límite de 5MB permitido.`);
    }

    // 2. Extension whitelist
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    const allowedExtensions = ["png", "jpg", "jpeg", "webp"];
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Tipo de archivo no permitido: .${ext}. Solo se permiten imágenes.`);
    }

    const tokenField = data.get("_adminToken");
    const adminToken = typeof tokenField === "string" ? tokenField : "";

    return { file, fileName, ext, adminToken };
  })
  .handler(async ({ data }) => {
    const { file, fileName, ext, adminToken } = data;
    assertAdmin(adminToken);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. MIME / Magic-bytes validation — prevents disguised executables
    if (!validateMagicBytes(buffer, ext)) {
      throw new Error("El contenido del archivo no coincide con una imagen válida.");
    }
    
    // Sanitize filename strictly
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
    const filename = `img-${Date.now()}-${safeName}`;
    
    const dir = path.resolve(process.cwd(), "data", "uploads", "images");
    await fs.mkdir(dir, { recursive: true });
    const uploadPath = path.resolve(dir, filename);
    
    // Final path traversal guard
    if (!uploadPath.startsWith(dir)) {
      throw new Error("Ruta de archivo no válida.");
    }
    
    await fs.writeFile(uploadPath, buffer);
    return { url: `/uploads/images/${filename}` };
  });
