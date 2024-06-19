import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { BaseRepository } from "./base.repository";
import { InferInsertModel } from "drizzle-orm";

export const baseManager = <
  TModel extends PgTable & { id: PgColumn },
  TRepo extends InstanceType<ReturnType<typeof BaseRepository<TModel>>>
>(
  repo: TRepo,
  events: any
) => {
  return new (class {
    async get(id: string) {
      return repo.get(id);
    }
    async create(item: InferInsertModel<TModel>) {
      const newUser = await repo.create(item);
      await events.Created.publish(newUser);
      return newUser;
    }

    async update(id: string, item: InferInsertModel<TModel>) {
      // Broadcast to events.Updated if required
      return repo.update(id, item);
    }
  })();
};
