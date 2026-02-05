import { chapterTable } from "@/db/schema/chapter";
import { Verse } from "../../verse/model/Verse";
import { Book } from "../../book/model/Book";

export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export type ChapterVer = Chapter & {
	verses: Verse[]
};

export type ChapterFull = Chapter & {
	verses: Verse[],
	book: Book | null
};

export type ChapterVerNav = ChapterVer & {
	next: ChapterVer,
	prev: ChapterVer,
}
