import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { feedback, users } from "@/db/schema";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { requireAuth, getAuthUser } from "@/middleware/auth";

type Variables = { user: { id: string; email: string; name: string; phone: string } };

export const feedbackRoute = new Hono<{ Bindings: Env; Variables: Variables }>()

  // POST /api/feedback — нэвтэрсэн хэрэглэгч санал илгээнэ
  .post("/", requireAuth, async (c) => {
    const db = createDb(c.env);
    const authUser = getAuthUser(c);

    const body = await c.req.json<{
      overallRating: number;
      featureRatings: { translator: number; call: number; voice: number; dict: number };
      improveSelected: string[];
      recommend: "yes" | "maybe" | "no";
      comment?: string;
    }>();

    if (!body.overallRating || body.overallRating < 1 || body.overallRating > 5) {
      return c.json({ error: "overallRating 1–5 байх ёстой" }, 400);
    }
    if (!["yes", "maybe", "no"].includes(body.recommend)) {
      return c.json({ error: "recommend утга буруу" }, 400);
    }

    const row = await db
      .insert(feedback)
      .values({
        userId: authUser.id,
        overallRating: body.overallRating,
        ratingTranslator: body.featureRatings?.translator || null,
        ratingCall: body.featureRatings?.call || null,
        ratingVoice: body.featureRatings?.voice || null,
        ratingDict: body.featureRatings?.dict || null,
        improveSelected: JSON.stringify(body.improveSelected ?? []),
        recommend: body.recommend,
        comment: body.comment?.trim() || null,
      })
      .returning()
      .get();

    return c.json(row, 201);
  })

  // GET /api/feedback — admin email шалгана
  .get("/", requireAuth, async (c) => {
    const db = createDb(c.env);
    const authUser = getAuthUser(c);
    const adminEmail = c.env.ADMIN_EMAIL;

    if (!adminEmail || authUser.email !== adminEmail) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const rows = await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        userName: users.name,
        userEmail: users.email,
        overallRating: feedback.overallRating,
        ratingTranslator: feedback.ratingTranslator,
        ratingCall: feedback.ratingCall,
        ratingVoice: feedback.ratingVoice,
        ratingDict: feedback.ratingDict,
        improveSelected: feedback.improveSelected,
        recommend: feedback.recommend,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(desc(feedback.createdAt));

    const stats = await db
      .select({
        total: count(feedback.id),
        avgOverall: avg(feedback.overallRating),
        avgTranslator: avg(feedback.ratingTranslator),
        avgCall: avg(feedback.ratingCall),
        avgVoice: avg(feedback.ratingVoice),
        avgDict: avg(feedback.ratingDict),
        countYes:   sql<number>`sum(case when ${feedback.recommend} = 'yes'   then 1 else 0 end)`,
        countMaybe: sql<number>`sum(case when ${feedback.recommend} = 'maybe' then 1 else 0 end)`,
        countNo:    sql<number>`sum(case when ${feedback.recommend} = 'no'    then 1 else 0 end)`,
      })
      .from(feedback)
      .get();

    return c.json({
      stats: {
        total:          stats?.total ?? 0,
        avgOverall:     Number(stats?.avgOverall ?? 0).toFixed(2),
        avgTranslator:  Number(stats?.avgTranslator ?? 0).toFixed(2),
        avgCall:        Number(stats?.avgCall ?? 0).toFixed(2),
        avgVoice:       Number(stats?.avgVoice ?? 0).toFixed(2),
        avgDict:        Number(stats?.avgDict ?? 0).toFixed(2),
        countYes:       stats?.countYes   ?? 0,
        countMaybe:     stats?.countMaybe ?? 0,
        countNo:        stats?.countNo    ?? 0,
      },
      rows: rows.map((r) => ({
        ...r,
        improveSelected: JSON.parse(r.improveSelected ?? "[]") as string[],
        createdAt: r.createdAt.toISOString(),
      })),
    });
  });
