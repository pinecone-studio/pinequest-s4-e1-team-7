import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { users, translations } from "@/db/schema";
import { eq, desc, sum, count } from "drizzle-orm";

export const usersRoute = new Hono<{ Bindings: Env }>()
  // GET /api/users
  .get("/", async (c) => {
    const db = createDb(c.env);
    const all = await db.select().from(users);
    return c.json(all);
  })

  // GET /api/users/:id
  .get("/:id", async (c) => {
    const db = createDb(c.env);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, c.req.param("id")))
      .get();
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json(user);
  })

  // GET /api/users/:id/stats  → { words, sessions }
  .get("/:id/stats", async (c) => {
    const db = createDb(c.env);
    const userId = c.req.param("id");

    const result = await db
      .select({
        sessions: count(translations.id),
        words: sum(translations.wordCount),
      })
      .from(translations)
      .where(eq(translations.userId, userId))
      .get();

    return c.json({
      sessions: result?.sessions ?? 0,
      words: Number(result?.words ?? 0),
    });
  })

  // GET /api/users/:id/history?limit=10  → HistoryEntry[]
  .get("/:id/history", async (c) => {
    const db = createDb(c.env);
    const userId = c.req.param("id");
    const limit = Math.min(Number(c.req.query("limit") ?? "10"), 100);

    const rows = await db
      .select({
        id: translations.id,
        kind: translations.kind,
        text: translations.text,
        createdAt: translations.createdAt,
      })
      .from(translations)
      .where(eq(translations.userId, userId))
      .orderBy(desc(translations.createdAt))
      .limit(limit);

    return c.json(
      rows.map((r) => ({
        id: String(r.id),
        kind: r.kind,
        text: r.text,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  })

  // POST /api/users  — upsert (Clerk ID дээр суурилна)
  .post("/", async (c) => {
    const db = createDb(c.env);
    const body = await c.req.json<{ id: string; email: string; name?: string }>();

    if (!body.id || !body.email) {
      return c.json({ error: "id, email шаардлагатай" }, 400);
    }

    const upserted = await db
      .insert(users)
      .values({ id: body.id, email: body.email, name: body.name ?? null })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: body.email, name: body.name ?? null },
      })
      .returning()
      .get();

    return c.json(upserted, 201);
  });
