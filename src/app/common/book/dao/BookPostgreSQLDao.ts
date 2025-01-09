
import { logger } from "@/app/utils/logger";
import { Book, BookInsert } from "../model/Book";
import { db } from "@/db";
import { bookTable } from "@/db/schema/book";
import { eq } from "drizzle-orm";

const log = logger.child({ module: 'BookPostgreSQLDao' });
export class BookPostgreSQLDao {

	async getById(id: string): Promise<Book> {
		const response = await db.query.bookTable.findFirst({
			where: eq(bookTable.id, id),
		});

		if (!response) {
			throw Error("Book not found");
		}
		return response;
	}

	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		return await db.query.bookTable.findMany({
			where: eq(bookTable.bibleId, bibleId),
			orderBy: bookTable.bookOrder
		});
	}

	async create(book: BookInsert): Promise<Book> {
		log.trace("create");
		const returned = await db.insert(bookTable).values(book).returning();
		return returned[0];
	}
}

