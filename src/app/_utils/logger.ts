import pino, { Logger } from "pino";

export const logger: Logger =
	process.env["NODE_ENV"] === "production"
		? // JSON in production
		pino({ level: "warn" })
		: // JSON in development (handle pretty printing externally)
		pino({
			level: "debug",
		});
