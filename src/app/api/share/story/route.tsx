import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { completionStatsGetSS } from "@/app/common/completion/service/server/completionStatsGetSS";
import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { sessionSummaryGetSS } from "@/app/common/session/service/sessionSummaryGetSS";
import { renderJourneyStory, renderSessionStory } from "@/lib/og/story";

/**
 * Vertical share images, for stories.
 *
 * A route handler rather than an opengraph-image convention because these are
 * fetched on demand by a share button and are parameterised by a query string —
 * which opengraph-image never receives.
 *
 * Authorisation is per kind and never trusts an id from the caller:
 *  - `journey` derives the user from the session and accepts no user parameter,
 *    so nobody can render someone else's private stats by guessing an id;
 *  - `profile` goes through completionPublicGetSS, which returns null unless the
 *    owner opted in;
 *  - `session` goes through sessionSummaryGetSS, which checks ownership.
 *
 * Node runtime (the default) is required: ogFonts() reads the TTFs with fs.
 */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;
	const kind = params.get("kind") ?? "journey";
	const bible = params.get("bible");

	try {
		if (kind === "profile") {
			const username = params.get("username");
			if (!username) return new Response("Missing username", { status: 400 });

			const stats = await completionPublicGetSS(username, bible);
			// Not public, or no such user — indistinguishable on purpose.
			if (!stats) return new Response("Not found", { status: 404 });

			return renderJourneyStory({
				title: stats.name,
				scopeLabel: stats.scope.label,
				percent: stats.percent,
				completedChapters: stats.completedChapters,
				totalChapters: stats.totalChapters,
				booksCompleted: stats.booksCompleted,
				laps: stats.laps,
				books: stats.books,
			});
		}

		if (kind === "session") {
			const sessionId = params.get("sessionId");
			if (!sessionId) return new Response("Missing sessionId", { status: 400 });

			const summary = await sessionSummaryGetSS(sessionId);
			if (!summary) return new Response("Not found", { status: 404 });

			return renderSessionStory(summary);
		}

		if (kind !== "journey") return new Response("Unknown kind", { status: 400 });

		const { userId: authId } = await auth();
		if (!authId) return new Response("Unauthorized", { status: 401 });

		const user = await userGetByAuthIdSS(authId);
		if (!user) return new Response("Unauthorized", { status: 401 });

		// The client passes its own local date so the timeframe windows match what
		// the page showed; UTC is the fallback, not the source of truth.
		const localDate = params.get("date");
		const stats = await completionStatsGetSS(
			localDate && DATE_RE.test(localDate) ? localDate : todayUtc(),
			bible,
		);

		return renderJourneyStory({
			title: user.name || user.username,
			scopeLabel: stats.scope.label,
			percent: stats.percent,
			completedChapters: stats.completedChapters,
			totalChapters: stats.totalChapters,
			booksCompleted: stats.booksCompleted,
			laps: stats.laps,
			books: stats.books,
		});
	} catch {
		// Satori failures are opaque and would otherwise surface as an unhandled 500
		// in the middle of a share gesture.
		return new Response("Could not render", { status: 500 });
	}
}
