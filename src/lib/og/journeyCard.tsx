import { ImageResponse } from "next/og";
import type { PublicCompletionStats } from "@/app/common/completion/model/Completion";
import { OG_BRAND, OgGrid } from "./grid";
import { ogFonts, ogText } from "./fonts";

export const OG_CARD_SIZE = { width: 1200, height: 630 };

/**
 * The share card for a public journey, at either zoom level.
 *
 * Shared by /u/[username] and /u/[username]/[bibleSlug] so the two can never
 * drift: a scoped link whose card showed the All-Bibles numbers would advertise
 * progress the page it opens does not claim.
 *
 * All user text goes through ogText(): Satori falls back to next/og's bundled
 * Noto for any glyph our Inter subset lacks, and that font crashes it mid-stream
 * with an uncatchable 500. Every text node is a single interpolated string for
 * the same reason — Satori requires explicit `display: flex` on any element with
 * more than one child, and `{a} of {b}` compiles to several text children.
 */
export async function renderJourneyCard(stats: PublicCompletionStats | null) {
	const name = ogText(stats?.name ?? "The Holy Beacon");
	const percent = stats?.percent ?? 0;
	const done = stats?.completedChapters ?? 0;
	const total = stats?.totalChapters ?? 1189;
	const laps = stats?.laps ?? 0;
	const booksDone = stats?.booksCompleted ?? 0;
	const scopeLabel = stats?.scope.label ? ogText(stats.scope.label) : null;

	const fonts = await ogFonts();

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "56px 64px",
					backgroundColor: "#0b0b0f",
					backgroundImage:
						"radial-gradient(circle at 12% 15%, rgba(124,58,237,0.35), transparent 55%)",
					color: "#fafafa",
					fontFamily: "Inter",
				}}
			>
				{/* Wordmark */}
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<div
						style={{
							width: "16px",
							height: "16px",
							borderRadius: "9999px",
							backgroundColor: OG_BRAND,
							boxShadow: `0 0 24px 6px rgba(124,58,237,0.7)`,
						}}
					/>
					<div style={{ fontSize: "22px", letterSpacing: "0.08em", color: "#a1a1aa" }}>
						THE HOLY BEACON
					</div>
				</div>

				{/* Name + headline numbers */}
				<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div style={{ fontSize: "62px", fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
					{scopeLabel && (
						<div style={{ fontSize: "24px", color: OG_BRAND, letterSpacing: "0.02em" }}>
							{scopeLabel}
						</div>
					)}
					<div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
						<div style={{ fontSize: "44px", fontWeight: 700, color: OG_BRAND }}>{`${percent}%`}</div>
						<div style={{ fontSize: "26px", color: "#d4d4d8" }}>
							{`${done} of ${total} chapters`}
						</div>
					</div>
					<div style={{ fontSize: "22px", color: "#a1a1aa" }}>
						{`${booksDone} books finished${laps > 0 ? ` · ${laps} times through the Bible` : ""}`}
					</div>
				</div>

				<OgGrid books={stats?.books ?? []} width={1072} />
			</div>
		),
		{ ...OG_CARD_SIZE, fonts },
	);
}
