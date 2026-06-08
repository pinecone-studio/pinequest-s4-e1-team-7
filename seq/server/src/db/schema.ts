import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

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
  label: text("label").notNull(),        // "A", "B", "1", "2" ...
  category: text("category", { enum: ["alphabet", "number"] }).notNull(),
  r2Key: text("r2_key").notNull().unique(), // "signs/alphabet/A.png"
  url: text("url").notNull(),            // R2 public URL
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}
export type Sign = typeof signs.$inferSelect;
export type NewSign = typeof signs.$inferInsert;
