import { db } from "../../drizzle";
import { BaseRepository } from "../base.repository";
import { accounts, Account, Currency } from "./models";
import { bankTransactions, internalTransactions } from "../transaction/models";
import { eq, gt, and, sql } from "drizzle-orm";

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

  async depositAmountWithFee(id: string, totalAmount: number, fee: number, beneficiaryId: string) {
    const amount = totalAmount - fee;
    if (amount <= 0) throw Error("Amount must be greater than fee");
    if (fee < 0) throw Error("Fee must be greater or equal to 0");

    return this.db.transaction(async (tx) => {
      const currenTime = new Date();

      const [acc] = await tx
        .update(accounts)
        // FIXME: Can't use sql template string with other params due to type hinthting bug in drizzle
        //.set({ balance: sql`${accounts.balance} + ${amount}`, updatedAt: currenTime })
        .set({ balance: sql`${accounts.balance} + ${amount}` })
        .where(eq(accounts.id, id))
        .returning();

      // add record to bank transactions
      await tx.insert(bankTransactions).values({
        createdAt: currenTime,
        updatedAt: currenTime,
        accountId: id,
        type: "deposit",
        amount: totalAmount,
      });

      // add record to internal transactions
      await tx.insert(internalTransactions).values({
        createdAt: currenTime,
        updatedAt: currenTime,
        accountId: id,
        type: "deposit",
        amount: amount,
      });

      if (fee > 0) {
        const [beneficiary] = await tx
          .update(accounts)
          // FIXME: Can't use sql template string with other params due to type hinthting bug in drizzle
          //.set({ balance: sql`${accounts.balance} + ${fee}`, updatedAt: currenTime })
          .set({ balance: sql`${accounts.balance} + ${fee}` })
          .where(eq(accounts.id, beneficiaryId))
          .returning();

        await tx.insert(internalTransactions).values({
          createdAt: currenTime,
          updatedAt: currenTime,
          accountId: beneficiaryId,
          type: "receivedFee",
          amount: fee,
        });
      }

      return acc;
    });
  }

  async withdrawAmountWithFee(id: string, totalAmount: number, fee: number, beneficiaryId: string) {
    const amount = totalAmount - fee;
    if (amount <= 0) throw Error("Amount must be greater than fee");
    if (fee < 0) throw Error("Fee must be greater or equal to 0");

    return this.db.transaction(async (tx) => {
      const currenTime = new Date();

      const [acc] = await tx
        .update(accounts)
        // FIXME: Can't use sql template string with other params due to type hinthting bug in drizzle
        //.set({ balance: sql`${accounts.balance} - ${totalAmount}`, updatedAt: currenTime })
        .set({ balance: sql`${accounts.balance} - ${totalAmount}` })
        .where(and(eq(accounts.id, id), gt(accounts.balance, totalAmount)))
        .returning();

      if (!acc) throw Error("Account does not have enough balance");

      // add record to bank transactions
      await tx.insert(bankTransactions).values({
        createdAt: currenTime,
        updatedAt: currenTime,
        accountId: id,
        type: "withdrawal",
        amount: amount,
      });

      // add record to internal transactions
      await tx.insert(internalTransactions).values({
        createdAt: currenTime,
        updatedAt: currenTime,
        accountId: id,
        type: "withdrawal",
        amount: totalAmount,
      });

      if (fee > 0) {
        const [beneficiary] = await tx
          .update(accounts)
          // FIXME: Can't use sql template string with other params due to type hinthting bug in drizzle
          //.set({ balance: sql`${accounts.balance} + ${fee}`, updatedAt: currenTime })
          .set({ balance: sql`${accounts.balance} + ${fee}` })
          .where(eq(accounts.id, beneficiaryId))
          .returning();

        await tx.insert(internalTransactions).values({
          createdAt: currenTime,
          updatedAt: currenTime,
          accountId: beneficiaryId,
          type: "receivedFee",
          amount: fee,
        });
      }

      return acc;
    });
  }
}
