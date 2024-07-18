import { AccountRepository, Account } from "./repositories";

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
  constructor(readonly repo: AccountRepository) {}

  async getBalance(userId: string): Promise<AccountServiceResponse> {
    return {
      success: true,
      account: await this.repo.getOrCreateByUserId(userId),
    };
  }


}

// TODO: Replace with a DI container in the future
export const accountService = new AccountService(new AccountRepository());
