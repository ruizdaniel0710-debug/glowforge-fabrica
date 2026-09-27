import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { dbRun, dbAll, dbGet, dbLastId } from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    // Generate an idempotency key (also works as tracking code)
    const orderCode = "SL-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

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
        data.subtotal, // No tax calculation yet
        data.paymentMethod,
        orderCode
      ]);

      const orderId = await dbLastId();

      resend.emails.send({
        from: 'SNAKELAB <ventas@snakelab.site>',
        to: data.customer.email.toLowerCase(),
        subject: `Confirmación de Pedido - #${orderCode}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #7c3aed;">¡Gracias por tu compra, ${data.customer.name}!</h2>
            <p>Hemos recibido tu pedido correctamente. Estamos preparando todo para que llegue pronto.</p>
            <p>Tu código de pedido es: <strong>${orderCode}</strong></p>
            <p>Puedes rastrear el estado de tu pedido en cualquier momento ingresando tu correo y este código en nuestra página de <a href="https://snakelab.site/seguimiento">Seguimiento</a>.</p>
            <br/>
            <p>Si elegiste un método de pago manual (Nequi/Bancolombia), recuerda enviarnos el comprobante a nuestro WhatsApp citando tu número de pedido.</p>
            <p>¡Gracias por apoyar la impresión 3D local!</p>
          </div>
        `
      }).catch(console.error);

      return { success: true, orderCode, orderId };
    } catch (error: any) {
      console.error("Order creation error:", error);
      throw new Error("Error guardando el pedido");
    }
  });

export const listOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    return await dbAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number(), status: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      await dbRun('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [data.status, data.id]);
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
    }
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number() }).parse(data))
  .handler(async ({ data }) => {
    try {
      await dbRun('DELETE FROM orders WHERE id = ?', [data.id]);
      return { success: true };
    } catch (e: any) {
      throw new Error(e.message);
    }
  });

export const lookupOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ code: z.string().trim(), email: z.string().trim().email() }).parse(data))
  .handler(async ({ data }) => {
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
