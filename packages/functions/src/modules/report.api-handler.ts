import { transactionService } from "@coding-challenge-core-ledger/core/modules/transaction/services";
import { ApiHandler, usePathParam } from "sst/node/api";
import { z } from "zod";

export const realtime = ApiHandler(async (_evt) => {
  const report = await transactionService.getRealtimeReport();
  if (!report.success) return { statusCode: 400 };

  return {
    statusCode: 200,
    body: JSON.stringify(report.report),
  };
});

export const bankbalance = ApiHandler(async (_evt) => {
  const params = z.string().datetime({ offset: true }).safeParse(usePathParam("toDate"));

  if (!params.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: ["valid datetime is required"] }),
    };

  const report = await transactionService.getBankBalance(new Date(params.data));
  if (!report.success) return { statusCode: 400 };

  return {
    statusCode: 200,
    body: JSON.stringify(report.report),
  };
});
