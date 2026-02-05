'use server';

import { Book } from "../../model/Book";
import { BookRepository } from "../../repository/BookRepository";

/**
 * Fetches all books for a given Bible ID.
 */
export async function bookGetAllByBibleIdSS(bibleId: string): Promise<Book[]> {
    const repository = new BookRepository();
    return await repository.getAllByBibleId(bibleId);
}
