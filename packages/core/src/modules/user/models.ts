import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  firstName: varchar("firstName"),
  lastName: varchar("lastName"),
  updatedAt: timestamp("updatedAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type User = typeof users.$inferSelect;
