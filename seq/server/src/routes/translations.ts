import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { translations, countWords } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const translationsRoute = new Hono<{ Bindings: Env }>()
  // POST /api/translations  — { userId, kind, text }
  .post("/", async (c) => {
    const db = createDb(c.env);
    const body = await c.req.json<{ userId: string; kind: "sign" | "voice"; text: string }>();

    if (!body.userId || !body.kind || !body.text) {
      return c.json({ error: "userId, kind, text шаардлагатай" }, 400);
    }

    const inserted = await db
      .insert(translations)
      .values({
        userId: body.userId,
        kind: body.kind,
        text: body.text,
        wordCount: countWords(body.text),
      })
      .returning()
      .get();

    return c.json(inserted, 201);
  })

  // GET /api/translations?userId=xxx  — (admin / debug)
  .get("/", async (c) => {
    const db = createDb(c.env);
    const userId = c.req.query("userId");
    const query = db.select().from(translations).orderBy(desc(translations.createdAt));
    const result = userId
      ? await query.where(eq(translations.userId, userId))
      : await query;
    return c.json(result);
  });
