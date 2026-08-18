-- The global /comments feed orders threads by reply volume and by reply
-- recency. Both are aggregates over community_comment, and an aggregate cannot
-- be index-ordered: `ORDER BY max(cc."createdAt") DESC LIMIT 20` would have to
-- aggregate every published contribution on every page load. So both are
-- denormalized onto the row and recomputed on write — the same trade
-- "contribution"."score" already makes against community_vote.
--
-- Removed comments count toward neither: deleting a reply must not leave a
-- thread inflated in "most replied" nor pinned at the top of "recent activity".
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "commentCount" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Added nullable, backfilled, then set NOT NULL — a thread with no comments
-- falls back to its own createdAt so the activity sort is a plain column scan
-- with no COALESCE in the ORDER BY.
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "lastActivityAt" timestamp;
--> statement-breakpoint
UPDATE "contribution" c SET
  "commentCount" = s.n,
  "lastActivityAt" = s.last
FROM (
  SELECT cc."contributionId" AS id, count(*)::int AS n, max(cc."createdAt") AS last
  FROM "community_comment" cc
  WHERE cc."status" = 'published'
  GROUP BY cc."contributionId"
) s WHERE s.id = c."id";
--> statement-breakpoint
UPDATE "contribution" SET "lastActivityAt" = "createdAt" WHERE "lastActivityAt" IS NULL;
--> statement-breakpoint
ALTER TABLE "contribution" ALTER COLUMN "lastActivityAt" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "contribution" ALTER COLUMN "lastActivityAt" SET DEFAULT now();
--> statement-breakpoint
-- One partial index per feed sort order, all predicated on status='published'.
-- The feed is the ONLY reader that filters status in SQL (every other one keeps
-- removed rows so hydrateContributions can decide tombstone-vs-drop), so the
-- predicate matches its WHERE exactly and the indexes stay smaller than the
-- table.
--
-- Every one ends in "id": score and commentCount are overwhelmingly 0, and an
-- unstable sort under OFFSET silently duplicates and skips rows across pages.
CREATE INDEX IF NOT EXISTS "contribution_feed_activity_idx"
  ON "contribution" USING btree ("lastActivityAt" DESC, "createdAt" DESC, "id" DESC)
  WHERE "status" = 'published';
--> statement-breakpoint
-- btree scans backwards, so this one index serves both `newest` and `oldest`.
CREATE INDEX IF NOT EXISTS "contribution_feed_recent_idx"
  ON "contribution" USING btree ("createdAt" DESC, "id" DESC)
  WHERE "status" = 'published';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_feed_score_idx"
  ON "contribution" USING btree ("score" DESC, "createdAt" DESC, "id" DESC)
  WHERE "status" = 'published';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_feed_comments_idx"
  ON "contribution" USING btree ("commentCount" DESC, "createdAt" DESC, "id" DESC)
  WHERE "status" = 'published';
--> statement-breakpoint
-- "Mine only" and the author filter. "contribution" has never had an index on
-- "userId", so this also takes getLastContributionAt (the 20s posting cooldown,
-- on the write hot path) off a sequential scan.
CREATE INDEX IF NOT EXISTS "contribution_feed_author_idx"
  ON "contribution" USING btree ("userId", "createdAt" DESC)
  WHERE "status" = 'published';
