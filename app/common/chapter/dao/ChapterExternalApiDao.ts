
import { logger } from "../../../utils/logger";
import { randomUUID } from "crypto";
import { Chapter } from "../model/Chapter";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";


interface ChapterApi {
	number: string,
}


const log = logger.child({ module: 'ChapterExternalAPIDao' });
export class ChapterExternalAPIDao {

	async getAllByBibleApiIdAndBookAbbreviation(bibleApiId: string, bookAbbreviation: string): Promise<Chapter[]> {

		log.trace(`bibles/${bibleApiId}/books/${bookAbbreviation}/chapters`);

		const response = await fetch(
			BASE_URL +
			`bibles/${bibleApiId}/books/${bookAbbreviation}/chapters`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Chapter[] = [];
		if (data.data.length > 0) {
			data.data.map((chapter: ChapterApi) => {
				output.push({
					id: randomUUID(),
					bookId: "",
					chapterNumber: chapter.number === "intro" ? 0 : Number(chapter.number),
					numVerses: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			});
		}
		return output;
	}


}

