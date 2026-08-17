import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { PublicJourney } from "@/components/journey/PublicJourney";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { username } = await params;
	const stats = await completionPublicGetSS(username);
	const t = await getTranslations("journey");

	if (!stats) {
		return { title: t("profileNotPublic"), robots: { index: false, follow: false } };
	}

	const title = `${stats.name} — ${t("title")}`;
	const description = `${t("profileSubtitle", { name: stats.name })} · ${stats.percent}%`;

	return {
		title,
		description,
		// A shared link should work, but these are personal pages — they are not
		// something we want accumulating in search results.
		robots: { index: false, follow: false },
		openGraph: { title, description, type: "profile" },
		twitter: { card: "summary_large_image", title, description },
	};
}

export default async function PublicJourneyPage({ params }: Props) {
	const { username } = await params;
	const stats = await completionPublicGetSS(username);

	// A private (or nonexistent) profile is a 404 either way, so the page never
	// reveals whether the username is taken.
	if (!stats) notFound();

	return <PublicJourney stats={stats} />;
}
