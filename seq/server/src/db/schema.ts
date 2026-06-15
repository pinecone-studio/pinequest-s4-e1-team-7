import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("users_phone_idx").on(t.phone)],
);

export const translations = sqliteTable("translations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["sign", "voice"] }).notNull(),
  text: text("text").notNull(),
  wordCount: integer("word_count").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const signs = sqliteTable("signs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  category: text("category", { enum: ["alphabet", "number"] }).notNull(),
  r2Key: text("r2_key").notNull().unique(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastPreview: text("last_preview"),
    lastAt: integer("last_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("conv_pair_idx").on(t.userAId, t.userBId)],
);

export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind", {
    enum: ["text", "voice", "call_invite", "call_ended", "call_declined", "call_answered"],
  }).notNull(),
  body: text("body"),
  voiceUrl: text("voice_url"),
  voiceDurationMs: integer("voice_duration_ms"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const conversationReads = sqliteTable(
  "conversation_reads",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    convId: text("conv_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    readUntilMsgId: integer("read_until_msg_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.convId] })],
);

export const feedbackConfig = sqliteTable("feedback_config", {
  id: integer("id").primaryKey().default(1),
  config: text("config").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  overallRating: integer("overall_rating").notNull(),
  ratingTranslator: integer("rating_translator"),
  ratingCall: integer("rating_call"),
  ratingVoice: integer("rating_voice"),
  ratingDict: integer("rating_dict"),
  improveSelected: text("improve_selected").notNull().default("[]"),
  recommend: text("recommend", { enum: ["yes", "maybe", "no"] }).notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
export type Sign = typeof signs.$inferSelect;
export type NewSign = typeof signs.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function pairKey(userAId: string, userBId: string): [string, string] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

export function conversationIdFor(userAId: string, userBId: string): string {
  const [a, b] = pairKey(userAId, userBId);
  return `c_${a.slice(0, 12)}_${b.slice(0, 12)}`;
}
