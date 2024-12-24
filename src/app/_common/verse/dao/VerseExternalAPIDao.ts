import { logger } from "@/app/_utils/logger";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";



const log = logger.child({ module: 'VerseExternalDao' });
export class VerseExternalDao {

	async getByBibleApiIdAndAbbreviations(bibleApiId: string, abbreviations: string): Promise<string | null> {
		log.trace("getByBibleApiIdAndAbbreviations");

		try {
			const response = await fetch(
				`${BASE_URL}bibles/${bibleApiId}/verses/${abbreviations}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`,
				{

					headers: {
						'api-key': API_KEY!,
					},
				},
			);
			const data = await response.json();
			console.log(data.data.content);
			return data.data.content;
		} catch (e) {
			return null;
		}
	}

}
