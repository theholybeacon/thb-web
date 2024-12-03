import { logger } from "@/app/_utils/logger";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";



const log = logger.child({ module: 'BibleExternalAPIDao' });
export class VerseExternalDao {

	async getByBibleApiIdAndAbbreviations(bibleApiId: string, abbreviations: string): Promise<string> {
		log.trace("getAll");
		const response = await fetch(
			`${BASE_URL}bibles/${bibleApiId}/verses/${abbreviations}`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();

		return data.content;
	}

}
