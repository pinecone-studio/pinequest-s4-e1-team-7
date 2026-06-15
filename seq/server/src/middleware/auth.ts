import type { Context, Next } from "hono";
import type { Env } from "@/db";
import { verifyJwt } from "@/lib/crypto";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
};

export type AuthEnv = { Bindings: Env; Variables: { user: AuthUser } };

export async function requireAuth(c: Context<AuthEnv>, next: Next) {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return c.json({ error: "Нэвтрээгүй" }, 401);

  const secret = c.env.JWT_SECRET ?? "dev-sign-bridge-secret-change-me";
  const user = await verifyJwt(token, secret);
  if (!user) return c.json({ error: "Token хүчингүй" }, 401);

  c.set("user", {
    id: user.sub,
    email: user.email,
    name: user.name,
    phone: user.phone,
  } satisfies AuthUser);

  await next();
}

export function getAuthUser(c: Context<AuthEnv>): AuthUser {
  return c.get("user");
}
