import { InitialLoadSS } from "@/app/_common/initial-load/service/server/InitialLoadSS";
import { logger } from "@/app/_utils/logger";

const log = logger.child({ module: 'API: bible/' });


export async function GET() {
	log.trace("GET");

	try {
		const initialLoadSS = new InitialLoadSS();
		await initialLoadSS.execute();
	} catch (e) {
		console.error(e);
		return new Response(String(e), {
			status: 500,
		})
	}
	return new Response("", {
		status: 200,
	})

}






