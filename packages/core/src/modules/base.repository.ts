import { AwsDataApiPgDatabase } from "drizzle-orm/aws-data-api/pg";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { InferSelectModel, eq } from "drizzle-orm";
import { ulid } from "ulid";

export function BaseRepository<T extends PgTable & { id: PgColumn }>(
  db: AwsDataApiPgDatabase,
  model: T
) {
  const wrapper = () => db.select().from(model);
  type fromType = ReturnType<typeof wrapper>;
  type insertType = typeof model.$inferInsert;

  return class BaseRepository {
    db = db;
    async get(id: string) {
      return doTransaction(
        this.db,
        async (connection) =>
          (
            await connection
              .select()
              .from(model)
              .where(eq(model.id, id))
              .execute()
          )[0]
      );
    }
    async list(params?: (query: fromType) => fromType) {
      return doTransaction(this.db, async (connection) =>
        (params || ((q) => q))(connection.select().from(model))
      );
    }
    async update(id: string, data: insertType) {
      return doTransaction(this.db, async (connection) =>
        connection
          .update(model)
          .set({ ...mapToDates(data), updatedAt: new Date() })
          .where(eq(model.id, id))
          .returning()
      ) as InferSelectModel<T>;
    }
    async create(data: insertType) {
      return doTransaction(this.db, async (connection) =>
        connection
          .insert(model)
          .values(
            mapToDates({
              id: ulid(),
              createdAt: new Date(),
              updatedAt: new Date(),
              ...data,
            })
          )
          .returning()
          .then((d) => d[0])
      ) as InferSelectModel<T>;
    }
    async delete(id: string) {
      return doTransaction(this.db, async (connection) =>
        connection.delete(model).where(eq(model.id, id))
      );
    }
    async upsert(data: insertType, version: number) {
      return doTransaction(this.db, async (connection) => {
        const rec = await this.get((data as any).id);
        if (rec) {
          if ((rec as any).version < version) {
            return await this.update((data as any).id, data);
          }
        } else {
          return connection
            .insert(model)
            .values(mapToDates(data))
            .onConflictDoUpdate({
              target: model.id,
              set: data,
            })
            .returning()
            .then((i) => i[0]) as InferSelectModel<T>;
        }
      });
    }
  };
}

export const doTransaction = (
  db: AwsDataApiPgDatabase,
  callback: (tx: AwsDataApiPgDatabase) => any
) => {
  return db.transaction(callback);
};

const mapToDates = (obj: any) => {
  for (const key of Object.keys(obj)) {
    if (key.endsWith("At")) {
      obj[key] = obj[key] ? new Date(obj[key]) : obj[key];
    }
  }
  return obj;
};
