
import { logger } from "@/app/utils/logger";
import { Book, BookInsert } from "../model/Book";
import { db } from "@/db";
import { bookTable } from "@/db/schema/book";
import { and, eq, ilike } from "drizzle-orm";

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
	async getByAbbreviationAndBibleId(bibleId: string, abbreviation: string): Promise<Book | null> {
		// Try exact match first
		let response = await db.query.bookTable.findFirst({
			where: and(
				eq(bookTable.bibleId, bibleId),
				eq(bookTable.abbreviation, abbreviation),
			),
		});

		// If not found, try case-insensitive match
		if (!response) {
			response = await db.query.bookTable.findFirst({
				where: and(
					eq(bookTable.bibleId, bibleId),
					ilike(bookTable.abbreviation, abbreviation),
				),
			});
		}

		return response || null;
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

