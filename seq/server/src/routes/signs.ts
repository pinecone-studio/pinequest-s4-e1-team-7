import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { signs } from "@/db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_URL_BASE = "https://pub-0b4b208083b74e5293a1ae3ed2fa6ba1.r2.dev";

export const signsRoute = new Hono<{ Bindings: Env }>()
  // GET /signs              — бүх дохио
  // GET /signs?category=alphabet — зөвхөн цагаан толгой
  // GET /signs?category=number   — зөвхөн тоонууд
  .get("/", async (c) => {
    const db = createDb(c.env);
    const category = c.req.query("category") as "alphabet" | "number" | undefined;
    const query = db.select().from(signs);
    const result = category
      ? await query.where(eq(signs.category, category))
      : await query;
    return c.json(result);
  })

  // GET /signs/:id
  .get("/:id", async (c) => {
    const db = createDb(c.env);
    const sign = await db
      .select()
      .from(signs)
      .where(eq(signs.id, Number(c.req.param("id"))))
      .get();
    if (!sign) return c.json({ error: "Not found" }, 404);
    return c.json(sign);
  })

  // POST /signs/upload
  // Content-Type: multipart/form-data
  // fields: file (File), label (string), category ("alphabet" | "number")
  .post("/upload", async (c) => {
    const db = createDb(c.env);
    const formData = await c.req.formData();

    const file = formData.get("file") as File | null;
    const label = formData.get("label") as string | null;
    const category = formData.get("category") as "alphabet" | "number" | null;

    if (!file || !label || !category) {
      return c.json({ error: "file, label, category шаардлагатай" }, 400);
    }

    const ext = file.name.split(".").pop() ?? "png";
    const r2Key = `signs/${category}/${label}.${ext}`;

    await c.env.BUCKET.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const url = `${PUBLIC_URL_BASE}/signs/${category}/${encodeURIComponent(label)}.${ext}`;

    const inserted = await db
      .insert(signs)
      .values({ label, category, r2Key, url })
      .onConflictDoUpdate({ target: signs.r2Key, set: { url, label, category } })
      .returning()
      .get();

    return c.json(inserted, 201);
  })

  // DELETE /signs/:id
  .delete("/:id", async (c) => {
    const db = createDb(c.env);
    const sign = await db
      .select()
      .from(signs)
      .where(eq(signs.id, Number(c.req.param("id"))))
      .get();
    if (!sign) return c.json({ error: "Not found" }, 404);

    await c.env.BUCKET.delete(sign.r2Key);
    await db.delete(signs).where(eq(signs.id, sign.id));

    return c.json({ ok: true });
  });
