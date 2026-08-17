import { logger } from "@/app/utils/logger";
import { chapterContentHash } from "@/lib/chapterHash";
import { BibleRepository } from "../../bible/repository/BibleRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { VerseRepository } from "../../verse/repository/VerseRepository";
import { ChapterExternalAPIDao } from "../dao/ChapterExternalApiDao";
import { ChapterPostgreSQLDao } from "../dao/ChapterPostgreSQLDao";
import { Chapter, ChapterFull, ChapterInsert, ChapterVer, ChapterVerNav } from "../model/Chapter";

const log = logger.child({ module: 'ChapterRepository' });
export class ChapterRepository {
	private chapterInternalDao = new ChapterPostgreSQLDao();
	private chapterExternalDao = new ChapterExternalAPIDao();

	private bookRepository = new BookRepository();
	private bibleRepository = new BibleRepository();
	private verseRepository = new VerseRepository();

	async create(chapter: ChapterInsert): Promise<Chapter> {
		return await this.chapterInternalDao.create(chapter);
	}

	async getAllByBookId(bookId: string): Promise<Chapter[]> {

		let output = await this.chapterInternalDao.getAllByBookId(bookId);

		if (output.length === 0) {
			const bookToFetch = await this.bookRepository.getById(bookId);
			const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);

			output = await this.chapterExternalDao.getAllByBibleApiIdAndBookAbbreviation(
				bibleToFetch!.apiId,
				bookToFetch.apiId
			);
			await Promise.all(output.map(async (actual) => {
				actual.bookId = bookToFetch.id;
				await this.chapterInternalDao.create(actual);
			}));
		}
		return output;
	}

	async getById(id: string): Promise<Chapter> {
		return await this.chapterInternalDao.getById(id);
	}

	async getFullChapter(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		log.trace("getFullChapter");

		// Check if chapter exists in database
		let chapter = await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber);

		const bookToFetch = await this.bookRepository.getById(bookId);
		const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);

		// If chapter doesn't exist, create it first
		if (!chapter) {
			log.debug("Chapter not found in DB, creating it");
			const newChapter = await this.chapterInternalDao.create({
				bookId,
				chapterNumber,
			});
			chapter = { ...newChapter, verses: [] };
		}

		// If we don't have verses yet, fetch them from API
		if (chapter.verses.length === 0) {
			log.debug("Fetching verses from API");
			let verseNumber = 1;
			let prevContent = "";

			while (true) {
				try {
					const verseToAdd = await this.verseRepository.getByBibleApiIdAndVerseAbbreviation(
						bibleToFetch!.apiId,
						bookToFetch.apiId,
						chapterNumber,
						verseNumber
					);

					// Set the chapter ID
					verseToAdd.chapterId = chapter.id;

					// Check for duplicate content (API sometimes returns same content at end)
					if (prevContent === verseToAdd.content) {
						break;
					}
					prevContent = verseToAdd.content;

					const addedVerse = await this.verseRepository.create(verseToAdd);
					chapter.verses.push(addedVerse);
					verseNumber++;

				} catch (e) {
					log.error(e);
					break;
				}
			}
		}

		await this.ensureContentHash(chapter);

		return chapter;
	}

	/**
	 * Fingerprints the chapter text so identical chapters can share one narration.
	 *
	 * Only hashes a chapter that looks COMPLETE. The fetch loop above exits on an
	 * API error or a repeated verse, so a truncated chapter is possible — and a
	 * hash over half a chapter would be adopted by every Bible sharing that text,
	 * silently serving everyone a narration that stops midway. Leaving the hash
	 * null instead just falls back to the per-Bible cache key.
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
			await this.chapterInternalDao.update({ ...chapter, contentHash });
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
