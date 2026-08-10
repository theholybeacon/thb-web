/**
 * The Hobby <-> Pro seam for scheduled email.
 *
 * Vercel Hobby caps cron at ONE run per day (with up to 59 minutes of drift), so
 * timezone-aware delivery is impossible there: the single run has to email
 * everyone at the same absolute moment. Pro allows a per-minute cron, so an
 * hourly sweep can deliver to each user at their own local `SEND_HOUR`.
 *
 * Both plans run identical code. Upgrading means:
 *   1. vercel.json  -> "schedule": "0 * * * *"   (from "0 12 * * *")
 *   2. env          -> CRON_HOURLY_SWEEP=1
 * ...and nothing else.
 */

/** Target local hour for the daily email when running the hourly (Pro) sweep. */
export const SEND_HOUR = 8;

/**
 * Fixed UTC hour for the once-daily (Hobby) sweep. 12:00 UTC lands at ~7am in
 * Bogotá/Lima, 8am in New York, and early afternoon in Madrid — chosen to suit
 * the Americas-weighted user base. Vercel may fire it anywhere in the hour.
 */
export const HOBBY_SWEEP_UTC_HOUR = 12;

const HOURLY = process.env.CRON_HOURLY_SWEEP === "1";

/** IANA zone used for users who haven't reported one yet. */
export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || "America/Bogota";

/**
 * On the hourly (Pro) sweep, only users whose local clock currently reads
 * SEND_HOUR are in scope. On the once-daily (Hobby) sweep there is no second
 * chance today, so every eligible user is in scope regardless of local hour.
 */
export function isInSendWindow(localHour: number): boolean {
	return HOURLY ? localHour === SEND_HOUR : true;
}

export function isHourlySweep(): boolean {
	return HOURLY;
}

/** Validate an IANA zone, falling back to DEFAULT_TIMEZONE. */
export function safeTimezone(tz: string | null | undefined): string {
	if (!tz) return DEFAULT_TIMEZONE;
	try {
		new Intl.DateTimeFormat("en-CA", { timeZone: tz });
		return tz;
	} catch {
		return DEFAULT_TIMEZONE;
	}
}

/**
 * The calendar date in `tz` as YYYY-MM-DD. `en-CA` formats dates in exactly that
 * shape, which is why it's used here rather than a timezone library.
 */
export function localDateInTz(tz: string, now: Date): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

/** The hour (0-23) in `tz`. */
export function localHourInTz(tz: string, now: Date): number {
	const h = new Intl.DateTimeFormat("en-GB", {
		timeZone: tz,
		hour: "2-digit",
		hourCycle: "h23",
	}).format(now);
	return Number.parseInt(h, 10);
}
