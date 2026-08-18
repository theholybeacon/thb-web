import { index, integer, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contentGenerationStatusEnum } from "./entityContent";

/**
 * Reserved sentinel used to lock the one-off Strong's lexicon load.
 *
 * The lexicon is not a book, but it needs exactly the same "row is the lock"
 * treatment and giving it a second status table would be ceremony for one row.
 * Readers of `alignment_book` must therefore skip this sourceCode when
 * enumerating real sources — it will never appear in ALIGNMENT_SOURCES.
 */
export const LEXICON_SOURCE_CODE = "__lexicon__";
export const LEXICON_BOOK_CODE = "__all__";

/**
 * Load status for one book of one alignment source.
 *
 * This is what makes alignment self-healing. `alignment_word` holds ~800k rows
 * produced by a Python extraction toolchain whose intermediate JSONL is not in
 * the repo, so before this table a database reset meant the entire
 * original-language feature went dark until a developer rebuilt it by hand —
 * and went dark *silently*, because an unloaded book is indistinguishable from
 * a verse that genuinely has no alignment.
 *
 * With a row per (source, book) the reader can tell "not loaded yet" from "no
 * data", fetch the missing book from Vercel Blob on demand, and cache it — the
 * same pattern `dictionary_entry` already uses for definitions and
 * `audio_asset` uses for narration. THE ROW IS THE LOCK: `status` flips
 * pending -> generating via a conditional UPDATE, so concurrent first-hits on a
 * cold book produce one fetch, not N.
 */
export const alignmentBookTable = pgTable("alignment_book", {
	id: uuid().defaultRandom().primaryKey(),

	/** Registry code from ALIGNMENT_SOURCES, or LEXICON_SOURCE_CODE. */
	sourceCode: varchar({ length: 24 }).notNull(),
	/** USFM abbreviation, or LEXICON_BOOK_CODE. */
	bookAbbreviation: varchar({ length: 10 }).notNull(),
	/**
	 * 0 = the whole book, which is how Blob-backed sources load (one file per
	 * book). api.bible sources have no corpus and are fetched a chapter at a
	 * time, so they record a real chapter number here — loading Psalms as one
	 * unit would mean 150 sequential API calls and exceed the function timeout.
	 *
	 * 0 rather than NULL because Postgres treats NULLs as distinct in a UNIQUE
	 * constraint, which would silently allow duplicate rows.
	 */
	chapter: integer().notNull().default(0),

	status: contentGenerationStatusEnum().notNull().default("pending"),
	/** Rows actually written — a cheap way to spot a truncated load. */
	wordCount: integer(),
	blobPathname: text(),
	error: text(),

	loadedAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	sourceBookUnique: unique("alignment_book_source_book_chapter_unique").on(
		table.sourceCode, table.bookAbbreviation, table.chapter,
	),
	// Drives reclaimStale, which sweeps rows stranded by a crashed load.
	staleIdx: index("alignment_book_status_updated_idx").on(table.status, table.updatedAt),
}));

export const insertAlignmentBookSchema = createInsertSchema(alignmentBookTable);
export const selectAlignmentBookSchema = createSelectSchema(alignmentBookTable);
