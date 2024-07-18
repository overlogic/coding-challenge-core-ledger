import { db } from "../../drizzle";
import { AwsDataApiPgDatabase } from "drizzle-orm/aws-data-api/pg";
import { internalTransactions, bankTransactions } from "./models";
import { accounts } from "../account/models";

import { eq, desc, sum, lte, and } from "drizzle-orm";

const toBigInt = (value: string | null) => (value !== null ? BigInt(value) : BigInt(0));
export class TransactionRepository {
  readonly db: AwsDataApiPgDatabase = db;

  async getByAccountId(accountId: string) {
    return this.db.transaction(
      async (tx) =>
        await tx
          .select()
          .from(internalTransactions)
          .where(eq(internalTransactions.accountId, accountId))
          .orderBy(desc(internalTransactions.createdAt))
    );
  }

  async getRealtimeReport() {
    return this.db.transaction(async (tx) => {
      const [deposits] = await tx
        .select({ total: sum(bankTransactions.amount) })
        .from(bankTransactions)
        .where(eq(bankTransactions.type, "deposit"));

      const [withdrawals] = await tx
        .select({ total: sum(bankTransactions.amount) })
        .from(bankTransactions)
        .where(eq(bankTransactions.type, "withdrawal"));

      const [balances] = await tx.select({ total: sum(accounts.balance) }).from(accounts);

      const depositsTotal = toBigInt(deposits.total);
      const withdrawalsTotal = toBigInt(withdrawals.total);
      const balancesTotal = toBigInt(balances.total);

      return {
        accounted: (depositsTotal - withdrawalsTotal).toString(),
        balances: balancesTotal.toString(),
        reconciliation: (depositsTotal - withdrawalsTotal - balancesTotal).toString(),
      };
    });
  }

  async getBankBalance(toDate: Date) {
    return this.db.transaction(async (tx) => {
      const [deposits] = await tx
        .select({ total: sum(bankTransactions.amount) })
        .from(bankTransactions)
        .where(and(eq(bankTransactions.type, "deposit"), lte(bankTransactions.createdAt, toDate)));

      const [withdrawals] = await tx
        .select({ total: sum(bankTransactions.amount) })
        .from(bankTransactions)
        .where(and(eq(bankTransactions.type, "withdrawal"), lte(bankTransactions.createdAt, toDate)));

      const depositsTotal = toBigInt(deposits.total);
      const withdrawalsTotal = toBigInt(withdrawals.total);

      return { accounted: (depositsTotal - withdrawalsTotal).toString() };
    });
  }
}
