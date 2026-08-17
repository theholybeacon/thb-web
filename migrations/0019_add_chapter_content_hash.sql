-- Content-address chapter text so identical text is narrated only once.
--
-- API.Bible ships one translation as several rows, one per canon (Protestant,
-- Catholic, Orthodox, Ecumenical). Those rows carry byte-identical text for the
-- books they share — Genesis 1 is the same 4007 characters in all four WEB rows.
-- Keying audio on `bibleId` meant paying for the same narration four times.
--
-- Identity is MEASURED, not declared: edition labels cannot be trusted to predict
-- text identity (WEBUS Orthodox carries WEB's John 3 while its own siblings carry
-- WEBU's), and sharing is per-chapter rather than per-edition (Genesis 1 matches
-- across all fourteen WEB/WEBBE/WEBU/WEBUS rows while Psalm 23 does not).
--
-- Nullable on purpose: a chapter whose verse fetch was incomplete gets no hash,
-- and audio falls back to the old bibleId-based key rather than poisoning the
-- shared cache with a truncated chapter.

ALTER TABLE "chapter" ADD COLUMN IF NOT EXISTS "contentHash" varchar(64);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_content_hash_idx" ON "chapter" ("contentHash");
