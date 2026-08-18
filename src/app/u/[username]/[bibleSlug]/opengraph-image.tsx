import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { OG_CARD_SIZE, renderJourneyCard } from "@/lib/og/journeyCard";

export const alt = "A reading journey on The Holy Beacon";
export const size = OG_CARD_SIZE;
export const contentType = "image/png";

/**
 * The same card, scoped to one translation.
 *
 * Exists as its own route segment because Next passes only `params` to
 * opengraph-image — a `?bible=` query string would never reach here, and the
 * card would silently show the unscoped numbers.
 */
export default async function OgImage({
	params,
}: {
	params: Promise<{ username: string; bibleSlug: string }>;
}) {
	const { username, bibleSlug } = await params;
	return renderJourneyCard(await completionPublicGetSS(username, bibleSlug));
}
