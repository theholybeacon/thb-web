/**
 * The 66-book Protestant canon, as a pure constant.
 *
 * This is deliberately NOT derived from the `book` table. `book` rows are
 * per-translation (`book.bibleId`) and translations disagree about the canon —
 * Catholic and Orthodox editions carry deuterocanonical books. A DB-derived
 * denominator would therefore make "42% of the Bible" mean something different
 * for every user, and would make the completion grid un-comparable between two
 * people. A fixed denominator keeps the number honest and shareable.
 *
 * Being DB-free also means the grid and the OG share card render with zero
 * round-trips, and that this module is importable from client components.
 *
 * `usfm` matches `book.abbreviation` (api.bible ids) and the OSIS_TO_USFM map in
 * scripts/import-bible-people.ts — the same canonical vocabulary already used by
 * study_step, session, entity_mention, note and audio_asset.
 *
 * Completions recorded against a book outside this list (deuterocanon) are
 * stored — the row is harmless — but excluded from all coverage math.
 */

export type Testament = "OT" | "NT";

export type CanonGroup =
	| "torah"
	| "history"
	| "wisdom"
	| "majorProphets"
	| "minorProphets"
	| "gospels"
	| "acts"
	| "pauline"
	| "general"
	| "apocalyptic";

export type CanonBook = {
	usfm: string;
	order: number;
	chapters: number;
	testament: Testament;
	group: CanonGroup;
	/**
	 * Fallback only. Prefer `book.name` from the user's Bible, which is already
	 * localized per translation (a Spanish Bible carries Spanish book names) —
	 * that avoids duplicating 66 names per locale in the message files.
	 */
	englishName: string;
};

export const CANON: CanonBook[] = [
	// --- Old Testament ---------------------------------------------------------
	{ usfm: "GEN", order: 1, chapters: 50, testament: "OT", group: "torah", englishName: "Genesis" },
	{ usfm: "EXO", order: 2, chapters: 40, testament: "OT", group: "torah", englishName: "Exodus" },
	{ usfm: "LEV", order: 3, chapters: 27, testament: "OT", group: "torah", englishName: "Leviticus" },
	{ usfm: "NUM", order: 4, chapters: 36, testament: "OT", group: "torah", englishName: "Numbers" },
	{ usfm: "DEU", order: 5, chapters: 34, testament: "OT", group: "torah", englishName: "Deuteronomy" },
	{ usfm: "JOS", order: 6, chapters: 24, testament: "OT", group: "history", englishName: "Joshua" },
	{ usfm: "JDG", order: 7, chapters: 21, testament: "OT", group: "history", englishName: "Judges" },
	{ usfm: "RUT", order: 8, chapters: 4, testament: "OT", group: "history", englishName: "Ruth" },
	{ usfm: "1SA", order: 9, chapters: 31, testament: "OT", group: "history", englishName: "1 Samuel" },
	{ usfm: "2SA", order: 10, chapters: 24, testament: "OT", group: "history", englishName: "2 Samuel" },
	{ usfm: "1KI", order: 11, chapters: 22, testament: "OT", group: "history", englishName: "1 Kings" },
	{ usfm: "2KI", order: 12, chapters: 25, testament: "OT", group: "history", englishName: "2 Kings" },
	{ usfm: "1CH", order: 13, chapters: 29, testament: "OT", group: "history", englishName: "1 Chronicles" },
	{ usfm: "2CH", order: 14, chapters: 36, testament: "OT", group: "history", englishName: "2 Chronicles" },
	{ usfm: "EZR", order: 15, chapters: 10, testament: "OT", group: "history", englishName: "Ezra" },
	{ usfm: "NEH", order: 16, chapters: 13, testament: "OT", group: "history", englishName: "Nehemiah" },
	{ usfm: "EST", order: 17, chapters: 10, testament: "OT", group: "history", englishName: "Esther" },
	{ usfm: "JOB", order: 18, chapters: 42, testament: "OT", group: "wisdom", englishName: "Job" },
	{ usfm: "PSA", order: 19, chapters: 150, testament: "OT", group: "wisdom", englishName: "Psalms" },
	{ usfm: "PRO", order: 20, chapters: 31, testament: "OT", group: "wisdom", englishName: "Proverbs" },
	{ usfm: "ECC", order: 21, chapters: 12, testament: "OT", group: "wisdom", englishName: "Ecclesiastes" },
	{ usfm: "SNG", order: 22, chapters: 8, testament: "OT", group: "wisdom", englishName: "Song of Solomon" },
	{ usfm: "ISA", order: 23, chapters: 66, testament: "OT", group: "majorProphets", englishName: "Isaiah" },
	{ usfm: "JER", order: 24, chapters: 52, testament: "OT", group: "majorProphets", englishName: "Jeremiah" },
	{ usfm: "LAM", order: 25, chapters: 5, testament: "OT", group: "majorProphets", englishName: "Lamentations" },
	{ usfm: "EZK", order: 26, chapters: 48, testament: "OT", group: "majorProphets", englishName: "Ezekiel" },
	{ usfm: "DAN", order: 27, chapters: 12, testament: "OT", group: "majorProphets", englishName: "Daniel" },
	{ usfm: "HOS", order: 28, chapters: 14, testament: "OT", group: "minorProphets", englishName: "Hosea" },
	{ usfm: "JOL", order: 29, chapters: 3, testament: "OT", group: "minorProphets", englishName: "Joel" },
	{ usfm: "AMO", order: 30, chapters: 9, testament: "OT", group: "minorProphets", englishName: "Amos" },
	{ usfm: "OBA", order: 31, chapters: 1, testament: "OT", group: "minorProphets", englishName: "Obadiah" },
	{ usfm: "JON", order: 32, chapters: 4, testament: "OT", group: "minorProphets", englishName: "Jonah" },
	{ usfm: "MIC", order: 33, chapters: 7, testament: "OT", group: "minorProphets", englishName: "Micah" },
	{ usfm: "NAM", order: 34, chapters: 3, testament: "OT", group: "minorProphets", englishName: "Nahum" },
	{ usfm: "HAB", order: 35, chapters: 3, testament: "OT", group: "minorProphets", englishName: "Habakkuk" },
	{ usfm: "ZEP", order: 36, chapters: 3, testament: "OT", group: "minorProphets", englishName: "Zephaniah" },
	{ usfm: "HAG", order: 37, chapters: 2, testament: "OT", group: "minorProphets", englishName: "Haggai" },
	{ usfm: "ZEC", order: 38, chapters: 14, testament: "OT", group: "minorProphets", englishName: "Zechariah" },
	{ usfm: "MAL", order: 39, chapters: 4, testament: "OT", group: "minorProphets", englishName: "Malachi" },

	// --- New Testament ---------------------------------------------------------
	{ usfm: "MAT", order: 40, chapters: 28, testament: "NT", group: "gospels", englishName: "Matthew" },
	{ usfm: "MRK", order: 41, chapters: 16, testament: "NT", group: "gospels", englishName: "Mark" },
	{ usfm: "LUK", order: 42, chapters: 24, testament: "NT", group: "gospels", englishName: "Luke" },
	{ usfm: "JHN", order: 43, chapters: 21, testament: "NT", group: "gospels", englishName: "John" },
	{ usfm: "ACT", order: 44, chapters: 28, testament: "NT", group: "acts", englishName: "Acts" },
	{ usfm: "ROM", order: 45, chapters: 16, testament: "NT", group: "pauline", englishName: "Romans" },
	{ usfm: "1CO", order: 46, chapters: 16, testament: "NT", group: "pauline", englishName: "1 Corinthians" },
	{ usfm: "2CO", order: 47, chapters: 13, testament: "NT", group: "pauline", englishName: "2 Corinthians" },
	{ usfm: "GAL", order: 48, chapters: 6, testament: "NT", group: "pauline", englishName: "Galatians" },
	{ usfm: "EPH", order: 49, chapters: 6, testament: "NT", group: "pauline", englishName: "Ephesians" },
	{ usfm: "PHP", order: 50, chapters: 4, testament: "NT", group: "pauline", englishName: "Philippians" },
	{ usfm: "COL", order: 51, chapters: 4, testament: "NT", group: "pauline", englishName: "Colossians" },
	{ usfm: "1TH", order: 52, chapters: 5, testament: "NT", group: "pauline", englishName: "1 Thessalonians" },
	{ usfm: "2TH", order: 53, chapters: 3, testament: "NT", group: "pauline", englishName: "2 Thessalonians" },
	{ usfm: "1TI", order: 54, chapters: 6, testament: "NT", group: "pauline", englishName: "1 Timothy" },
	{ usfm: "2TI", order: 55, chapters: 4, testament: "NT", group: "pauline", englishName: "2 Timothy" },
	{ usfm: "TIT", order: 56, chapters: 3, testament: "NT", group: "pauline", englishName: "Titus" },
	{ usfm: "PHM", order: 57, chapters: 1, testament: "NT", group: "pauline", englishName: "Philemon" },
	{ usfm: "HEB", order: 58, chapters: 13, testament: "NT", group: "general", englishName: "Hebrews" },
	{ usfm: "JAS", order: 59, chapters: 5, testament: "NT", group: "general", englishName: "James" },
	{ usfm: "1PE", order: 60, chapters: 5, testament: "NT", group: "general", englishName: "1 Peter" },
	{ usfm: "2PE", order: 61, chapters: 3, testament: "NT", group: "general", englishName: "2 Peter" },
	{ usfm: "1JN", order: 62, chapters: 5, testament: "NT", group: "general", englishName: "1 John" },
	{ usfm: "2JN", order: 63, chapters: 1, testament: "NT", group: "general", englishName: "2 John" },
	{ usfm: "3JN", order: 64, chapters: 1, testament: "NT", group: "general", englishName: "3 John" },
	{ usfm: "JUD", order: 65, chapters: 1, testament: "NT", group: "general", englishName: "Jude" },
	{ usfm: "REV", order: 66, chapters: 22, testament: "NT", group: "apocalyptic", englishName: "Revelation" },
];

const BY_USFM = new Map(CANON.map((b) => [b.usfm, b]));

export function canonBook(usfm: string): CanonBook | undefined {
	return BY_USFM.get(usfm);
}

/** True for the 66 books the completion percentages are measured against. */
export function isCanonical(usfm: string): boolean {
	return BY_USFM.has(usfm);
}

function sumChapters(books: CanonBook[]): number {
	return books.reduce((total, b) => total + b.chapters, 0);
}

export const OT_BOOKS = CANON.filter((b) => b.testament === "OT");
export const NT_BOOKS = CANON.filter((b) => b.testament === "NT");

export const TOTAL_BOOKS = CANON.length; // 66
export const OT_CHAPTERS = sumChapters(OT_BOOKS); // 929
export const NT_CHAPTERS = sumChapters(NT_BOOKS); // 260
export const TOTAL_CHAPTERS = OT_CHAPTERS + NT_CHAPTERS; // 1189

/** Named book sets behind the milestone badges (see completion/model/badges.ts). */
export const CANON_GROUP_USFMS: Record<CanonGroup, string[]> = CANON.reduce(
	(acc, b) => {
		acc[b.group].push(b.usfm);
		return acc;
	},
	{
		torah: [], history: [], wisdom: [], majorProphets: [], minorProphets: [],
		gospels: [], acts: [], pauline: [], general: [], apocalyptic: [],
	} as Record<CanonGroup, string[]>,
);
