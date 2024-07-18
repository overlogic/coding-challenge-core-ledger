import { StackContext, EventBus, use } from "sst/constructs";
import { Database } from "./Database";

export function Bus({ stack }: StackContext) {
  const db = use(Database);

  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 3,
    },
  });

  bus.subscribe("user.created", {
    bind: [db],
    handler:
      "packages/functions/src/modules/user.event-handler.created",
  });

  stack.addOutputs({
    busName: bus.eventBusName,
  });

  return bus;
}
