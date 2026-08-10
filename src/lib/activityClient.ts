import { recordDailyActivitySS } from "@/app/common/activity/service/server/recordDailyActivitySS";
import { userSetTimezoneSS } from "@/app/common/user/service/server/userSetTimezoneSS";

/** Today's date in the browser's local timezone as YYYY-MM-DD. */
export function localDateString(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/**
 * Record engagement for the streak. Passive triggers (reader, step completion)
 * use this; it fires at most once per day per browser via a localStorage guard
 * and only marks the day used on a successful (authenticated) record.
 */
export async function recordActivity(source: string): Promise<void> {
	try {
		const today = localDateString();
		if (typeof window !== "undefined" && localStorage.getItem("thb_activity_date") === today) return;
		const res = await recordDailyActivitySS(today, source);
		if (res?.ok && typeof window !== "undefined") {
			localStorage.setItem("thb_activity_date", today);
		}
	} catch {
		// best-effort; never block the UI
	}
}

/**
 * Report the browser's IANA timezone so the daily email cron knows which
 * calendar day (and, on Pro, which hour) this user is in. Only writes when it
 * changes — e.g. first sign-in, or the user travels.
 */
export async function captureTimezone(): Promise<void> {
	try {
		if (typeof window === "undefined") return;
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		if (!tz || localStorage.getItem("thb_timezone") === tz) return;

		const res = await userSetTimezoneSS(tz);
		if (res?.ok) localStorage.setItem("thb_timezone", tz);
	} catch {
		// best-effort; never block the UI
	}
}
