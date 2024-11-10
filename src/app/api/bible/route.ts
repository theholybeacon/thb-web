import { BibleGetAllSS } from "@/app/_common/bible/service/server/BibleGetAllSS";
import { logger } from "@/app/_utils/logger";

const log = logger.child({ module: 'API: bible/' });


export async function GET() {
	log.trace("GET");

	const bibleGetAllSS = new BibleGetAllSS();

	const response = await bibleGetAllSS.execute();

	return Response.json(response);
}






