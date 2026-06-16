import { mysqlTable, text, serial, datetime, varchar, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = mysqlTable("tickets", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  productId: int("product_id").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  message: text("message").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
