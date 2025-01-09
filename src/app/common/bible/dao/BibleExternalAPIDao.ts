import { logger } from "@/app/utils/logger";
import { randomUUID } from "crypto";
import { selectBibleSchema } from "@/db/schema/bible";
import { Bible } from "../model/Bible";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";

interface BibleAPI {
	id: string;
	name: string;
	language: { name: string };
	abbreviationLocal: string;
	description: string
}


const log = logger.child({ module: 'BibleExternalAPIDao' });
export class BibleExternalAPIDao {

	async getAll(): Promise<Bible[]> {
		log.trace("getAll");
		const response = await fetch(
			`${BASE_URL}bibles`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Bible[] = [];
		if (data.data.length > 0) {
			data.data.map((bible: BibleAPI) => {
				output.push(selectBibleSchema.parse({
					id: String(randomUUID()),
					bibleId: String(randomUUID()),
					apiId: bible.id,
					name: bible.name,
					language: bible.language.name,
					version: bible.abbreviationLocal,
					description: bible.description || "",
					numBooks: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				}));
			});
		}
		return output;
	}

}
