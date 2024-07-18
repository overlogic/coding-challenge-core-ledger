import { varchar, bigint, timestamp, unique, pgTable } from "drizzle-orm/pg-core";
import { users } from "../user/models";

const currencyEnum = ["EUR", "USD", "GBP", "BTC"] as const;

export type Currency = (typeof currencyEnum)[number];

export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id").primaryKey(),
    userId: varchar("userId")
      .references(() => users.id)
      .notNull(),
    currency: varchar("currency", { enum: currencyEnum }).notNull().default("EUR"),
    balance: bigint("bigint", { mode: "number" }).notNull().default(0),
    updatedAt: timestamp("updatedAt").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.currency),
  })
);

export type Account = typeof accounts.$inferSelect;
