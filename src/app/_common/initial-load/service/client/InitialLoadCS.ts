import { logger } from "@/app/_utils/logger";

const log = logger.child({ module: 'BibleGetAllCS' });
export class InitialLoadCS {

	async execute(): Promise<void> {
		log.trace("execute");

		const response = await fetch('/api/initial-load', {
			method: 'GET',
		});

		if (response.status != 200) {
			throw new Error();
		}
	}
}


