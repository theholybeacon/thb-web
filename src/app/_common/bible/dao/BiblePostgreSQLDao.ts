import { logger } from "@/app/_utils/logger";
import { sql } from "@vercel/postgres";
import { IBibleDao } from "./IBibleDao";
import { Bible } from "../model/Bible";

const log = logger.child({ module: 'BiblePostgreSQLDao' });
export class BiblePostgreSQLDao implements IBibleDao {
	async getAll(): Promise<Bible[]> {
		log.trace("getAll");
		const response = await sql`SELECT * from bible_get_all();`;

		const output: Bible[] = [];
		if (response.rows.length > 0) {
			response.rows.map(row => {
				output.push(Bible.create(row));
			});
		}
		return output;
	}

	async create(bible: Bible): Promise<string> {
		log.trace("create");
		const response = await sql`SELECT * from bible_create(
				${bible.apiId},
				${bible.name},
				${bible.language},
				${bible.version},
				${bible.description}
			);`;
		return response.rows[0].v_bible_id;
	}
}

