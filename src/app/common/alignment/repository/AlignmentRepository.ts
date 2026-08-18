import { AlignmentPostgreSQLDao, type InferredKey } from "../dao/AlignmentPostgreSQLDao";
import { AlignmentBook, AlignmentInferred, AlignmentWord, AlignmentWordInsert, StrongsEntry, StrongsEntryInsert } from "../model/Alignment";

export class AlignmentRepository {

	private alignmentPostgreSQLDao = new AlignmentPostgreSQLDao();

	async getVerse(
		sourceCode: string, bookAbbreviation: string, chapter: number, verse: number,
	): Promise<AlignmentWord[]> {
		return await this.alignmentPostgreSQLDao.getVerse(sourceCode, bookAbbreviation, chapter, verse);
	}

	async getWord(
		sourceCode: string, bookAbbreviation: string, chapter: number, verse: number,
		surfaceNorm: string, occurrence: number,
	): Promise<AlignmentWord | null> {
		return await this.alignmentPostgreSQLDao.getWord(
			sourceCode, bookAbbreviation, chapter, verse, surfaceNorm, occurrence);
	}

	async findBySurfaceContaining(
		sourceCode: string, bookAbbreviation: string, chapter: number, verse: number, surfaceNorm: string,
	): Promise<AlignmentWord[]> {
		return await this.alignmentPostgreSQLDao.findBySurfaceContaining(
			sourceCode, bookAbbreviation, chapter, verse, surfaceNorm);
	}

	async getStrongsEntries(ids: string[]): Promise<StrongsEntry[]> {
		return await this.alignmentPostgreSQLDao.getStrongsEntries(ids);
	}

	async insertWords(words: AlignmentWordInsert[]): Promise<void> {
		return await this.alignmentPostgreSQLDao.insertWords(words);
	}

	async deleteSource(sourceCode: string): Promise<void> {
		return await this.alignmentPostgreSQLDao.deleteSource(sourceCode);
	}

	async upsertStrongsEntries(entries: StrongsEntryInsert[]): Promise<void> {
		return await this.alignmentPostgreSQLDao.upsertStrongsEntries(entries);
	}

	async countWords(sourceCode: string): Promise<number> {
		return await this.alignmentPostgreSQLDao.countWords(sourceCode);
	}

	// --- Per-book load status -------------------------------------------------

	async getBook(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<AlignmentBook | null> {
		return await this.alignmentPostgreSQLDao.getBook(sourceCode, bookAbbreviation, chapter);
	}

	async getBooks(sourceCodes: string[], bookAbbreviation: string, chapter = 0): Promise<AlignmentBook[]> {
		return await this.alignmentPostgreSQLDao.getBooks(sourceCodes, bookAbbreviation, chapter);
	}

	async ensureBookRow(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<void> {
		return await this.alignmentPostgreSQLDao.ensureBookRow(sourceCode, bookAbbreviation, chapter);
	}

	async claimBookForLoad(sourceCode: string, bookAbbreviation: string, chapter = 0): Promise<boolean> {
		return await this.alignmentPostgreSQLDao.claimBookForLoad(sourceCode, bookAbbreviation, chapter);
	}

	async markBookReady(
		sourceCode: string, bookAbbreviation: string, wordCount: number, blobPathname: string, chapter = 0,
	): Promise<void> {
		return await this.alignmentPostgreSQLDao.markBookReady(sourceCode, bookAbbreviation, wordCount, blobPathname, chapter);
	}

	async markBookFailed(sourceCode: string, bookAbbreviation: string, error: string, chapter = 0): Promise<void> {
		return await this.alignmentPostgreSQLDao.markBookFailed(sourceCode, bookAbbreviation, error, chapter);
	}

	async reclaimStaleBooks(olderThanMs: number): Promise<number> {
		return await this.alignmentPostgreSQLDao.reclaimStaleBooks(olderThanMs);
	}

	async deleteBookWords(sourceCode: string, bookAbbreviation: string, chapter?: number): Promise<void> {
		return await this.alignmentPostgreSQLDao.deleteBookWords(sourceCode, bookAbbreviation, chapter);
	}

	async countStrongsEntries(): Promise<number> {
		return await this.alignmentPostgreSQLDao.countStrongsEntries();
	}

	// --- Inferred alignment cache --------------------------------------------

	async getInferred(k: InferredKey): Promise<AlignmentInferred | null> {
		return await this.alignmentPostgreSQLDao.getInferred(k);
	}
	async ensureInferredRow(k: InferredKey): Promise<void> {
		return await this.alignmentPostgreSQLDao.ensureInferredRow(k);
	}
	async claimInferred(k: InferredKey): Promise<boolean> {
		return await this.alignmentPostgreSQLDao.claimInferred(k);
	}
	async markInferredReady(k: InferredKey, strongs: string | null, candidateSource: string, model: string): Promise<void> {
		return await this.alignmentPostgreSQLDao.markInferredReady(k, strongs, candidateSource, model);
	}
	async markInferredFailed(k: InferredKey, error: string): Promise<void> {
		return await this.alignmentPostgreSQLDao.markInferredFailed(k, error);
	}
	async reclaimStaleInferred(olderThanMs: number): Promise<number> {
		return await this.alignmentPostgreSQLDao.reclaimStaleInferred(olderThanMs);
	}
}
