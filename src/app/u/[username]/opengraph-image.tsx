import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { OG_CARD_SIZE, renderJourneyCard } from "@/lib/og/journeyCard";

export const alt = "A reading journey on The Holy Beacon";
export const size = OG_CARD_SIZE;
export const contentType = "image/png";

/** The All-Bibles share card. Layout lives in renderJourneyCard, shared with the scoped route. */
export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params;
	return renderJourneyCard(await completionPublicGetSS(username));
}
