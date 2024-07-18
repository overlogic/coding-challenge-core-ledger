import { varchar, bigint, bigserial, timestamp, pgTable, pgEnum } from "drizzle-orm/pg-core";

const bankTransactionEnum = ["deposit", "withdrawal"] as const;
const internalTransactionEnum = ["deposit", "withdrawal", "receivedFee"] as const;

export const internalTransactions = pgTable("internal_transactions", {
  id: bigserial("bigserial", { mode: "number" }).primaryKey(),
  accountId: varchar("accountId").notNull(),
  type: varchar("type", { enum: internalTransactionEnum }).notNull(),
  amount: bigint("bigint", { mode: "number" }).notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type InternalTransaction = typeof internalTransactions.$inferSelect;

export const bankTransactions = pgTable("bank_transactions", {
  id: bigserial("bigserial", { mode: "number" }).primaryKey(),
  accountId: varchar("accountId").notNull(),
  type: varchar("type", { enum: bankTransactionEnum }).notNull(),
  amount: bigint("bigint", { mode: "number" }).notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
