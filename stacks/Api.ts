import { StackContext, Api as SSTApi, use } from "sst/constructs";
import { Database } from "./Database";
import { Bus } from "./Bus";

export function Api({ stack }: StackContext) {
  const db = use(Database);
  const bus = use(Bus);

  const api = new SSTApi(stack, "api", {
    defaults: {
      function: {
        timeout: "900 seconds",
        bind: [db, bus],
      },
    },
    routes: {
      "GET /user/{id}": "packages/functions/src/modules/user.api-handler.get",
      "POST /user": "packages/functions/src/modules/user.api-handler.create",
      "GET /user/{id}/balance": "packages/functions/src/modules/account.api-handler.getBalance",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return Api;
}
