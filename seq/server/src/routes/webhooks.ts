import { Hono } from "hono";
import { Webhook } from "svix";
import { createDb, type Env } from "@/db";
import { users } from "@/db/schema";

type ClerkUserPayload = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    deleted?: boolean;
  };
};

export const webhooksRoute = new Hono<{ Bindings: Env }>()
  // POST /api/webhooks/clerk  — Clerk user.created / user.updated
  .post("/clerk", async (c) => {
    const secret = c.env.CLERK_WEBHOOK_SECRET;
    if (!secret) return c.json({ error: "Webhook secret тохируулаагүй" }, 500);

    const svixId = c.req.header("svix-id");
    const svixTimestamp = c.req.header("svix-timestamp");
    const svixSignature = c.req.header("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return c.json({ error: "Svix header байхгүй" }, 400);
    }

    const body = await c.req.text();

    let payload: ClerkUserPayload;
    try {
      const wh = new Webhook(secret);
      payload = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkUserPayload;
    } catch {
      return c.json({ error: "Signature буруу" }, 400);
    }

    const { type, data } = payload;

    if (type === "user.created" || type === "user.updated") {
      const email = data.email_addresses[0]?.email_address;
      if (!email) return c.json({ error: "Email байхгүй" }, 400);

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

      const db = createDb(c.env);
      await db
        .insert(users)
        .values({ id: data.id, email, name })
        .onConflictDoUpdate({
          target: users.id,
          set: { email, name },
        });
    }

    if (type === "user.deleted" && data.deleted) {
      const db = createDb(c.env);
      const { eq } = await import("drizzle-orm");
      await db.delete(users).where(eq(users.id, data.id));
    }

    return c.json({ ok: true });
  });
