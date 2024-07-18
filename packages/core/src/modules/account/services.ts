import { AccountRepository, Account } from "./repositories";

type AccountServiceConfig = {
  minDepositAmount: number;
  minWithdrawAmount: number;
  defaultFee: number;
  beneficiaryAccountId: string;
};

type AccountServiceResponse =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      account: Account;
    };

export class AccountService {
  constructor(readonly repo: AccountRepository, readonly config: AccountServiceConfig) {}

  async getBalance(userId: string): Promise<AccountServiceResponse> {
    return {
      success: true,
      account: await this.repo.getOrCreateByUserId(userId),
    };
  }

  async deposit(userId: string, amount: number, fee = this.config.defaultFee): Promise<AccountServiceResponse> {
    if (amount < this.config.minDepositAmount) {
      return {
        success: false,
        error: `Amount must be greater than ${this.config.minDepositAmount}`,
      };
    }

    const account = await this.repo.getOrCreateByUserId(userId);

    return {
      success: true,
      account: await this.repo.depositAmountWithFee(account.id, amount, fee, this.config.beneficiaryAccountId),
    };
  }

  async withdraw(userId: string, amount: number, fee = this.config.defaultFee): Promise<AccountServiceResponse> {
    if (amount < this.config.minWithdrawAmount) {
      return {
        success: false,
        error: `Amount must be greater than ${this.config.minWithdrawAmount}`,
      };
    }

    const account = await this.repo.getOrCreateByUserId(userId);

    if (account.balance < amount) {
      return {
        success: false,
        error: `Account does not have enough balance`,
      };
    }

    return {
      success: true,
      account: await this.repo.withdrawAmountWithFee(account.id, amount, fee, this.config.beneficiaryAccountId),
    };
  }
}

// TODO: Replace with a DI container in the future
export const accountService = new AccountService(new AccountRepository(), {
  minDepositAmount: 5 * 100,
  minWithdrawAmount: 5 * 100,
  defaultFee: 100,
  beneficiaryAccountId: "XXXXXXXXXXXXXXXXXXXXXXXXXX",
});
