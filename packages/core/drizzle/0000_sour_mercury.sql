CREATE SCHEMA "user";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user"."users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"firstName" varchar,
	"lastName" varchar,
	"updatedAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL
);
