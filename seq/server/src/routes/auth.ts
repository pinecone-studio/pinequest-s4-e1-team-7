import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signJwt, verifyPassword } from "@/lib/crypto";
import { getAuthUser, requireAuth } from "@/middleware/auth";

const PUBLIC_URL_BASE = "https://pub-0b4b208083b74e5293a1ae3ed2fa6ba1.r2.dev";

const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

function userPayload(user: {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}

export const authRoute = new Hono<{ Bindings: Env }>()
  .post("/register", async (c) => {
    try {
    const body = await c.req.json<{
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    }>();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = normalizePhone(body.phone ?? "");
    const password = body.password ?? "";

    if (!name || !email || !phone || password.length < 6) {
      return c.json({ error: "Нэр, email, утас, нууц үг (6+) шаардлагатай" }, 400);
    }

    const db = createDb(c.env);
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (existing) return c.json({ error: "Email бүртгэлтэй байна" }, 409);

    const phoneHit = await db.select().from(users).where(eq(users.phone, phone)).get();
    if (phoneHit) return c.json({ error: "Утас бүртгэлтэй байна" }, 409);

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    const user = await db
      .insert(users)
      .values({ id, email, phone, name, passwordHash })
      .returning()
      .get();

    const secret = c.env.JWT_SECRET ?? "dev-sign-bridge-secret-change-me";
    const token = await signJwt(
      { sub: user.id, email: user.email, name: user.name, phone: user.phone },
      secret,
    );

    return c.json(
      {
        token,
        user: userPayload(user),
      },
      201,
    );
    } catch (err) {
      console.error("[auth/register]", err);
      return c.json({ error: (err as Error).message ?? "Server error" }, 500);
    }
  })

  .post("/login", async (c) => {
    const body = await c.req.json<{ login?: string; password?: string }>();
    const login = body.login?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    if (!login || !password) return c.json({ error: "Нэвтрэх нэр, нууц үг шаардлагатай" }, 400);

    const db = createDb(c.env);
    const phone = normalizePhone(login);
    const user =
      (await db.select().from(users).where(eq(users.email, login)).get()) ??
      (phone ? await db.select().from(users).where(eq(users.phone, phone)).get() : null);

    if (!user?.passwordHash) return c.json({ error: "Бүртгэл олдсонгүй" }, 401);
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return c.json({ error: "Нууц үг буруу" }, 401);

    const secret = c.env.JWT_SECRET ?? "dev-sign-bridge-secret-change-me";
    const token = await signJwt(
      {
        sub: user.id,
        email: user.email,
        name: user.name ?? "",
        phone: user.phone ?? "",
      },
      secret,
    );

    return c.json({
      token,
      user: userPayload(user),
    });
  })

  .get("/me", requireAuth, async (c) => {
    const auth = getAuthUser(c);
    const db = createDb(c.env);
    const user = await db.select().from(users).where(eq(users.id, auth.id)).get();
    if (!user) return c.json({ error: "Олдсонгүй" }, 404);
    return c.json(userPayload(user));
  })

  .post("/avatar", requireAuth, async (c) => {
    const me = getAuthUser(c);
    const form = await c.req.formData();
    const file = form.get("file") as File | null;
    if (!file) return c.json({ error: "file шаардлагатай" }, 400);
    if (file.size > 5 * 1024 * 1024) return c.json({ error: "5MB-аас их файл" }, 400);

    const mime = file.type || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
      return c.json({ error: "Зөвхөн JPG, PNG, WEBP" }, 400);
    }

    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const r2Key = `avatars/${me.id}.${ext}`;

    const db = createDb(c.env);
    await c.env.BUCKET.put(r2Key, file.stream(), {
      httpMetadata: { contentType: mime },
    });

    const avatarUrl = `${PUBLIC_URL_BASE}/${r2Key}`;
    const updated = await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, me.id))
      .returning()
      .get();

    return c.json(userPayload(updated));
  })

  .patch("/profile", requireAuth, async (c) => {
    const me = getAuthUser(c);
    const body = await c.req.json<{ name?: string; phone?: string }>();

    const name = body.name?.trim();
    const phone = body.phone != null ? normalizePhone(body.phone) : undefined;

    if (!name) return c.json({ error: "Нэр шаардлагатай" }, 400);
    if (phone !== undefined && phone.length < 8) {
      return c.json({ error: "Утасны дугаар буруу" }, 400);
    }

    const db = createDb(c.env);

    if (phone) {
      const phoneHit = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .get();
      if (phoneHit && phoneHit.id !== me.id) {
        return c.json({ error: "Утас бүртгэлтэй байна" }, 409);
      }
    }

    const updated = await db
      .update(users)
      .set({
        name,
        ...(phone !== undefined ? { phone: phone || null } : {}),
      })
      .where(eq(users.id, me.id))
      .returning()
      .get();

    return c.json(userPayload(updated));
  });
