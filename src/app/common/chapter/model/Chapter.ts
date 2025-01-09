import { chapterTable } from "@/db/schema/chapter";
import { Verse } from "../../verse/model/Verse";

export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export type ChapterVer = Chapter & {
	verses: Verse[]
};

export type ChapterVerNav = ChapterVer & {
	next: ChapterVer,
	prev: ChapterVer,
}
