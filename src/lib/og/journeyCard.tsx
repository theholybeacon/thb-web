import { ImageResponse } from "next/og";
import type { PublicCompletionStats } from "@/app/common/completion/model/Completion";
import { OG_BRAND, OgGrid } from "./grid";
import { OG_THEME, brandAlpha } from "./theme";
import { globeIcon, bookIcon } from "./icons";
import { ogLogo } from "./logo";
import { ogFonts, ogText } from "./fonts";

export const OG_CARD_SIZE = { width: 1200, height: 630 };

/** Matches the story image's chip and `journey.scopeAll`. */
const ALL_BIBLES = "All Bibles";

/**
 * The share card for a public journey, at either zoom level.
 *
 * Shared by /u/[username] and /u/[username]/[bibleSlug] so the two can never
 * drift: a scoped link whose card showed the All-Bibles numbers would advertise
 * progress the page it opens does not claim. The scope is stated unconditionally
 * for the same reason — a null label means All Bibles, not "no answer", and
 * hiding it made the commonest case the one with no denominator on screen.
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

	const [fonts, logo] = await Promise.all([ogFonts(), ogLogo()]);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "40px 64px",
					backgroundColor: OG_THEME.background,
					backgroundImage: `radial-gradient(circle at 12% 12%, ${brandAlpha(0.2)}, transparent 52%)`,
					color: OG_THEME.foreground,
					fontFamily: "Inter",
				}}
			>
				{/* Wordmark */}
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<img src={logo} width={64} height={64} alt="" />
					<div
						style={{
							fontSize: "24px",
							fontFamily: "Merriweather",
							fontWeight: 700,
							letterSpacing: "0.06em",
							color: OG_THEME.foreground,
						}}
					>
						THE HOLY BEACON
					</div>
				</div>

				{/* Name + headline numbers */}
				<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div
						style={{
							fontSize: "58px",
							fontFamily: "Merriweather",
							fontWeight: 700,
							lineHeight: 1.1,
							letterSpacing: "-0.02em",
						}}
					>
						{name}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							alignSelf: "flex-start",
							padding: "8px 18px",
							borderRadius: "9999px",
							backgroundColor: brandAlpha(0.12),
							borderWidth: "2px",
							borderStyle: "solid",
							borderColor: brandAlpha(0.35),
						}}
					>
						<img
							src={scopeLabel ? bookIcon(OG_BRAND) : globeIcon(OG_BRAND)}
							width={22}
							height={22}
							alt=""
						/>
						<div style={{ fontSize: "24px", color: OG_BRAND }}>{scopeLabel ?? ALL_BIBLES}</div>
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
						<div style={{ fontSize: "44px", fontWeight: 700, color: OG_BRAND }}>{`${percent}%`}</div>
						<div style={{ fontSize: "26px", color: OG_THEME.foreground }}>
							{`${done} of ${total} chapters`}
						</div>
					</div>
					<div style={{ fontSize: "22px", color: OG_THEME.muted }}>
						{`${booksDone} books finished${laps > 0 ? ` · ${laps} times through the Bible` : ""}`}
					</div>
				</div>

				{/* 11px cells wrap 1189 chapters into 16 rows ≈ 220px, which is what is left
				    of a 630px card once the wordmark, name, scope chip and numbers have
				    taken their share. The default 13px overflows the bottom edge. */}
				<OgGrid books={stats?.books ?? []} width={1072} cell={11} />
			</div>
		),
		{ ...OG_CARD_SIZE, fonts },
	);
}
