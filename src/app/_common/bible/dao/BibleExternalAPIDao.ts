import { logger } from "@/app/_utils/logger";
import { IBibleDao } from "./IBibleDao";
import { Bible } from "../model/Bible";
import { randomUUID } from "crypto";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";
//const BASE_QUERY_PARAMS =
//	`?content-type=text
//	&include-notes=false
//	&include-chapter-numbers=false
//	&include-titles=false
//	&include-verse-numbers=false`;


interface BibleAPI {
	id: string;
	name: string;
	language: { name: string };
	abbreviationLocal: string;
	description: string
}


const log = logger.child({ module: 'BibleExternalAPIDao' });
export class BibleExternalAPIDao implements IBibleDao {

	async getAll(): Promise<Bible[]> {
		log.trace("getAll");
		const response = await fetch(
			BASE_URL +
			'bibles',
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Bible[] = [];
		log.trace(data);
		if (data.data.length > 0) {
			data.data.map((bible: BibleAPI) => {
				output.push(Bible.create({
					bible_id: String(randomUUID()),
					api_id: bible.id,
					name: bible.name,
					language: bible.language.name,
					version: bible.abbreviationLocal,
					description: bible.description || "",
					num_books: 0,
					created_at: new Date(),
					updated_at: new Date()
				}));
			});
		}
		return output;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async create(bible: Bible): Promise<string> {
		log.trace("create");
		throw (Error("Method not valid"));
	}
}

