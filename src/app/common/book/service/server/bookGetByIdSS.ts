"use server";
import { Book } from "../../model/Book";
import { BookRepository } from "../../repository/BookRepository";

export async function bookGetByIdSS(bookId: string): Promise<Book> {

    const repository = new BookRepository();

    return await repository.getById(bookId);

}
