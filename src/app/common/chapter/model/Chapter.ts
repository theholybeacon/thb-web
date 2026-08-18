import { chapterTable } from "@/db/schema/chapter";
import { Verse } from "../../verse/model/Verse";
import { Book } from "../../book/model/Book";
import { ChapterLoadError } from "./ChapterFetchError";

export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export type ChapterVer = Chapter & {
	verses: Verse[],
	/**
	 * Set when the text could not be fetched from api.bible. Distinguishes an
	 * outage from a chapter that genuinely has no text — the reader renders a
	 * different state for each. Absent on a healthy read.
	 */
	loadError?: ChapterLoadError | null,
};

export type ChapterFull = Chapter & {
	verses: Verse[],
	book: Book | null
};

