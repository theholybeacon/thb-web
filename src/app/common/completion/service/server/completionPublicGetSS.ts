"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { TOTAL_CHAPTERS } from "@/app/common/canon/model/canon";
import { CompletionRepository } from "../../repository/CompletionRepository";
import { EarnedBadge, PublicCompletionStats } from "../../model/Completion";
import { buildBookProgress, computeCoverage } from "../../model/stats";
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
 */
export async function completionPublicGetSS(
	username: string,
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
	const [tallies, badgeRows] = await Promise.all([
		repo.getTallies(user.id),
		repo.getBadges(user.id),
	]);

	let names: Record<string, string> = {};
	if (user.defaultBibleId) {
		try {
			const books = await bookGetAllByBibleIdSS(user.defaultBibleId);
			// apiId is the USFM code ("GEN"); `abbreviation` is the display form
			// ("Gen") and would never match the canon.
			names = Object.fromEntries(books.map((b) => [b.apiId, b.name]));
		} catch {
			// Fall back to the canon's English names.
		}
	}

	const books = buildBookProgress(tallies, names);
	const coverage = computeCoverage(books);

	const earnedAtByKey = new Map(badgeRows.map((b) => [b.badgeKey, b.earnedAt]));
	// Streak milestones are omitted: the public view has no streak to justify them.
	const badges: EarnedBadge[] = earnedBadgeKeys({ books, coverage, streakLongest: 0 }).map(
		(key) => ({ key, earnedAt: earnedAtByKey.get(key)?.toISOString() ?? null }),
	);

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
	};
}
