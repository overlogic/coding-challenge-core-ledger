import { accountService } from "@coding-challenge-core-ledger/core/modules/account/services";
import { transactionService } from "@coding-challenge-core-ledger/core/modules/transaction/services";
import { userService } from "@coding-challenge-core-ledger/core/modules/user/services";
import { ApiHandler, usePathParam, useJsonBody } from "sst/node/api";
import { z } from "zod";

const userHandler = (getHandler: (userId: string) => {}) => {
  return ApiHandler(async (_evt) => {
    if (_evt.requestContext.http.method === "POST" && !_evt.body) return { statusCode: 400 };

    const userId = usePathParam("id");

    if (!userId)
      return {
        statusCode: 400,
        body: JSON.stringify({ errors: ["User id is required"] }),
      };

    const user = await userService.get(userId);
    if (!user) return { statusCode: 404 };

    return getHandler(userId);
  });
};

export const getBalance = userHandler(async (userId) => {
  const result = await accountService.getBalance(userId);

  if (!result.success) return { statusCode: 400 };

  return {
    statusCode: 200,
    body: JSON.stringify({ balance: result.account.balance }),
  };
});

export const getTransactions = userHandler(async (userId) => {
  const result = await transactionService.getTransactionsByUserId(userId);

  if (!result.success) return { statusCode: 400 };

  return {
    statusCode: 200,
    body: JSON.stringify(result.transactions),
  };
});

export const deposit = userHandler(async (userId) => {
  const paramsSchema = z.object({
    amount: z.number().int().gt(0),
  });

  const params = paramsSchema.safeParse(useJsonBody());
  if (!params.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: params.error.flatten().fieldErrors }),
    };

  const user = await userService.get(userId);
  if (!user) return { statusCode: 404 };

  const result = await accountService.deposit(userId, params.data.amount);

  if (!result.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: [result.error] }),
    };

  return {
    statusCode: 200,
    body: JSON.stringify({ balance: result.account.balance }),
  };
});

export const withdraw = userHandler(async (userId) => {
  const paramsSchema = z.object({
    amount: z.number().int().gt(0),
  });

  const params = paramsSchema.safeParse(useJsonBody());
  if (!params.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: params.error.flatten().fieldErrors }),
    };

  const user = await userService.get(userId);
  if (!user) return { statusCode: 404 };

  const result = await accountService.withdraw(userId, params.data.amount);

  if (!result.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: [result.error] }),
    };

  return {
    statusCode: 200,
    body: JSON.stringify({ balance: result.account.balance }),
  };
});
