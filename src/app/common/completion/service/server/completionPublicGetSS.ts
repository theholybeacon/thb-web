"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { TOTAL_CHAPTERS } from "@/app/common/canon/model/canon";
import { CompletionRepository } from "../../repository/CompletionRepository";
import { EarnedBadge, PublicCompletionStats } from "../../model/Completion";
import { buildBookProgress, computeCoverage } from "../../model/stats";
import { resolveScope } from "../../model/resolveScope";
import { earnedBadgeKeys } from "../../model/badges";

/**
 * A user's journey as seen by anyone with the link.
 *
 * Returns null unless the user has explicitly opted in, so an un-opted profile
 * is indistinguishable from a nonexistent one — the caller renders a 404 either
 * way rather than confirming the username exists.
 *
 * Deliberately narrower than the private stats: no dates, no streak, no
 * timeframe counts, no per-mode habits. Coverage and milestones are the parts
 * worth sharing; when someone reads is nobody else's business.
 *
 * `bibleSlug` zooms into one translation, mirroring the private view. It arrives
 * as a route segment rather than a query string because Next only passes
 * `params` — never `searchParams` — to opengraph-image, and the share card has to
 * show the same numbers as the page it is a card for.
 */
export async function completionPublicGetSS(
	username: string,
	bibleSlug?: string | null,
): Promise<PublicCompletionStats | null> {
	if (!username) return null;

	const rows = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			username: userTable.username,
			profilePicture: userTable.profilePicture,
			defaultBibleId: userTable.defaultBibleId,
			publicProfileEnabled: userTable.publicProfileEnabled,
		})
		.from(userTable)
		.where(eq(userTable.username, username))
		.limit(1);

	const user = rows[0];
	if (!user || !user.publicProfileEnabled) return null;

	const repo = new CompletionRepository();
	const resolved = await resolveScope(bibleSlug, user.defaultBibleId);
	const scopeId = resolved.scope.bibleId ?? undefined;

	const [tallies, badgeRows, scopeOptions] = await Promise.all([
		repo.getTallies(user.id, scopeId),
		repo.getBadges(user.id),
		repo.getRecordedBibles(user.id),
	]);

	const books = buildBookProgress(tallies, resolved.names);
	const coverage = computeCoverage(books);

	const earnedAtByKey = new Map(
		badgeRows
			.filter((b) => (b.bibleId ?? null) === (resolved.scope.bibleId ?? null))
			.map((b) => [b.badgeKey, b.earnedAt]),
	);
	// Streak milestones are omitted: the public view has no streak to justify them,
	// and at the scoped zoom they are excluded outright.
	const badges: EarnedBadge[] = earnedBadgeKeys(
		{ books, coverage, streakLongest: 0 },
		resolved.scope.bibleId ? "bible" : "global",
	).map((key) => ({ key, earnedAt: earnedAtByKey.get(key)?.toISOString() ?? null }));

	return {
		username: user.username,
		name: user.name,
		profilePicture: user.profilePicture,
		completedChapters: coverage.completedChapters,
		totalChapters: TOTAL_CHAPTERS,
		percent: coverage.percent,
		booksCompleted: coverage.booksCompleted,
		laps: coverage.laps,
		badges,
		books,
		scope: resolved.scope,
		scopeOptions,
	};
}
