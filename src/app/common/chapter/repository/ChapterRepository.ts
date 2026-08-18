import { logger } from "@/app/utils/logger";
import { chapterContentHash } from "@/lib/chapterHash";
import { BibleRepository } from "../../bible/repository/BibleRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { VerseRepository } from "../../verse/repository/VerseRepository";
import { ChapterExternalAPIDao } from "../dao/ChapterExternalApiDao";
import { ChapterPostgreSQLDao } from "../dao/ChapterPostgreSQLDao";
import { Chapter, ChapterFull, ChapterInsert, ChapterVer } from "../model/Chapter";
import { ChapterFetchError, isChapterFetchError, toLoadError } from "../model/ChapterFetchError";

const log = logger.child({ module: 'ChapterRepository' });

/** How long a short chapter waits before spending another request on repair. */
const REPAIR_RETRY_MS = 6 * 60 * 60 * 1000;
export class ChapterRepository {
	private chapterInternalDao = new ChapterPostgreSQLDao();
	private chapterExternalDao = new ChapterExternalAPIDao();

	private bookRepository = new BookRepository();
	private bibleRepository = new BibleRepository();
	private verseRepository = new VerseRepository();

	async create(chapter: ChapterInsert): Promise<Chapter> {
		return await this.chapterInternalDao.create(chapter);
	}

	/**
	 * The chapter rows we hold for a book. Read-only.
	 *
	 * This used to bulk-INSERT a row for every chapter of the book, with zero
	 * verses, the first time a book was touched — which is where ~1,200 empty
	 * chapter rows came from. Rows are now created by `getFullChapter` at the
	 * moment a chapter is actually read, so a row's existence means something.
	 */
	async getAllByBookId(bookId: string): Promise<Chapter[]> {
		return await this.chapterInternalDao.getAllByBookId(bookId);
	}

	async getById(id: string): Promise<Chapter> {
		return await this.chapterInternalDao.getById(id);
	}

	/**
	 * A chapter with its verses, hydrating from api.bible on first read.
	 *
	 * Hydration is ONE request for the whole chapter. It used to be one request
	 * per verse inside a `while (true)` loop that broke on the first error, so a
	 * 50-verse chapter cost 51 round-trips and any single failure — most often an
	 * exhausted daily quota — left the chapter empty or truncated with no way to
	 * tell which. Nothing is written unless the whole chapter arrives.
	 *
	 * `loadError` is set instead of throwing: the caller still gets whatever text
	 * is already stored, and the reader can say the chapter is unavailable rather
	 * than pretending it is blank.
	 */
	async getFullChapter(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		log.trace("getFullChapter");

		let chapter = await this.chapterInternalDao.ensure(bookId, chapterNumber);

		if (!this.needsHydration(chapter)) {
			await this.ensureContentHash(chapter);
			return chapter;
		}

		const bookToFetch = await this.bookRepository.getById(bookId);
		const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);

		try {
			const fetched = await this.chapterExternalDao.getChapterText(
				bibleToFetch!.apiId,
				bookToFetch.apiId,
				chapterNumber,
			);

			await this.verseRepository.createMany(
				fetched.verses.map((v) => ({
					chapterId: chapter.id,
					verseNumber: v.verseNumber,
					content: v.content,
				})),
			);

			// Prefer upstream's own count: if the parser ever drops a verse, the
			// chapter stays visibly short of numVerses and repairs itself on a
			// later read instead of looking complete.
			const numVerses = fetched.verseCount ?? fetched.verses.length;
			if (fetched.verseCount != null && fetched.verseCount !== fetched.verses.length) {
				log.warn(
					{ chapterId: chapter.id, expected: fetched.verseCount, parsed: fetched.verses.length },
					"parsed verse count disagrees with api.bible",
				);
			}

			await this.chapterInternalDao.updateMeta(chapter.id, { numVerses });

			// Re-read so the caller gets the verses ordered and deduped by the
			// database rather than in insert order.
			chapter = (await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber)) ?? chapter;
		} catch (e) {
			if (!isChapterFetchError(e)) throw e;
			return this.onFetchFailed(chapter, e);
		}

		await this.ensureContentHash(chapter);
		return chapter;
	}

	/**
	 * Re-fetch when the chapter has no verses, or fewer than upstream says it
	 * should. The count check is what unfreezes a chapter truncated by the old
	 * loop — `verses.length === 0` alone left it short forever.
	 *
	 * `numVerses < 0` is the "upstream has no such chapter" sentinel: a 404 is a
	 * fact about the text, not a transient failure, so it must never be retried
	 * on every page view.
	 */
	private needsHydration(chapter: ChapterVer): boolean {
		const numVerses = chapter.numVerses ?? 0;
		if (numVerses < 0) return false;
		if (chapter.verses.length === 0) return true;
		if (numVerses > 0 && chapter.verses.length < numVerses) {
			// Guard against a permanently short chapter refetching on every read.
			const updatedAt = chapter.updatedAt?.getTime() ?? 0;
			return Date.now() - updatedAt > REPAIR_RETRY_MS;
		}
		return false;
	}

	/** Records the failure on the chapter and hands the caller what we do have. */
	private async onFetchFailed(chapter: ChapterVer, e: ChapterFetchError): Promise<ChapterVer> {
		if (e.reason === "NOT_FOUND") {
			// Remember it, so a chapter the book claims exists but upstream does not
			// have stops costing a request on every single read.
			log.info({ chapterId: chapter.id }, "upstream has no such chapter");
			await this.chapterInternalDao.updateMeta(chapter.id, { numVerses: -1 });
			return { ...chapter, numVerses: -1 };
		}

		log.error({ chapterId: chapter.id, reason: e.reason, status: e.status }, "chapter fetch failed");
		return { ...chapter, loadError: toLoadError(e.reason) };
	}

	/**
	 * Fingerprints the chapter text so identical chapters can share one narration.
	 *
	 * Only hashes a chapter that looks COMPLETE. A hash over half a chapter would
	 * be adopted by every Bible sharing that text, silently serving everyone a
	 * narration that stops midway. Leaving the hash null instead just falls back
	 * to the per-Bible cache key.
	 *
	 * The `numVerses` guard below was dead until hydration started writing that
	 * column — every chapter read 0, so nothing was ever judged incomplete.
	 *
	 * Runs on cached chapters too, so rows written before this column existed
	 * backfill themselves the first time they are read.
	 */
	private async ensureContentHash(chapter: ChapterVer): Promise<void> {
		if (chapter.contentHash) return;
		if (chapter.verses.length === 0) return;
		if (chapter.numVerses && chapter.numVerses !== chapter.verses.length) {
			log.warn(
				{ chapterId: chapter.id, expected: chapter.numVerses, got: chapter.verses.length },
				"incomplete chapter; skipping content hash"
			);
			return;
		}

		const contentHash = chapterContentHash(chapter.verses);
		chapter.contentHash = contentHash;

		try {
			await this.chapterInternalDao.updateMeta(chapter.id, { contentHash });
		} catch (e) {
			// Non-fatal: the caller still has the hash in memory and the next read
			// retries. Never let a bookkeeping write break chapter delivery.
			log.error({ err: e, chapterId: chapter.id }, "failed to persist content hash");
		}
	}

	async update(chapter: Chapter): Promise<void> {
		return await this.chapterInternalDao.update(chapter);
	}


	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer | undefined> {
		return await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber);
	}

	async getByIdWithBook(id: string): Promise<ChapterFull | null> {
		return await this.chapterInternalDao.getByIdWithBook(id);
	}

}
