import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Database from "better-sqlite3";
import path from "path";

// Resolving the DB path correctly
const dbPath = path.resolve(process.cwd(), "data", "snake-lab.db");

// Validate the input from the checkout form
const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
  shipping: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    department: z.string().optional(),
  }),
  paymentMethod: z.string().min(1),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })).min(1),
  subtotal: z.number(),
});

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    // Open the SQLite database
    const db = new Database(dbPath);
    
    // Generate an idempotency key (also works as tracking code)
    const orderCode = "SL-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    try {
      // 1. We might want to create/update customer (simplified for now to just insert into orders)
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          customer_snapshot, 
          shipping_snapshot, 
          items, 
          subtotal, 
          total, 
          payment_method, 
          idempotency_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertOrder.run(
        JSON.stringify(data.customer),
        JSON.stringify(data.shipping),
        JSON.stringify(data.items),
        data.subtotal,
        data.subtotal, // No tax calculation yet
        data.paymentMethod,
        orderCode
      );

      return { success: true, orderCode, orderId: result.lastInsertRowid };
    } catch (error: any) {
      console.error("Order creation error:", error);
      throw new Error("Error guardando el pedido");
    } finally {
      db.close();
    }
  });

export const listOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = new Database(dbPath);
    try {
      const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50').all();
      return orders;
    } finally {
      db.close();
    }
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number(), status: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const db = new Database(dbPath);
    try {
      db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(data.status, data.id);
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
    } finally {
      db.close();
    }
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const db = new Database(dbPath);
    try {
      db.prepare('DELETE FROM orders WHERE id = ?').run(data.id);
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
    } finally {
      db.close();
    }
  });

export const lookupOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ code: z.string().trim(), email: z.string().trim().email() }).parse(data))
  .handler(async ({ data }) => {
    const db = new Database(dbPath);
    try {
      // Find the order by idempotency_key AND email (extracted from JSON customer_snapshot)
      const query = db.prepare(`
        SELECT * FROM orders 
        WHERE idempotency_key = ? 
        AND json_extract(customer_snapshot, '$.email') = ?
      `);
      
      const order = query.get(data.code.toUpperCase(), data.email.toLowerCase()) as any;
      
      if (!order) return { found: false as const };
      
      return {
        found: true as const,
        order,
      };
    } finally {
      db.close();
    }
  });
