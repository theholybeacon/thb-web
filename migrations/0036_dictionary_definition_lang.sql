-- Dictionary entries were always defined in English: freedictionaryapi.com only
-- reads the English Wiktionary, so a Spanish word came back glossed ("amor" →
-- "love"). Definitions can now be written in another language (es.wiktionary
-- for Spanish), so the language of the definition is part of the cache key.
--
-- Every existing row is an English definition, which the default records.
ALTER TABLE "dictionary_entry" ADD COLUMN IF NOT EXISTS "definitionLang" varchar(8) DEFAULT 'en' NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "dictionary_entry" ADD CONSTRAINT "dictionary_entry_lang_deflang_word_unique" UNIQUE ("lang", "definitionLang", "word");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN null; END $$;
--> statement-breakpoint
ALTER TABLE "dictionary_entry" DROP CONSTRAINT IF EXISTS "dictionary_entry_lang_word_unique";
