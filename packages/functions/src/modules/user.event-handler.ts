import { UserEvents } from "@coding-challenge-core-ledger/core/modules/user/events";
import { EventHandler } from "sst/node/event-bus";

export const created = EventHandler(UserEvents.Created, async (evt) => {
  console.log("User created", evt);
});
