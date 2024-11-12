
import { logger } from "@/app/_utils/logger";
import { sql } from "@vercel/postgres";
import { Book } from "../model/Book";
import { IBookDao } from "./IBookDao";

const log = logger.child({ module: 'BookPostgreSQLDao' });
export class BookPostgreSQLDao implements IBookDao {
	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		log.trace("getAllByBibleId");
		const response = await sql`SELECT * from book_get_all_by_bible_id(${bibleId});`;

		const output: Book[] = [];
		if (response.rows.length > 0) {
			response.rows.map(row => {
				output.push(Book.create(row));
			});
		}
		return output;
	}

	async create(book: Book): Promise<string> {
		log.trace("create");
		const response = await sql`SELECT * from book_create(
				${book.bibleId},
				${book.bookId},
				${book.name},
				${book.bookOrder},
				${book.abbreviation},
				${book.numChapters}
			);`;
		return response.rows[0].v_book_id;
	}
}

