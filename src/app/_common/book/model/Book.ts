import { bookTable } from "@/db/schema/book";
import { ChapterVer } from "../../chapter/model/Chapter";


export type BookInsert = typeof bookTable.$inferInsert;
export type Book = typeof bookTable.$inferSelect;

export type BookWithChapters = typeof bookTable.$inferSelect
	& {
		chapters: ChapterVer[]
	};

