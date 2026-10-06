import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverLogin, serverLogout, validateSession, checkStrictRateLimit, getClientIp } from "./server-auth";

/**
 * Server function: Login
 * Validates credentials on the SERVER and returns a secure token.
 */
export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      username: z.string().min(1).max(50),
      password: z.string().min(1).max(100),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    // Rate limit login attempts (5 per minute)
    if (!checkStrictRateLimit(`login:${getClientIp()}`)) {
      throw new Error("Demasiados intentos. Espera un momento.");
    }

    const token = serverLogin(data.username, data.password);
    if (!token) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    return { success: true, token };
  });

/**
 * Server function: Validate a session token
 */
export const validateAdminSession = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ token: z.string().max(128) }).parse(data)
  )
  .handler(async ({ data }) => {
    return { valid: validateSession(data.token) };
  });

/**
 * Server function: Logout
 */
export const logoutAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ token: z.string() }).parse(data)
  )
  .handler(async ({ data }) => {
    serverLogout(data.token);
    return { success: true };
  });

/**
 * Helper: assert that a token is valid, throw if not.
 * Use this inside any admin-only server function.
 */
export function assertAdmin(token: string | null | undefined): void {
  if (!validateSession(token)) {
    throw new Error("No autorizado. Inicia sesión.");
  }
}
