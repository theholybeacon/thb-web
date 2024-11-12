import { Book } from "../model/Book";

export interface IBookDao {
	create(book: Book): Promise<string>;
	getAllByBibleId(bibleId: string): Promise<Book[]>;
}


