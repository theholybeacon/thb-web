-- People were named only in English (theographic `entity.aliases`), so inline
-- character links matched almost nothing in the es/fr/de/pt/it translations.
--
--   * entity.strongs  — the Hebrew/Greek proper-noun Strong's ids behind a
--     person's name, derived from the BSB alignment. It bridges to the name in
--     any other aligned translation (JND, L1912).
--   * entity_alias    — per-language names, each validated against real verse
--     text before insert (scripts/localize-bible-people.ts).

ALTER TABLE "entity" ADD COLUMN IF NOT EXISTS "strongs" varchar(8)[] NOT NULL DEFAULT '{}';
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "entity_alias_source" AS ENUM ('alignment', 'ai');
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "entity_alias" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entityId" uuid NOT NULL REFERENCES "entity"("id") ON DELETE CASCADE,
  "lang" varchar(8) NOT NULL,
  "term" varchar(255) NOT NULL,
  "source" "entity_alias_source" NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "entity_alias_entity_lang_term_unique" UNIQUE ("entityId", "lang", "term")
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "entity_alias_entity_lang_idx" ON "entity_alias" ("entityId", "lang");
