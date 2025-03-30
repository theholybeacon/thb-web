"use server";
import { Book } from "../../model/Book";
import { BookRepository } from "../../repository/BookRepository";

export async function bookGetByAbbreviationAndBibleIdSS(bibleId: string, abbreviation: string): Promise<Book> {
    const repository = new BookRepository();
    return await repository.getByAbbreviationAndBibleId(bibleId, abbreviation);
}
