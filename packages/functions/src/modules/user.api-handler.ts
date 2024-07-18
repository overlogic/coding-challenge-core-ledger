import { userService } from "@coding-challenge-core-ledger/core/modules/user/services";
import { ApiHandler, usePathParam, useJsonBody } from "sst/node/api";
import { z } from "zod";

export const get = ApiHandler(async (_evt) => {
  const userId = usePathParam("id");

  if (!userId)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: ["User id is required"] }),
    };

  const user = await userService.get(userId);
  if (!user) return { statusCode: 404 };

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
});

export const create = ApiHandler(async (_evt) => {
  if (!_evt.body) return { statusCode: 400 };

  const paramsSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
  });

  const params = paramsSchema.safeParse(useJsonBody());
  if (!params.success)
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: params.error.flatten().fieldErrors }),
    };

  const item = await userService.create(params.data);
  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
});
