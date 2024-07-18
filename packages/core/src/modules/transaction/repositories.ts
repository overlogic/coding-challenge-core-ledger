import { db } from "../../drizzle";
import { AwsDataApiPgDatabase } from "drizzle-orm/aws-data-api/pg";
import { internalTransactions, bankTransactions } from "./models";

import { eq, desc } from "drizzle-orm";

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
}
