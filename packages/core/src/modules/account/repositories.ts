import { db } from "../../drizzle";
import { BaseRepository } from "../base.repository";
import { accounts, Account, Currency } from "./models";
import { eq, and } from "drizzle-orm";

export { Account } from "./models";

export class AccountRepository extends BaseRepository(db, accounts) {
  async getByUserId(userId: string, currency: Currency = "EUR") {
    return this.db.transaction(
      async (tx) =>
        (
          await tx
            .select()
            .from(accounts)
            .where(and(eq(accounts.userId, userId), eq(accounts.currency, currency)))
        )[0]
    );
  }

  async getOrCreateByUserId(userId: string, currency: Currency = "EUR") {
    return this.db.transaction(async (tx) => {
      const acc = await this.getByUserId(userId, currency);
      if (acc) {
        return acc as Account;
      }

      return await this.create({ userId, currency });
    });
  }
}
