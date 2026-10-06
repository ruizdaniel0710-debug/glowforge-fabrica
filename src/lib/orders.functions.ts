import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { dbRun, dbAll, dbGet, dbLastId } from "./db";
import { Resend } from "resend";
import { assertAdmin } from "./auth.functions";
import { checkRateLimit, getClientIp } from "./server-auth";
import crypto from "crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Validate the input from the checkout form
const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone: z.string().min(1).max(30),
  }),
  shipping: z.object({
    address: z.string().min(1).max(300),
    city: z.string().min(1).max(100),
    department: z.string().max(100).optional(),
  }),
  paymentMethod: z.string().min(1).max(50),
  items: z.array(z.object({
    id: z.string().max(100),
    name: z.string().max(200),
    price: z.number().min(0).max(999999999),
    quantity: z.number().min(1).max(100),
    color: z.string().max(20).nullable().optional(),
    size: z.string().max(50).nullable().optional(),
    files: z.array(z.object({
      name: z.string().max(200),
      path: z.string().max(400),
      size: z.number().nonnegative(),
    })).max(5).optional(),
    externalLink: z.string().max(500).optional(),
  })).min(1).max(50),
  subtotal: z.number().min(0).max(999999999),
});

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    // Rate limit: max 5 orders per minute per IP
    if (!checkRateLimit(`create-order:${getClientIp()}`, 5, 60_000)) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }

    const orderCode = "SL-" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();

    // Sanitize HTML in customer name to prevent XSS in emails
    const safeName = data.customer.name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    try {
      await dbRun(`
        INSERT INTO orders (
          customer_snapshot, 
          shipping_snapshot, 
          items, 
          subtotal, 
          total, 
          payment_method, 
          idempotency_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        JSON.stringify(data.customer),
        JSON.stringify(data.shipping),
        JSON.stringify(data.items),
        data.subtotal,
        data.subtotal,
        data.paymentMethod,
        orderCode
      ]);

      const orderId = await dbLastId();

      if (resend) {
        resend.emails.send({
          from: 'SNAKELAB <ventas@snakelab.site>',
          to: data.customer.email.toLowerCase(),
          subject: `Confirmaci\u00f3n de Pedido - #${orderCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #7c3aed;">\u00a1Gracias por tu compra, ${safeName}!</h2>
              <p>Hemos recibido tu pedido correctamente. Estamos preparando todo para que llegue pronto.</p>
              <p>Tu c\u00f3digo de pedido es: <strong>${orderCode}</strong></p>
              <p>Puedes rastrear el estado de tu pedido en cualquier momento ingresando tu correo y este c\u00f3digo en nuestra p\u00e1gina de <a href="https://snakelab.site/seguimiento">Seguimiento</a>.</p>
              <br/>
              <p>Si elegiste un m\u00e9todo de pago manual (Nequi/Bancolombia), recuerda enviarnos el comprobante a nuestro WhatsApp citando tu n\u00famero de pedido.</p>
              <p>\u00a1Gracias por apoyar la impresi\u00f3n 3D local!</p>
            </div>
          `
        }).catch(console.error);
      }

      return { success: true, orderCode, orderId };
    } catch (error: any) {
      console.error("Order creation error:", error);
      throw new Error("Error guardando el pedido");
    }
  });

export const listOrders = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ _adminToken: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    return await dbAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number(), status: z.string().max(50), _adminToken: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [data.status, data.id]);
      return { success: true };
    } catch (e: any) {
      console.error("updateOrderStatus error:", e);
      throw new Error("Error actualizando el pedido.");
    }
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number(), _adminToken: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data._adminToken);
    try {
      await dbRun('DELETE FROM orders WHERE id = ?', [data.id]);
      return { success: true };
    } catch (e: any) {
      console.error("deleteOrder error:", e);
      throw new Error("Error eliminando el pedido.");
    }
  });

export const lookupOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ code: z.string().trim().max(40), email: z.string().trim().email().max(255) }).parse(data))
  .handler(async ({ data }) => {
    if (!checkRateLimit(`lookup-order:${getClientIp()}`, 15, 60_000)) {
      throw new Error("Demasiadas consultas. Intenta en un momento.");
    }
    const order = await dbGet(`
      SELECT * FROM orders 
      WHERE idempotency_key = ? 
      AND json_extract(customer_snapshot, '$.email') = ?
    `, [data.code.toUpperCase(), data.email.toLowerCase()]);
    
    if (!order) return { found: false as const };
    
    return {
      found: true as const,
      order,
    };
  });
