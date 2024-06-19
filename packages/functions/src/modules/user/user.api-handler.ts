import { UserManager } from "@coding-challenge-core-ledger/core/modules/user";
import { ApiHandler, usePathParams } from "sst/node/api";

export const get = ApiHandler(async (_evt) => {
  const params = usePathParams();
  if (!params.id) return { statusCode: 400 };
  const user = await UserManager.get(params.id);
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
});

export const create = ApiHandler(async (_evt) => {
  if (!_evt.body) return { statusCode: 400 };
  // validation
  const item = await UserManager.create(JSON.parse(_evt.body));
  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
});
