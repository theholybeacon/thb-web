import { logger } from "@/app/utils/logger";
import { Book } from "../model/Book";
import { randomUUID } from "crypto";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";

interface BookAPI {
	id: string;
	name: string;
	language: { name: string };
	abbreviation: string;
	chapters: object[];
}


const log = logger.child({ module: 'BookExternalAPIDao' });
export class BookExternalAPIDao {

	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		log.trace("getAllByBibleId");
		const response = await fetch(
			BASE_URL +
			`bibles/${bibleId}/books?include-chapters=true`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Book[] = [];
		if (data.data.length > 0) {
			let bookNumber = 1;
			data.data.map((book: BookAPI) => {
				output.push({
					id: randomUUID(),
					apiId: book.id,
					bibleId: "",
					name: book.name,
					bookOrder: bookNumber,
					abbreviation: book.abbreviation,
					numChapters: book.chapters.length,
					createdAt: new Date(),
					updatedAt: new Date()
				});
				bookNumber++;
			});
		}
		return output;
	}

}

