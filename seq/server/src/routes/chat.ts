import { Hono } from "hono";
import { createDb, type Env } from "@/db";
import {
  conversationIdFor,
  conversationReads,
  conversations,
  messages,
  pairKey,
  users,
} from "@/db/schema";
import { getAuthUser, requireAuth } from "@/middleware/auth";
import { pushToPeer } from "@/lib/push-notify";
import { and, desc, eq, gt, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

const DEFAULT_MESSAGE_LIMIT = 30;
const MAX_MESSAGE_LIMIT = 100;

const PUBLIC_URL_BASE = "https://pub-0b4b208083b74e5293a1ae3ed2fa6ba1.r2.dev";

const ONLINE_THRESHOLD_MS = 90_000; // 1.5 minutes

type PeerSummary = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
};

function isUserOnline(lastSeenAt: Date | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - lastSeenAt.getTime() < ONLINE_THRESHOLD_MS;
}

async function peerFor(
  db: ReturnType<typeof createDb>,
  conv: { userAId: string; userBId: string },
  me: string,
): Promise<PeerSummary | null> {
  const peerId = conv.userAId === me ? conv.userBId : conv.userAId;
  const peer = await db.select().from(users).where(eq(users.id, peerId)).get();
  if (!peer) return null;
  return {
    id: peer.id,
    name: peer.name,
    email: peer.email,
    phone: peer.phone,
    avatarUrl: peer.avatarUrl,
    isOnline: isUserOnline(peer.lastSeenAt),
  };
}

async function senderNamesFor(
  db: ReturnType<typeof createDb>,
  ids: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map();
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(inArray(users.id, unique));
  return new Map(rows.map((u) => [u.id, u.name ?? u.email ?? "Хэрэглэгч"]));
}

const CALL_KINDS = new Set(["call_invite", "call_answered", "call_declined", "call_ended"]);

function userMayAccessVirtualConv(meId: string, convId: string): boolean {
  const slug = meId.slice(0, 12);
  return convId.startsWith("c_") && convId.includes(slug);
}

async function ensureConversation(
  db: ReturnType<typeof createDb>,
  meId: string,
  peerId: string,
) {
  const [userAId, userBId] = pairKey(meId, peerId);
  const id = conversationIdFor(meId, peerId);
  const existing = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  if (existing) return existing;

  return db
    .insert(conversations)
    .values({ id, userAId, userBId, updatedAt: new Date() })
    .returning()
    .get();
}

async function resolveConversation(
  db: ReturnType<typeof createDb>,
  meId: string,
  convId: string,
  peerId?: string,
) {
  const conv = await db.select().from(conversations).where(eq(conversations.id, convId)).get();
  if (conv) {
    if (conv.userAId !== meId && conv.userBId !== meId) return null;
    return conv;
  }
  if (!peerId || conversationIdFor(meId, peerId) !== convId) return null;
  return ensureConversation(db, meId, peerId);
}

async function refreshConversationPreview(
  db: ReturnType<typeof createDb>,
  convId: string,
) {
  const last = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(desc(messages.id))
    .limit(1)
    .get();

  if (!last) {
    await db
      .update(conversations)
      .set({ lastPreview: null, lastAt: null, updatedAt: new Date() })
      .where(eq(conversations.id, convId));
    return;
  }

  const sender = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, last.senderId))
    .get();
  const senderLabel = sender?.name ?? sender?.email ?? "Хэрэглэгч";
  const preview = callPreview(last.kind, senderLabel, last.voiceDurationMs, last.body ?? undefined);

  await db
    .update(conversations)
    .set({ lastPreview: preview, lastAt: last.createdAt, updatedAt: new Date() })
    .where(eq(conversations.id, convId));
}

function callPreview(
  kind: string,
  senderLabel: string,
  callDurationMs: number | null,
  textBody?: string,
): string {
  const audioCall = !!textBody?.endsWith("::audio");
  switch (kind) {
    case "call_invite":
      return audioCall
        ? `📞 ${senderLabel} аудио дуудлага хийлээ`
        : `📹 ${senderLabel} видео дуудлага хийлээ`;
    case "call_answered":
      return `✅ ${senderLabel} хариуллаа`;
    case "call_declined":
      return `📵 ${senderLabel} татгалзлаа`;
    case "call_ended": {
      const sec = Math.floor((callDurationMs ?? 0) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const dur = m > 0 ? `${m} мин ${s} сек` : `${s} сек`;
      return `📞 ${senderLabel} дуусгасан · ${dur}`;
    }
    case "text":
      return textBody?.trim().slice(0, 120) ?? "";
    default:
      return "🎤 Дууны мессеж";
  }
}

export const chatRoute = new Hono<{ Bindings: Env }>()
  .use("*", requireAuth)

  // POST /api/chat/presence — heartbeat to mark user online
  .post("/presence", async (c) => {
    const me = getAuthUser(c);
    const db = createDb(c.env);
    await db
      .update(users)
      .set({ lastSeenAt: new Date() })
      .where(eq(users.id, me.id));
    return c.json({ ok: true });
  })

  // GET /api/chat/users/search?q=
  .get("/users/search", async (c) => {
    const me = getAuthUser(c);
    const q = c.req.query("q")?.trim() ?? "";
    if (q.length < 2) return c.json([]);

    const db = createDb(c.env);
    const like = `%${q.toLowerCase()}%`;
    const digits = q.replace(/\D/g, "");
    const conditions = [
      sql`lower(${users.name}) like ${like}`,
      sql`lower(${users.email}) like ${like}`,
    ];
    if (digits.length >= 4) {
      conditions.push(sql`${users.phone} like ${"%" + digits + "%"}`);
    }

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .where(and(sql`${users.id} != ${me.id}`, or(...conditions)))
      .limit(20);

    return c.json(rows.map((u) => ({ ...u, isOnline: isUserOnline(u.lastSeenAt) })));
  })

  // GET /api/chat/conversations
  .get("/conversations", async (c) => {
    const me = getAuthUser(c);
    const db = createDb(c.env);

    const rows = await db
      .select()
      .from(conversations)
      .where(
        and(
          or(eq(conversations.userAId, me.id), eq(conversations.userBId, me.id)),
          isNotNull(conversations.lastAt),
        ),
      )
      .orderBy(desc(conversations.updatedAt))
      .limit(50);

    // Fetch all read receipts for current user in one query
    const readReceipts = await db
      .select()
      .from(conversationReads)
      .where(eq(conversationReads.userId, me.id));
    const readMap = new Map(readReceipts.map((r) => [r.convId, r.readUntilMsgId]));

    const out = await Promise.all(
      rows.map(async (conv) => {
        const peer = await peerFor(db, conv, me.id);
        const lastMsg = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.id))
          .limit(1)
          .get();

        const readUntil = readMap.get(conv.id);
        const unread = !!lastMsg
          && lastMsg.senderId !== me.id
          && (readUntil === undefined || readUntil < lastMsg.id);

        return {
          id: conv.id,
          peer,
          unread,
          lastPreview: conv.lastPreview,
          lastAt: conv.lastAt?.toISOString() ?? null,
          updatedAt: conv.updatedAt.toISOString(),
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                kind: lastMsg.kind,
                senderId: lastMsg.senderId,
                body: lastMsg.body,
                voiceDurationMs: lastMsg.voiceDurationMs,
                createdAt: lastMsg.createdAt.toISOString(),
              }
            : null,
        };
      }),
    );

    return c.json(out.filter((x) => x.peer));
  })

  // POST /api/chat/conversations/:id/read — mark conversation as read
  .post("/conversations/:id/read", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");
    const db = createDb(c.env);

    const conv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .get();
    if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id)) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const lastMsg = await db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(desc(messages.id))
      .limit(1)
      .get();

    if (!lastMsg) return c.json({ ok: true });

    await db
      .insert(conversationReads)
      .values({ userId: me.id, convId, readUntilMsgId: lastMsg.id })
      .onConflictDoUpdate({
        target: [conversationReads.userId, conversationReads.convId],
        set: { readUntilMsgId: lastMsg.id },
      });

    return c.json({ ok: true });
  })

  // POST /api/chat/conversations  { peerId }
  .post("/conversations", async (c) => {
    const me = getAuthUser(c);
    const body = await c.req.json<{ peerId?: string }>();
    if (!body.peerId || body.peerId === me.id) {
      return c.json({ error: "peerId буруу" }, 400);
    }

    const db = createDb(c.env);
    const peer = await db.select().from(users).where(eq(users.id, body.peerId)).get();
    if (!peer) return c.json({ error: "Хэрэглэгч олдсонгүй" }, 404);

    const id = conversationIdFor(me.id, body.peerId);

    const existing = await db.select().from(conversations).where(eq(conversations.id, id)).get();
    const peerSummary = existing
      ? await peerFor(db, existing, me.id)
      : {
          id: peer.id,
          name: peer.name,
          email: peer.email,
          phone: peer.phone,
          avatarUrl: peer.avatarUrl,
        };

    return c.json({ id: existing?.id ?? id, peer: peerSummary });
  })

  // GET /api/chat/pending-calls — lightweight poll for incoming call invites
  .get("/pending-calls", async (c) => {
    const me = getAuthUser(c);
    const db = createDb(c.env);
    const cutoff = new Date(Date.now() - 120_000);

    const rows = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.userAId, me.id), eq(conversations.userBId, me.id)));

    const pending: {
      conversationId: string;
      peer: PeerSummary;
      messageId: number;
      roomId: string;
      createdAt: string;
    }[] = [];

    for (const conv of rows) {
      const lastMsg = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.id))
        .limit(1)
        .get();

      if (
        lastMsg?.kind === "call_invite" &&
        lastMsg.senderId !== me.id &&
        lastMsg.createdAt >= cutoff
      ) {
        const peer = await peerFor(db, conv, me.id);
        if (peer) {
          pending.push({
            conversationId: conv.id,
            peer,
            messageId: lastMsg.id,
            roomId: lastMsg.body ?? conv.id,
            createdAt: lastMsg.createdAt.toISOString(),
          });
        }
      }
    }

    pending.sort((a, b) => b.messageId - a.messageId);
    return c.json(pending);
  })

  // GET /api/chat/conversations/:id/messages?afterId= | ?beforeId= | ?limit=
  .get("/conversations/:id/messages", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");
    const afterId = Number(c.req.query("afterId") ?? "0");
    const beforeId = Number(c.req.query("beforeId") ?? "0");
    const limit = Math.min(
      Math.max(Number(c.req.query("limit") ?? DEFAULT_MESSAGE_LIMIT), 1),
      MAX_MESSAGE_LIMIT,
    );

    const db = createDb(c.env);
    const conv = await db.select().from(conversations).where(eq(conversations.id, convId)).get();
    if (!conv) {
      if (!userMayAccessVirtualConv(me.id, convId)) {
        return c.json({ error: "Хандах эрхгүй" }, 403);
      }
      return c.json([]);
    }
    if (conv.userAId !== me.id && conv.userBId !== me.id) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    let rows;
    if (afterId > 0) {
      rows = await db
        .select()
        .from(messages)
        .where(and(eq(messages.conversationId, convId), gt(messages.id, afterId)))
        .orderBy(messages.id)
        .limit(MAX_MESSAGE_LIMIT);
    } else if (beforeId > 0) {
      rows = await db
        .select()
        .from(messages)
        .where(and(eq(messages.conversationId, convId), lt(messages.id, beforeId)))
        .orderBy(desc(messages.id))
        .limit(limit);
    } else {
      rows = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, convId))
        .orderBy(desc(messages.id))
        .limit(limit);
    }

    const sorted = afterId > 0 ? rows : [...rows].reverse();
    const names = await senderNamesFor(
      db,
      sorted.map((m) => m.senderId),
    );

    return c.json(
      sorted.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: names.get(m.senderId) ?? "Хэрэглэгч",
        kind: m.kind,
        body: m.body,
        voiceUrl: m.voiceUrl,
        voiceDurationMs: m.voiceDurationMs,
        createdAt: m.createdAt.toISOString(),
        mine: m.senderId === me.id,
      })),
    );
  })

  // POST /api/chat/conversations/:id/messages  { kind, body? }
  .post("/conversations/:id/messages", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");
    const body = await c.req.json<{ kind?: string; body?: string; durationMs?: number; peerId?: string }>();

    const kind = body.kind as
      | "text"
      | "call_invite"
      | "call_ended"
      | "call_declined"
      | "call_answered"
      | undefined;
    if (!kind) {
      return c.json({ error: "kind шаардлагатай" }, 400);
    }
    if (kind === "text" && !body.body?.trim()) {
      return c.json({ error: "body шаардлагатай" }, 400);
    }
    if (kind === "call_ended" && (body.durationMs == null || body.durationMs < 0)) {
      return c.json({ error: "durationMs шаардлагатай" }, 400);
    }

    const db = createDb(c.env);
    const conv = await resolveConversation(db, me.id, convId, body.peerId);
    if (!conv) {
      return c.json({ error: body.peerId ? "Хандах эрхгүй" : "peerId шаардлагатай" }, body.peerId ? 403 : 400);
    }

    const meRow = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, me.id))
      .get();
    const senderLabel = meRow?.name ?? meRow?.email ?? "Хэрэглэгч";
    const callDurationMs = kind === "call_ended" ? Math.round(body.durationMs!) : null;
    const preview = callPreview(kind, senderLabel, callDurationMs, body.body);

    const inserted = await db
      .insert(messages)
      .values({
        conversationId: convId,
        senderId: me.id,
        kind,
        body: body.body?.trim() ?? null,
        voiceDurationMs: callDurationMs,
      })
      .returning()
      .get();

    await db
      .update(conversations)
      .set({ lastPreview: preview, lastAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, convId));

    pushToPeer(c.env, conv, me.id, {
      type: "chat",
      conversationId: convId,
      messageId: inserted.id,
      kind: inserted.kind,
    });

    return c.json(
      {
        id: inserted.id,
        conversationId: inserted.conversationId,
        senderId: inserted.senderId,
        senderName: senderLabel,
        kind: inserted.kind,
        body: inserted.body,
        voiceUrl: inserted.voiceUrl,
        voiceDurationMs: inserted.voiceDurationMs,
        createdAt: inserted.createdAt.toISOString(),
        mine: true,
      },
      201,
    );
  })

  // PATCH /api/chat/conversations/:id/messages/:msgId  { body }
  .patch("/conversations/:id/messages/:msgId", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");
    const msgId = Number(c.req.param("msgId"));
    const body = await c.req.json<{ body?: string }>();

    if (!body.body?.trim()) {
      return c.json({ error: "body шаардлагатай" }, 400);
    }

    const db = createDb(c.env);
    const conv = await db.select().from(conversations).where(eq(conversations.id, convId)).get();
    if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id)) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const msg = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, msgId), eq(messages.conversationId, convId)))
      .get();
    if (!msg) return c.json({ error: "Мессеж олдсонгүй" }, 404);
    if (msg.kind !== "text") return c.json({ error: "Зөвхөн текст засна" }, 400);
    if (msg.senderId !== me.id) return c.json({ error: "Зөвхөн өөрийн мессеж" }, 403);

    const updated = await db
      .update(messages)
      .set({ body: body.body.trim() })
      .where(eq(messages.id, msgId))
      .returning()
      .get();

    await refreshConversationPreview(db, convId);

    const senderLabel = (await db.select().from(users).where(eq(users.id, me.id)).get())?.name
      ?? me.email
      ?? "Хэрэглэгч";

    pushToPeer(c.env, conv, me.id, {
      type: "chat",
      conversationId: convId,
      messageId: updated.id,
      kind: updated.kind,
    });

    return c.json({
      id: updated.id,
      conversationId: updated.conversationId,
      senderId: updated.senderId,
      senderName: senderLabel,
      kind: updated.kind,
      body: updated.body,
      voiceUrl: updated.voiceUrl,
      voiceDurationMs: updated.voiceDurationMs,
      createdAt: updated.createdAt.toISOString(),
      mine: true,
    });
  })

  // DELETE /api/chat/conversations/:id/messages/:msgId
  .delete("/conversations/:id/messages/:msgId", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");
    const msgId = Number(c.req.param("msgId"));

    const db = createDb(c.env);
    const conv = await db.select().from(conversations).where(eq(conversations.id, convId)).get();
    if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id)) {
      return c.json({ error: "Хандах эрхгүй" }, 403);
    }

    const msg = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, msgId), eq(messages.conversationId, convId)))
      .get();
    if (!msg) return c.json({ error: "Мессеж олдсонгүй" }, 404);

    const isCall = CALL_KINDS.has(msg.kind);
    if (!isCall && msg.senderId !== me.id) {
      return c.json({ error: "Зөвхөн өөрийн мессеж устгана" }, 403);
    }

    await db.delete(messages).where(eq(messages.id, msgId));
    await refreshConversationPreview(db, convId);

    pushToPeer(c.env, conv, me.id, {
      type: "chat",
      conversationId: convId,
      messageId: msgId,
      kind: msg.kind,
    });

    return c.json({ ok: true });
  })

  // POST /api/chat/conversations/:id/voice  multipart: file, durationMs
  .post("/conversations/:id/voice", async (c) => {
    const me = getAuthUser(c);
    const convId = c.req.param("id");

    const db = createDb(c.env);
    const form = await c.req.formData();
    const file = form.get("file") as File | null;
    const durationMs = Number(form.get("durationMs") ?? "0");
    const peerId = (form.get("peerId") as string | null) ?? undefined;

    const conv = await resolveConversation(db, me.id, convId, peerId);
    if (!conv) {
      return c.json({ error: peerId ? "Хандах эрхгүй" : "peerId шаардлагатай" }, peerId ? 403 : 400);
    }
    if (!file) return c.json({ error: "file шаардлагатай" }, 400);

    const ext = file.name.split(".").pop() ?? "webm";
    const r2Key = `voice/${convId}/${Date.now()}.${ext}`;
    await c.env.BUCKET.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type || "audio/webm" },
    });
    const voiceUrl = `${PUBLIC_URL_BASE}/${r2Key}`;

    const inserted = await db
      .insert(messages)
      .values({
        conversationId: convId,
        senderId: me.id,
        kind: "voice",
        voiceUrl,
        voiceDurationMs: durationMs || null,
      })
      .returning()
      .get();

    await db
      .update(conversations)
      .set({ lastPreview: "🎤 Дууны мессеж", lastAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, convId));

    pushToPeer(c.env, conv, me.id, {
      type: "chat",
      conversationId: convId,
      messageId: inserted.id,
      kind: "voice",
    });

    return c.json(
      {
        id: inserted.id,
        conversationId: inserted.conversationId,
        senderId: inserted.senderId,
        kind: inserted.kind,
        body: inserted.body,
        voiceUrl: inserted.voiceUrl,
        voiceDurationMs: inserted.voiceDurationMs,
        createdAt: inserted.createdAt.toISOString(),
        mine: true,
      },
      201,
    );
  });
