import { expect, it, describe, beforeAll } from "vitest";
import { Api } from "sst/node/api";
import { AccountService } from "../services";
import { AccountRepository, Account } from "../repositories";
import { userService } from "../../user/services";

const accountRep = new AccountRepository();

const getNewUserId = async (firstName = "John", lastName = "Perkins") => {
  const user = await userService.create({ firstName, lastName });
  return user.id;
};

const getAccountService = async () => {
  const userId = await getNewUserId();
  const beneficiaryAccount = await accountRep.getOrCreateByUserId(userId);
  return new AccountService(accountRep, {
    minDepositAmount: 5 * 100,
    minWithdrawAmount: 5 * 100,
    defaultFee: 100,
    beneficiaryAccountId: beneficiaryAccount.id,
  });
};

describe("User Account API", { timeout: 30000 }, () => {
  it("zero balance", async () => {
    const testUserId = await getNewUserId();

    const getUserBalanceResponse = await fetch(`${Api.api.url}/user/${testUserId}/balance`, {
      method: "GET",
    });
    expect(getUserBalanceResponse.status).toBe(200);
    const getUserBalance = (await getUserBalanceResponse.json()) as {
      balance: number;
    };
    expect(getUserBalance.balance).toBe(0);
  });

  it("should deposit", async () => {
    const testUserId = await getNewUserId();

    const depositResponse = await fetch(`${Api.api.url}/user/${testUserId}/deposit`, {
      method: "POST",
      body: JSON.stringify({
        amount: 1000,
      }),
    });
    expect(depositResponse.status).toBe(200);
    const deposit = (await depositResponse.json()) as { balance: number };
    expect(deposit.balance).toBe(900);
  });

  it("should withdraw", async () => {
    const testUserId = await getNewUserId();
    const accountService = await getAccountService();

    const depositResult = await accountService.deposit(testUserId, 1000);
    expect(depositResult.success).toBe(true);
    depositResult.success && expect(depositResult.account.balance).toBe(900);

    const withdrawResponse = await fetch(`${Api.api.url}/user/${testUserId}/withdraw`, {
      method: "POST",
      body: JSON.stringify({
        amount: 600,
      }),
    });
    expect(withdrawResponse.status).toBe(200);
    const withdraw = (await withdrawResponse.json()) as { balance: number };
    expect(withdraw.balance).toBe(300);
  });

  it("shouldn't withdraw", async () => {
    const testUserId = await getNewUserId();

    const withdrawResponse = await fetch(`${Api.api.url}/user/${testUserId}/withdraw`, {
      method: "POST",
      body: JSON.stringify({
        amount: 600,
      }),
    });
    expect(withdrawResponse.status).toBe(400);
  });
});

describe("User Account Service", { timeout: 30000 }, () => {
  it("deposit checks", async () => {
    const testUserId = await getNewUserId();
    const accountService = await getAccountService();
    const depositAmount = 1000;

    const depositResult = await accountService.deposit(testUserId, depositAmount);
    expect(depositResult.success).toBe(true);
    depositResult.success &&
      expect(depositResult.account.balance).toBe(depositAmount - accountService.config.defaultFee);

    const depositFeeAccount = (await accountRep.get(accountService.config.beneficiaryAccountId)) as Account;
    expect(depositFeeAccount.balance).toBe(accountService.config.defaultFee);

    const depositUnsuccess = await accountService.deposit(testUserId, accountService.config.minDepositAmount - 1);
    expect(depositUnsuccess.success).toBe(false);
  });

  it("withdraw checks", async () => {
    const testUserId = await getNewUserId();
    const accountService = await getAccountService();

    const depositAmount = 1000;
    await accountService.deposit(testUserId, depositAmount, 0);

    const withdrawResult = await accountService.withdraw(testUserId, accountService.config.minWithdrawAmount);
    expect(withdrawResult.success).toBe(true);
    withdrawResult.success &&
      expect(withdrawResult.account.balance).toBe(depositAmount - accountService.config.minWithdrawAmount);

    const feeAccount = (await accountRep.get(accountService.config.beneficiaryAccountId)) as Account;
    expect(feeAccount.balance).toBe(accountService.config.defaultFee);

    const withdrawUnsuccess = await accountService.withdraw(testUserId, depositAmount);
    expect(withdrawUnsuccess.success).toBe(false);

    const withdrawTooFew = await accountService.withdraw(testUserId, accountService.config.minWithdrawAmount - 1);
    expect(withdrawTooFew.success).toBe(false);
  });
});
