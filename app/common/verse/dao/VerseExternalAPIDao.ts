import { logger } from "../../../utils/logger";
import { VerseInsert } from "../model/Verse";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";



const log = logger.child({ module: 'VerseExternalDao' });
export class VerseExternalDao {

	async getByBibleApiIdAndVerseAbbreviation(bibleApiId: string, bookApiId: string, chapterNumber: number, verseNumber: number): Promise<VerseInsert> {
		log.trace("getByBibleApiIdAndVerseAbbreviation");

		log.trace(`${BASE_URL}bibles/${bibleApiId}/verses/${bookApiId}.${chapterNumber === 0 ? 'intro' : chapterNumber}.${verseNumber}`);
		const response = await fetch(
			`${BASE_URL}bibles/${bibleApiId}/verses/${bookApiId}.${chapterNumber === 0 ? 'intro' : chapterNumber}.${verseNumber}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		return {
			content: data.data.content,
			chapterId: "",
			verseNumber: verseNumber
		}
	}

}
