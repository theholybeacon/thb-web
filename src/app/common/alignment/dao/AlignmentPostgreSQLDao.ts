import { logger } from "@/app/utils/logger";
import { and, asc, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { alignmentWordTable, strongsEntryTable } from "@/db/schema/alignment";
import { alignmentBookTable } from "@/db/schema/alignmentBook";
import { alignmentInferredTable } from "@/db/schema/alignmentInferred";
import { AlignmentBook, AlignmentInferred, AlignmentWord, AlignmentWordInsert, StrongsEntry, StrongsEntryInsert } from "../model/Alignment";

const log = logger.child({ module: "AlignmentPostgreSQLDao" });

/** Identifies one inferred word: translation + canonical position + which token. */
export interface InferredKey {
	bibleVersion: string;
	bookAbbreviation: string;
	chapter: number;
	verse: number;
	surfaceNorm: string;
	occurrence: number;
}

function inferredWhere(k: InferredKey) {
	return and(
		eq(alignmentInferredTable.bibleVersion, k.bibleVersion),
		eq(alignmentInferredTable.bookAbbreviation, k.bookAbbreviation),
		eq(alignmentInferredTable.chapter, k.chapter),
		eq(alignmentInferredTable.verse, k.verse),
		eq(alignmentInferredTable.surfaceNorm, k.surfaceNorm),
		eq(alignmentInferredTable.occurrence, k.occurrence),
	);
}

export class AlignmentPostgreSQLDao {

	/** Every aligned word of one verse in one source, in reading order. */
	async getVerse(
		sourceCode: string,
		bookAbbreviation: string,
		chapter: number,
		verse: number,
	): Promise<AlignmentWord[]> {
		log.trace("getVerse");
		return await db
			.select()
			.from(alignmentWordTable)
			.where(
				and(
					eq(alignmentWordTable.sourceCode, sourceCode),
					eq(alignmentWordTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentWordTable.chapter, chapter),
					eq(alignmentWordTable.verse, verse),
				),
			)
			.orderBy(asc(alignmentWordTable.wordIndex));
	}

	/**
	 * The row for a specific rendered word: matched on normalised surface plus
	 * its 1-based ordinal within the verse. The ordinal is what distinguishes
	 * "the 2nd `love` in John 21:17" from the 1st — without it every occurrence
	 * of a repeated word collapses to the same answer.
	 */
	async getWord(
		sourceCode: string,
		bookAbbreviation: string,
		chapter: number,
		verse: number,
		surfaceNorm: string,
		occurrence: number,
	): Promise<AlignmentWord | null> {
		log.trace("getWord");
		const rows = await db
			.select()
			.from(alignmentWordTable)
			.where(
				and(
					eq(alignmentWordTable.sourceCode, sourceCode),
					eq(alignmentWordTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentWordTable.chapter, chapter),
					eq(alignmentWordTable.verse, verse),
					eq(alignmentWordTable.surfaceNorm, surfaceNorm),
					eq(alignmentWordTable.occurrence, occurrence),
				),
			)
			.limit(1);
		return rows[0] ?? null;
	}

	/**
	 * Rows whose surface contains the selected token. Alignment groups map a
	 * phrase to one original word ("they had finished eating" -> G0709), so an
	 * exact-equality match alone would miss any word inside such a group.
	 */
	async findBySurfaceContaining(
		sourceCode: string,
		bookAbbreviation: string,
		chapter: number,
		verse: number,
		surfaceNorm: string,
	): Promise<AlignmentWord[]> {
		log.trace("findBySurfaceContaining");
		return await db
			.select()
			.from(alignmentWordTable)
			.where(
				and(
					eq(alignmentWordTable.sourceCode, sourceCode),
					eq(alignmentWordTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentWordTable.chapter, chapter),
					eq(alignmentWordTable.verse, verse),
					sql`(
						${alignmentWordTable.surfaceNorm} = ${surfaceNorm}
						OR ${alignmentWordTable.surfaceNorm} LIKE ${`% ${surfaceNorm} %`}
						OR ${alignmentWordTable.surfaceNorm} LIKE ${`${surfaceNorm} %`}
						OR ${alignmentWordTable.surfaceNorm} LIKE ${`% ${surfaceNorm}`}
					)`,
				),
			)
			.orderBy(asc(alignmentWordTable.wordIndex));
	}

	async getStrongsEntries(ids: string[]): Promise<StrongsEntry[]> {
		log.trace("getStrongsEntries");
		if (ids.length === 0) return [];
		return await db.select().from(strongsEntryTable).where(inArray(strongsEntryTable.strongs, ids));
	}

	/** Bulk insert for the seeder. Existing rows for the source are replaced by the caller. */
	async insertWords(words: AlignmentWordInsert[]): Promise<void> {
		if (words.length === 0) return;
		await db.insert(alignmentWordTable).values(words);
	}

	async deleteSource(sourceCode: string): Promise<void> {
		log.trace("deleteSource");
		await db.delete(alignmentWordTable).where(eq(alignmentWordTable.sourceCode, sourceCode));
	}

	/** Upsert so re-running the seeder with a better lexicon refreshes definitions. */
	async upsertStrongsEntries(entries: StrongsEntryInsert[]): Promise<void> {
		if (entries.length === 0) return;
		await db
			.insert(strongsEntryTable)
			.values(entries)
			.onConflictDoUpdate({
				target: strongsEntryTable.strongs,
				set: {
					language: sql`excluded.language`,
					lemma: sql`excluded.lemma`,
					translit: sql`excluded.translit`,
					pronunciation: sql`excluded.pronunciation`,
					definition: sql`excluded.definition`,
					shortDefinition: sql`excluded."shortDefinition"`,
					derivation: sql`excluded.derivation`,
					source: sql`excluded.source`,
					updatedAt: new Date(),
				},
			});
	}

	async countWords(sourceCode: string): Promise<number> {
		const rows = await db
			.select({ n: sql<number>`count(*)::int` })
			.from(alignmentWordTable)
			.where(eq(alignmentWordTable.sourceCode, sourceCode));
		return rows[0]?.n ?? 0;
	}

	// --- Per-book load status (the lazy-loading lock) -------------------------

	async getBook(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<AlignmentBook | null> {
		log.trace("getBook");
		const rows = await db
			.select()
			.from(alignmentBookTable)
			.where(
				and(
					eq(alignmentBookTable.sourceCode, sourceCode),
					eq(alignmentBookTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentBookTable.chapter, chapter),
				),
			)
			.limit(1);
		return rows[0] ?? null;
	}

	/**
	 * Status of one passage across several sources, in one round trip.
	 *
	 * Matches `chapter IN (0, chapter)` because the two source kinds record
	 * different units: Blob-backed sources load a whole book (0), live api.bible
	 * sources load one chapter. Without the chapter predicate a live source would
	 * look ready for John 21 merely because John 3 had been fetched.
	 */
	async getBooks(
		sourceCodes: string[],
		bookAbbreviation: string,
		chapter = 0,
	): Promise<AlignmentBook[]> {
		log.trace("getBooks");
		if (sourceCodes.length === 0) return [];
		return await db
			.select()
			.from(alignmentBookTable)
			.where(
				and(
					inArray(alignmentBookTable.sourceCode, sourceCodes),
					eq(alignmentBookTable.bookAbbreviation, bookAbbreviation),
					inArray(alignmentBookTable.chapter, [0, chapter]),
				),
			);
	}

	async ensureBookRow(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<void> {
		log.trace("ensureBookRow");
		await db
			.insert(alignmentBookTable)
			.values({ sourceCode, bookAbbreviation, chapter })
			.onConflictDoNothing();
	}

	/**
	 * Atomically claim the load. Only the caller that flips the row
	 * pending/failed -> generating gets true; concurrent first-hits on a cold book
	 * therefore produce one Blob fetch and one insert batch, not N.
	 */
	async claimBookForLoad(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<boolean> {
		log.trace("claimBookForLoad");
		const rows = await db
			.update(alignmentBookTable)
			.set({ status: "generating", error: null, updatedAt: new Date() })
			.where(
				and(
					eq(alignmentBookTable.sourceCode, sourceCode),
					eq(alignmentBookTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentBookTable.chapter, chapter),
					inArray(alignmentBookTable.status, ["pending", "failed"]),
				),
			)
			.returning({ id: alignmentBookTable.id });
		return rows.length > 0;
	}

	async markBookReady(
		sourceCode: string,
		bookAbbreviation: string,
		wordCount: number,
		blobPathname: string,
		chapter = 0,
	): Promise<void> {
		await db
			.update(alignmentBookTable)
			.set({
				status: "ready", wordCount, blobPathname, error: null,
				loadedAt: new Date(), updatedAt: new Date(),
			})
			.where(
				and(
					eq(alignmentBookTable.sourceCode, sourceCode),
					eq(alignmentBookTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentBookTable.chapter, chapter),
				),
			);
	}

	async markBookFailed(sourceCode: string, bookAbbreviation: string, error: string, chapter = 0): Promise<void> {
		log.warn({ sourceCode, bookAbbreviation, error }, "alignment book load failed");
		await db
			.update(alignmentBookTable)
			.set({ status: "failed", error, updatedAt: new Date() })
			.where(
				and(
					eq(alignmentBookTable.sourceCode, sourceCode),
					eq(alignmentBookTable.bookAbbreviation, bookAbbreviation),
					eq(alignmentBookTable.chapter, chapter),
				),
			);
	}

	/** Releases books stranded in `generating` by a crashed or timed-out load. */
	async reclaimStaleBooks(olderThanMs: number): Promise<number> {
		const cutoff = new Date(Date.now() - olderThanMs);
		const rows = await db
			.update(alignmentBookTable)
			.set({ status: "pending", error: "reclaimed: load timed out", updatedAt: new Date() })
			.where(
				and(
					eq(alignmentBookTable.status, "generating"),
					lt(alignmentBookTable.updatedAt, cutoff),
				),
			)
			.returning({ id: alignmentBookTable.id });
		if (rows.length > 0) log.warn({ count: rows.length }, "reclaimed stale alignment book loads");
		return rows.length;
	}

	/** Clears a partial load before retrying, so a retry cannot double-insert. */
	async deleteBookWords(sourceCode: string, bookAbbreviation: string, chapter?: number): Promise<void> {
		await db
			.delete(alignmentWordTable)
			.where(
				and(
					eq(alignmentWordTable.sourceCode, sourceCode),
					eq(alignmentWordTable.bookAbbreviation, bookAbbreviation),
					...(chapter === undefined ? [] : [eq(alignmentWordTable.chapter, chapter)]),
				),
			);
	}

	async countStrongsEntries(): Promise<number> {
		const rows = await db.select({ n: sql<number>`count(*)::int` }).from(strongsEntryTable);
		return rows[0]?.n ?? 0;
	}

	// --- Inferred alignment cache (es/pt/it) ----------------------------------

	async getInferred(k: InferredKey): Promise<AlignmentInferred | null> {
		log.trace("getInferred");
		const rows = await db.select().from(alignmentInferredTable).where(inferredWhere(k)).limit(1);
		return rows[0] ?? null;
	}

	async ensureInferredRow(k: InferredKey): Promise<void> {
		await db.insert(alignmentInferredTable).values({ ...k }).onConflictDoNothing();
	}

	/** One model call per word, ever — the claim is what enforces that. */
	async claimInferred(k: InferredKey): Promise<boolean> {
		const rows = await db
			.update(alignmentInferredTable)
			.set({ status: "generating", error: null, updatedAt: new Date() })
			.where(and(inferredWhere(k), inArray(alignmentInferredTable.status, ["pending", "failed"])))
			.returning({ id: alignmentInferredTable.id });
		return rows.length > 0;
	}

	async markInferredReady(
		k: InferredKey, strongs: string | null, candidateSource: string, model: string,
	): Promise<void> {
		await db
			.update(alignmentInferredTable)
			.set({ status: "ready", strongs, candidateSource, model, error: null,
				inferredAt: new Date(), updatedAt: new Date() })
			.where(inferredWhere(k));
	}

	async markInferredFailed(k: InferredKey, error: string): Promise<void> {
		log.warn({ ...k, error }, "alignment inference failed");
		await db
			.update(alignmentInferredTable)
			.set({ status: "failed", error, updatedAt: new Date() })
			.where(inferredWhere(k));
	}

	async reclaimStaleInferred(olderThanMs: number): Promise<number> {
		const cutoff = new Date(Date.now() - olderThanMs);
		const rows = await db
			.update(alignmentInferredTable)
			.set({ status: "pending", error: "reclaimed: inference timed out", updatedAt: new Date() })
			.where(and(eq(alignmentInferredTable.status, "generating"), lt(alignmentInferredTable.updatedAt, cutoff)))
			.returning({ id: alignmentInferredTable.id });
		return rows.length;
	}
}
