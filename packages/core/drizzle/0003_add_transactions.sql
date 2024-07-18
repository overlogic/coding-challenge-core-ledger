CREATE TABLE IF NOT EXISTS "bank_transactions" (
	"bigserial" bigserial PRIMARY KEY NOT NULL,
	"accountId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"bigint" bigint NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internal_transactions" (
	"bigserial" bigserial PRIMARY KEY NOT NULL,
	"accountId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"bigint" bigint NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL
);
