CREATE TABLE IF NOT EXISTS "accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"currency" varchar DEFAULT 'EUR' NOT NULL,
	"bigint" bigint DEFAULT 0 NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "accounts_userId_currency_unique" UNIQUE("userId","currency")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> populate default account
INSERT INTO "users" ("id", "firstName", "lastName", "updatedAt", "createdAt") VALUES ('XXXXXXXXXXXXXXXXXXXXXXXXXX', 'John', 'Doe', now(), now());
INSERT INTO "accounts" ("id", "userId", "currency", "bigint", "updatedAt", "createdAt") VALUES ('XXXXXXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXXXXXX', 'EUR', 100, now(), now());