import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { PublicJourney } from "@/components/journey/PublicJourney";

type Props = { params: Promise<{ username: string; bibleSlug: string }> };

/**
 * One translation's slice of a public journey.
 *
 * A route segment rather than `?bible=` on the parent page: Next passes only
 * `params` — never `searchParams` — to opengraph-image, and a share card that
 * showed the All-Bibles numbers for a link to the scoped page would be a lie.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { username, bibleSlug } = await params;
	const stats = await completionPublicGetSS(username, bibleSlug);
	const t = await getTranslations("journey");

	if (!stats) {
		return { title: t("profileNotPublic"), robots: { index: false, follow: false } };
	}

	const scopeLabel = stats.scope.label ?? t("scopeAll");
	const title = `${stats.name} — ${t("title")} · ${scopeLabel}`;
	const description = `${t("profileSubtitle", { name: stats.name })} · ${scopeLabel} · ${stats.percent}%`;

	return {
		title,
		description,
		// Personal pages: shareable by link, but not something to accumulate in search.
		robots: { index: false, follow: false },
		openGraph: { title, description, type: "profile" },
		twitter: { card: "summary_large_image", title, description },
	};
}

export default async function ScopedPublicJourneyPage({ params }: Props) {
	const { username, bibleSlug } = await params;
	const stats = await completionPublicGetSS(username, bibleSlug);

	// A private (or nonexistent) profile is a 404 either way, so the page never
	// reveals whether the username is taken.
	if (!stats) notFound();

	// An unknown slug resolves to All Bibles rather than erroring, which would
	// leave this URL silently showing the unscoped numbers. 404 is the honest
	// answer: the translation in the URL is not one this profile has read in.
	if (!stats.scope.slug) notFound();

	return <PublicJourney stats={stats} />;
}
