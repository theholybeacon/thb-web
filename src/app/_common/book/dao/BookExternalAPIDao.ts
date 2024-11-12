import { logger } from "@/app/_utils/logger";
import { IBookDao } from "./IBookDao";
import { Book } from "../model/Book";
import { randomUUID } from "crypto";

const API_KEY = process.env.book_API_KEY;
const BASE_URL = "https://api.scripture.api.book/v1/";
//const BASE_QUERY_PARAMS =
//	`?content-type=text
//	&include-notes=false
//	&include-chapter-numbers=false
//	&include-titles=false
//	&include-verse-numbers=false`;


interface BookAPI {
	id: string;
	name: string;
	language: { name: string };
	abbreviation: string;
	chapters: object[];
}


const log = logger.child({ module: 'BookExternalAPIDao' });
export class BookExternalAPIDao implements IBookDao {

	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		log.trace("getAllByBibleId");
		const response = await fetch(
			BASE_URL +
			`bibles/${bibleId}/books`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Book[] = [];
		log.trace(data);
		if (data.data.length > 0) {
			let bookNumber = 1;
			data.data.map((book: BookAPI) => {
				output.push(Book.create({
					bible_id: bibleId,
					book_id: String(randomUUID()),
					name: book.name,
					bookOrder: bookNumber,
					abbreviation: book.abbreviation,
					numChapters: book.chapters.length,
					created_at: new Date(),
					updated_at: new Date()
				}));
				bookNumber++;
			});
		}
		return output;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async create(book: Book): Promise<string> {
		log.trace("create");
		throw (Error("Method not valid"));
	}
}

