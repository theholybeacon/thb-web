import { logger } from "@/app/utils/logger";
import { BibleRepository } from "../../bible/repository/BibleRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { NoteTargetInput } from "../model/Note";

const log = logger.child({ module: 'noteTargetResolver' });

export interface ResolvedNoteTarget {
	bibleId: string;
	bookAbbreviation: string | null;
	chapter: number | null;
	verse: number | null;
	reference: string;
	bookName: string | null;
	bibleSlug: string;
	bookSlug: string | null;
}

function isPositiveInt(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Resolves however a caller addressed a book (abbreviation, apiId or slug — they
 * differ per translation) to the one canonical key notes are stored under.
 *
 * Both the write and the read path go through this, so the key a note is saved
 * with and the key it is later looked up by can never drift apart.
 */
export async function resolveCanonicalBook(bibleId: string, requested: string) {
	const books = await new BookRepository().getAllByBibleId(bibleId);
	const needle = requested.trim().toLowerCase();

	return books.find((b) =>
		b.abbreviation.toLowerCase() === needle ||
		b.apiId.toLowerCase() === needle ||
		b.slug === needle
	) ?? null;
}

/**
 * Validates a note target against the real bible/book and produces the
 * denormalized display fields. Server-side only, so a client cannot anchor a
 * note to scripture that does not exist.
 *
 * The anchor itself stays canonical (uppercased USFM abbreviation + numbers),
 * matching entity_mention — the slugs and names resolved here are for display
 * and back-links, not for matching.
 */
export async function resolveNoteTarget(input: NoteTargetInput): Promise<ResolvedNoteTarget | null> {
	const bibleRepository = new BibleRepository();

	try {
		const bible = await bibleRepository.getBasicById(input.bibleId);
		if (!bible) return null;

		if (input.targetType === "bible") {
			return {
				bibleId: bible.id,
				bookAbbreviation: null,
				chapter: null,
				verse: null,
				reference: bible.version || bible.name,
				bookName: null,
				bibleSlug: bible.slug,
				bookSlug: null,
			};
		}

		if (!input.bookAbbreviation) return null;

		const book = await resolveCanonicalBook(bible.id, input.bookAbbreviation);
		if (!book) return null;

		const base = {
			bibleId: bible.id,
			// apiId is the canonical USFM id ("JHN") — the same key entity_mention
			// uses, and the only one that is stable across translations. Normalizing
			// here is what lets a note written in one translation be found in another.
			bookAbbreviation: book.apiId.toUpperCase(),
			bookName: book.name,
			bibleSlug: bible.slug,
			bookSlug: book.slug,
		};

		if (input.targetType === "book") {
			return { ...base, chapter: null, verse: null, reference: book.name };
		}

		if (!isPositiveInt(input.chapter)) return null;
		if (input.chapter > (book.numChapters || Number.MAX_SAFE_INTEGER)) return null;

		if (input.targetType === "chapter") {
			return {
				...base,
				chapter: input.chapter,
				verse: null,
				reference: `${book.name} ${input.chapter}`,
			};
		}

		if (!isPositiveInt(input.verse)) return null;

		return {
			...base,
			chapter: input.chapter,
			verse: input.verse,
			reference: `${book.name} ${input.chapter}:${input.verse}`,
		};
	} catch (error) {
		log.error(`Could not resolve note target: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}
