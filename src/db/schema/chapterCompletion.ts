import { AnyPgColumn, date, index, integer, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";
import { bibleTable } from "./bible";

/**
 * One row per chapter-completion EVENT — append-only, never updated in place.
 *
 * Anchored on canonical USFM refs (`bookAbbreviation` + `chapter`) rather than a
 * chapterId FK, because `chapter` rows are per-translation. A user who reads
 * Genesis 1 in KJV and later in RVR60 is at the same place in their journey.
 *
 * `lap` is the count of this user's passes through THIS chapter (1 = first
 * time). Computing it at write time makes "times through the whole Bible" a
 * plain `min(lap)` across the 1189 canonical chapters at read time, with no
 * extra query. The unique index on (user, book, chapter, lap) is what keeps that
 * honest: the Neon HTTP driver has no interactive transactions, so the
 * read-max-then-insert in the DAO is a race, and the constraint turns a
 * double-submit into a no-op instead of a phantom extra lap.
 *
 * `completedDate` is the user's LOCAL date, the same convention as
 * user_daily_activity — it makes the today/week/month/year stats a plain range
 * scan with no timezone math at query time.
 */
export const chapterCompletionTable = pgTable("chapter_completion", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "cascade" }).notNull(),
	bookAbbreviation: varchar({ length: 10 }).notNull(),
	chapter: integer().notNull(),
	/** read | listen | type | manual — how the chapter was consumed. */
	mode: varchar({ length: 10 }).notNull(),
	/** Which translation it happened in. Null for a manual mark with no reader context. */
	bibleId: uuid().references((): AnyPgColumn => bibleTable.id),
	lap: integer().notNull().default(1),
	/** Real engaged time: audio listened (excluding pauses), typing time, or read dwell. */
	secondsSpent: integer(),
	completedAt: timestamp().notNull().defaultNow(),
	completedDate: date({ mode: "string" }).notNull(),
}, (t) => ({
	userRefIdx: index("chapter_completion_user_ref_idx").on(t.userId, t.bookAbbreviation, t.chapter),
	userDateIdx: index("chapter_completion_user_date_idx").on(t.userId, t.completedDate),
	lapUnique: unique("chapter_completion_lap_unique").on(t.userId, t.bookAbbreviation, t.chapter, t.lap),
}));

export const insertChapterCompletionSchema = createInsertSchema(chapterCompletionTable);
export const selectChapterCompletionSchema = createSelectSchema(chapterCompletionTable);
