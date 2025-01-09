import { logger } from "@/app/utils/logger";
import { Bible } from "../../model/Bible";

const log = logger.child({ module: 'BibleGetAllCS' });
export class BibleGetAllCS {

	async execute(): Promise<Bible[]> {
		log.trace("execute");

		const response = await fetch('/api/bible', {
			method: 'GET',
		});

		if (response.status != 200) {
			throw new Error();
		}

		const data: Bible[] = await response.json();

		return data;

	}
}


