
import { logger } from "@/app/utils/logger";
import { Book, BookInsert } from "../model/Book";
import { db } from "@/db";
import { bookTable } from "@/db/schema/book";
import { and, eq, gt, ilike } from "drizzle-orm";

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

	async getBySlugAndBibleId(bibleId: string, slug: string): Promise<Book | null> {
		const response = await db.query.bookTable.findFirst({
			where: and(
				eq(bookTable.bibleId, bibleId),
				eq(bookTable.slug, slug),
			),
		});

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
		const returned = await db.insert(bookTable).values(book)
			.onConflictDoNothing({ target: [bookTable.bibleId, bookTable.abbreviation] })
			.returning();
		return returned[0] ?? (await this.getByAbbreviationAndBibleId(book.bibleId, book.abbreviation))!;
	}

	/**
	 * Seeds a translation's book list. Books another request already stored are
	 * left as they are, so concurrent first reads of a translation can't create
	 * a second copy of any book.
	 */
	async createMany(books: BookInsert[]): Promise<void> {
		log.trace("createMany");
		if (books.length === 0) return;
		await db.insert(bookTable).values(books)
			.onConflictDoNothing({ target: [bookTable.bibleId, bookTable.abbreviation] });
	}

	async getNextByOrder(bibleId: string, currentBookOrder: number): Promise<Book | null> {
		const response = await db.query.bookTable.findFirst({
			where: and(
				eq(bookTable.bibleId, bibleId),
				gt(bookTable.bookOrder, currentBookOrder),
			),
			orderBy: bookTable.bookOrder,
		});
		return response || null;
	}
}

