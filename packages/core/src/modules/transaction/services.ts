import { TransactionRepository } from "./repositories";
import { AccountRepository } from "../account/repositories";

const accountRepository = new AccountRepository();

type ErrResponse = {
  success: false;
  error: string;
};

type TransactionsResponse = {
  success: true;
  transactions: { createdAt: Date; type: string; amount: number }[];
};

type RealtimeReportResponse = {
  success: true;
  report: {
    accounted: string;
    balances: string;
    reconciliation: string;
  };
};

type BankReportResponse = {
  success: true;
  report: {
    accounted: string;
  };
};

export class TransactionService {
  constructor(readonly repo: TransactionRepository) {}

  async getTransactionsByUserId(userId: string): Promise<ErrResponse | TransactionsResponse> {
    const account = await accountRepository.getOrCreateByUserId(userId);

    return {
      success: true,
      transactions: (await this.repo.getByAccountId(account.id)).map((t) => ({
        createdAt: t.createdAt,
        type: t.type,
        amount: t.amount,
      })),
    };
  }

  async getRealtimeReport(): Promise<ErrResponse | RealtimeReportResponse> {
    return {
      success: true,
      report: await this.repo.getRealtimeReport(),
    };
  }

  async getBankBalance(toDate: Date): Promise<ErrResponse | BankReportResponse> {
    return {
      success: true,
      report: await this.repo.getBankBalance(toDate),
    };
  }
}

// TODO: Replace with a DI container in the future
export const transactionService = new TransactionService(new TransactionRepository());
