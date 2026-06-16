import { mysqlTable, text, serial, datetime, varchar, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsUpdatesTable = mysqlTable("news_updates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: int("author_id").notNull(),
  createdAt: datetime("created_at").notNull().default(new Date()),
});

export const insertNewsUpdateSchema = createInsertSchema(newsUpdatesTable).omit({ id: true, createdAt: true });
export type InsertNewsUpdate = z.infer<typeof insertNewsUpdateSchema>;
export type NewsUpdate = typeof newsUpdatesTable.$inferSelect;
