import type { NextRequest } from "next/server";
import { dailyEmailSweep } from "@/app/common/notification/service/server/dailyEmailSweep";

/**
 * Hobby's ceiling is 60s — NOT 300, which an earlier comment here claimed and
 * which fails the deploy outright ("invalid maxDuration value ... between 1 and
 * 60 for plan hobby"). Raise to 300 only alongside a Pro upgrade.
 *
 * The sweep is capped (RUN_CAP) so it finishes well inside this.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Daily lifecycle emails. Triggered by the Vercel cron in `vercel.json`, which
 * sends `Authorization: Bearer $CRON_SECRET`. Without that check this would be
 * a public URL anyone could use to fire the whole email blast.
 *
 * Test locally (the schedule doesn't run under `next dev`, but the route does):
 *   curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/daily-emails
 */
export async function GET(request: NextRequest) {
	const secret = process.env.CRON_SECRET;
	if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
		return new Response("Unauthorized", { status: 401 });
	}

	return Response.json(await dailyEmailSweep());
}
