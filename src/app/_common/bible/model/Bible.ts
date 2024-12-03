import { bibleTable } from "@/db/schema/bible";
import { BookWithChapters } from "../../book/model/Book";

export type BibleInsert = typeof bibleTable.$inferInsert;
export type Bible = typeof bibleTable.$inferSelect;


export type BibleWithBooks = typeof bibleTable.$inferSelect
	& {
		books: BookWithChapters[],
	};

