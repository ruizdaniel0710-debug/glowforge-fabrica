import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { dbRun, dbAll, dbGet, dbLastId, getDb } from "./db";

// Esquema de producto
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  compare_price: z.number().optional().nullable(),
  category_id: z.number().optional().nullable(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().optional(),
  production_days: z.number().optional(),
});

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
      shortDescription: row.description?.substring(0, 100) + (row.description?.length > 100 ? '...' : ''),
      images: JSON.parse(row.images || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      sizes: JSON.parse(row.sizes || '[]'),
      material: JSON.parse(row.materials || '["PLA"]')[0] || "PLA",
      image: JSON.parse(row.images || '[]')[0] || "",
      comparePrice: row.compare_price,
      productionDays: row.production_days,
    }));
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      await dbRun(`
        INSERT INTO products (
          name, slug, description, price, compare_price, category_id,
          sizes, colors, materials, images, stock, production_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        data.production_days || 3
      ]);
      
      const id = await dbLastId();
      return { success: true, id };
    } catch (e: any) {
      throw new Error(e.message);
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number() }).and(productSchema).parse(data))
  .handler(async ({ data }) => {
    try {
      await dbRun(`
        UPDATE products SET
          name = ?, slug = ?, description = ?, price = ?, compare_price = ?,
          category_id = ?, sizes = ?, colors = ?, materials = ?, images = ?,
          stock = ?, production_days = ?
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
        data.id
      ]);
      
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    try {
      await dbRun('DELETE FROM products WHERE id = ?', [data.id]);
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
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
      shortDescription: row.description?.substring(0, 100) + (row.description?.length > 100 ? '...' : ''),
      images: JSON.parse(row.images || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      sizes: JSON.parse(row.sizes || '[]'),
      material: JSON.parse(row.materials || '["PLA"]')[0] || "PLA",
      image: JSON.parse(row.images || '[]')[0] || "",
      comparePrice: row.compare_price,
      productionDays: row.production_days,
    };
  });

export const uploadImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Expected File");
    
    // 1. Validación de tamaño (Máximo 5MB para imágenes de catálogo)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`La imagen excede el límite de 5MB permitido.`);
    }

    // 2. Validación estricta de extensión para evitar scripts maliciosos
    const ext = file.name.split('.').pop()?.toLowerCase() || "";
    const allowedExtensions = ["png", "jpg", "jpeg", "webp"];
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Tipo de archivo no permitido: .${ext}. Solo se permiten imágenes.`);
    }

    return { file };
  })
  .handler(async ({ data }) => {
    const { file } = data;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `img-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadPath = path.resolve(process.cwd(), "public", "uploads", "images", filename);
    await fs.writeFile(uploadPath, buffer);
    return { url: `/uploads/images/${filename}` };
  });
