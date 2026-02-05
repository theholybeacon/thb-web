import { logger } from "@/app/utils/logger";
import { selectBibleSchema } from "@/db/schema/bible";
import { Bible } from "../model/Bible";
import { toUrlSlug, makeUniqueSlug } from "@/lib/slug";

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
		const usedSlugs = new Set<string>();

		if (data.data.length > 0) {
			data.data.map((bible: BibleAPI) => {
				// Build base slug from abbreviation, falling back to name or apiId
				const abbreviation = bible.abbreviationLocal || bible.name || bible.id;
				const langCode = toUrlSlug(bible.language.name).slice(0, 2) || 'xx';

				// Create base slug with language suffix for specificity
				let baseSlug = toUrlSlug(abbreviation);
				if (!baseSlug || baseSlug === 'untitled') {
					// Fallback: use first 8 chars of apiId
					baseSlug = `bible-${bible.id.slice(0, 8)}`;
				}

				// Make slug unique by adding language and handling collisions
				const slug = makeUniqueSlug(baseSlug, usedSlugs, langCode);
				usedSlugs.add(slug);

				output.push(selectBibleSchema.parse({
					id: crypto.randomUUID(),
					bibleId: crypto.randomUUID(),
					apiId: bible.id,
					name: bible.name,
					language: bible.language.name,
					version: bible.abbreviationLocal,
					slug,
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
