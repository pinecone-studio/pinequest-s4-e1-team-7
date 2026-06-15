import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import { feedback, feedbackConfig, users } from "@/db/schema";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { requireAuth, getAuthUser, type AuthEnv } from "@/middleware/auth";

export type FeedbackConfig = {
  q1Title: string;
  q2Title: string;
  features: { id: string; label: string }[];
  q3Title: string;
  improveOptions: string[];
  q4Title: string;
  q5Title: string;
};

export const DEFAULT_CONFIG: FeedbackConfig = {
  q1Title: "Та Sign Bridge платформыг хэрхэн үнэлэх вэ?",
  q2Title: "Дараах функцуудыг тус тусад нь үнэлнэ үү",
  features: [
    { id: "translator", label: "Дохионы хэл хөрвүүлэг" },
    { id: "call",       label: "Видео дуудлага, чат" },
    { id: "voice",      label: "Ярианы хөрвүүлэг" },
    { id: "dict",       label: "Дохионы толь бичиг" },
  ],
  q3Title: "Цаашид юуг сайжруулбал зүгээр гэж бодож байна?",
  improveOptions: [
    "Дохио таних нарийвчлалыг нэмэгдүүлэх",
    "Дуудлага хийх үеийн гацалт",
    "Интерфейсийг хялбарчлах",
    "Аппын хурд, гүйцэтгэл",
    "Монгол дохионы тайлбар толийг өргөжүүлэх",
    "Хэрэглэгчийн гарын авлага, сургалт нэмэх",
  ],
  q4Title: "Та энэхүү платформыг найз нөхөд, ойр дотны хүндээ санал болгох уу?",
  q5Title: "Та доорх хэсэгт нэмэлтээр сайжруулах зүйлсийн санал хүсэлт болон сэтгэгдлээ хуваалцана уу?",
};

function isAdmin(env: Env, email: string): boolean {
  const raw = env.ADMIN_EMAIL ?? "";
  return raw.split(",").map((s) => s.trim()).includes(email);
}

async function loadConfig(env: Env): Promise<FeedbackConfig> {
  const db = createDb(env);
  const row = await db.select().from(feedbackConfig).where(eq(feedbackConfig.id, 1)).get();
  if (!row) return DEFAULT_CONFIG;
  try {
    return JSON.parse(row.config) as FeedbackConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export const feedbackRoute = new Hono<AuthEnv>()

  // GET /api/feedback/config — нийтэд нээлттэй
  .get("/config", async (c) => {
    const cfg = await loadConfig(c.env);
    return c.json(cfg);
  })

  // PUT /api/feedback/config — зөвхөн admin
  .put("/config", requireAuth, async (c) => {
    const authUser = getAuthUser(c);
    if (!isAdmin(c.env, authUser.email)) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const body = await c.req.json<FeedbackConfig>();
    if (!body.q1Title || !body.features?.length || !body.improveOptions?.length) {
      return c.json({ error: "Config дутуу байна" }, 400);
    }

    const db = createDb(c.env);
    await db
      .insert(feedbackConfig)
      .values({ id: 1, config: JSON.stringify(body), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: feedbackConfig.id,
        set: { config: JSON.stringify(body), updatedAt: new Date() },
      });

    return c.json({ ok: true });
  })

  // POST /api/feedback — нэвтэрсэн хэрэглэгч санал илгээнэ
  .post("/", requireAuth, async (c) => {
    const db = createDb(c.env);
    const authUser = getAuthUser(c);

    const body = await c.req.json<{
      overallRating: number;
      featureRatings: Record<string, number>;
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

  // GET /api/feedback — зөвхөн admin
  .get("/", requireAuth, async (c) => {
    const authUser = getAuthUser(c);
    if (!isAdmin(c.env, authUser.email)) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const db = createDb(c.env);

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
        total:         stats?.total ?? 0,
        avgOverall:    Number(stats?.avgOverall ?? 0).toFixed(2),
        avgTranslator: Number(stats?.avgTranslator ?? 0).toFixed(2),
        avgCall:       Number(stats?.avgCall ?? 0).toFixed(2),
        avgVoice:      Number(stats?.avgVoice ?? 0).toFixed(2),
        avgDict:       Number(stats?.avgDict ?? 0).toFixed(2),
        countYes:      stats?.countYes   ?? 0,
        countMaybe:    stats?.countMaybe ?? 0,
        countNo:       stats?.countNo    ?? 0,
      },
      rows: rows.map((r) => ({
        ...r,
        improveSelected: JSON.parse(r.improveSelected ?? "[]") as string[],
        createdAt: r.createdAt.toISOString(),
      })),
    });
  });
