import { ImageResponse } from "next/og";
import type { BookProgress } from "@/app/common/completion/model/Completion";
import type { SessionSummary } from "@/app/common/session/model/SessionSummary";
import { OG_BRAND, OgGrid } from "./grid";
import { OG_THEME, brandAlpha } from "./theme";
import { globeIcon, bookIcon } from "./icons";
import { ogLogo } from "./logo";
import { ogFonts, ogText } from "./fonts";

/** Instagram/TikTok story canvas. */
export const STORY_SIZE = { width: 1080, height: 1920 };

/**
 * What a story says it is measuring when no translation is named.
 *
 * Matches `journey.scopeAll` in the message catalogue. Kept as a constant rather
 * than looked up through next-intl because everything else on the canvas
 * ("books finished", "chapters", the mode names) is already English — a single
 * translated line in an otherwise English image reads as a bug.
 */
const ALL_BIBLES = "All Bibles";

/**
 * Vertical share images.
 *
 * A 1200×630 link card is the wrong shape for the places people actually share
 * progress — a story is full-bleed portrait, gets cropped by any other aspect
 * ratio, and is viewed for about two seconds. So these are built around one
 * number and one picture, not a paragraph.
 *
 * Satori constraints, all load-bearing: no CSS grid; an explicit `display: flex`
 * on every element with more than one child; one interpolated string per text
 * node (`{a} of {b}` compiles to several text children and crashes the render);
 * an explicit width/height on every <img>; and all user text through ogText(),
 * because a glyph outside our Inter subset makes Satori fall back to a font that
 * 500s the route mid-stream.
 */

type Chrome = {
	title: string;
	/**
	 * Which Bibles the numbers below cover. Required, not optional: the scope is
	 * null for All Bibles, which is the *most* common case, so an optional field
	 * meant the image silently omitted its own denominator exactly when a viewer
	 * most needed it to distinguish a whole-Bible journey from a single-translation
	 * one.
	 */
	context: string;
	/** True when `context` is every translation rather than a named one. */
	allBibles: boolean;
};

/** The scope pill from the journey page, at story scale. */
function ContextChip({ context, allBibles }: { context: string; allBibles: boolean }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "16px",
				alignSelf: "flex-start",
				padding: "14px 30px",
				borderRadius: "9999px",
				backgroundColor: brandAlpha(0.12),
				borderWidth: "2px",
				borderStyle: "solid",
				borderColor: brandAlpha(0.35),
			}}
		>
			<img
				src={allBibles ? globeIcon(OG_BRAND) : bookIcon(OG_BRAND)}
				width={34}
				height={34}
				alt=""
			/>
			<div style={{ fontSize: "34px", color: OG_BRAND }}>{context}</div>
		</div>
	);
}

function Shell({
	chrome,
	logo,
	children,
}: {
	chrome: Chrome;
	logo: string;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "110px 80px",
				backgroundColor: OG_THEME.background,
				// One warm glow behind the mark, rather than the two cold radials this
				// replaced — the app's own `.glow` utility is a primary-tinted halo, and
				// a beacon that lights from the top is the whole metaphor.
				backgroundImage: `radial-gradient(circle at 50% 6%, ${brandAlpha(0.18)}, transparent 46%), radial-gradient(circle at 85% 96%, ${brandAlpha(0.1)}, transparent 50%)`,
				color: OG_THEME.foreground,
				fontFamily: "Inter",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
					<img src={logo} width={104} height={104} alt="" />
					<div
						style={{
							fontSize: "34px",
							fontFamily: "Merriweather",
							fontWeight: 700,
							letterSpacing: "0.06em",
							color: OG_THEME.foreground,
						}}
					>
						THE HOLY BEACON
					</div>
				</div>
				<div
					style={{
						fontSize: "76px",
						fontFamily: "Merriweather",
						fontWeight: 700,
						lineHeight: 1.1,
						letterSpacing: "-0.02em",
					}}
				>
					{chrome.title}
				</div>
				<ContextChip context={chrome.context} allBibles={chrome.allBibles} />
			</div>

			{children}

			<div style={{ fontSize: "28px", color: OG_THEME.muted }}>theholybeacon.com</div>
		</div>
	);
}

/** A big number over a quiet label — the unit of every story layout here. */
function BigStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
			<div
				style={{
					fontSize: "72px",
					fontWeight: 700,
					lineHeight: 1,
					color: accent ? OG_BRAND : OG_THEME.foreground,
				}}
			>
				{value}
			</div>
			<div style={{ fontSize: "26px", color: OG_THEME.muted }}>{label}</div>
		</div>
	);
}

export type JourneyStoryInput = {
	title: string;
	scopeLabel: string | null;
	percent: number;
	completedChapters: number;
	totalChapters: number;
	booksCompleted: number;
	laps: number;
	books: BookProgress[];
};

/** Coverage story: the grid is the message, the numbers are the caption. */
export async function renderJourneyStory(input: JourneyStoryInput) {
	const [fonts, logo] = await Promise.all([ogFonts(), ogLogo()]);

	return new ImageResponse(
		(
			<Shell
				logo={logo}
				chrome={{
					title: ogText(input.title),
					context: input.scopeLabel ? ogText(input.scopeLabel) : ALL_BIBLES,
					allBibles: !input.scopeLabel,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
					<div style={{ display: "flex", alignItems: "baseline", gap: "28px" }}>
						<div style={{ fontSize: "168px", fontWeight: 700, lineHeight: 0.9, color: OG_BRAND }}>
							{`${input.percent}%`}
						</div>
						<div style={{ fontSize: "34px", color: OG_THEME.foreground }}>
							{`${input.completedChapters} of ${input.totalChapters} chapters`}
						</div>
					</div>

					{/* 1189 cells at 20px + 4px gap wrap to ~26 rows ≈ 600px — the picture
					    of someone's coverage, at a size that still reads on a phone. */}
					<OgGrid books={input.books} width={920} cell={20} gap={4} />

					<div style={{ display: "flex", gap: "80px" }}>
						<BigStat value={String(input.booksCompleted)} label="books finished" />
						<BigStat
							value={input.laps > 0 ? `${input.laps}×` : "1st"}
							label={input.laps > 0 ? "through the Bible" : "time through"}
							accent
						/>
					</div>
				</div>
			</Shell>
		),
		{ ...STORY_SIZE, fonts },
	);
}

const MODE_LABEL: Record<string, string> = {
	read: "read",
	type: "typed",
	listen: "listened",
	dictation: "dictation",
};

function formatDuration(seconds: number): string {
	if (seconds <= 0) return "—";
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Session recap story: what was studied, and how it was worked through. */
export async function renderSessionStory(summary: SessionSummary) {
	const [fonts, logo] = await Promise.all([ogFonts(), ogLogo()]);

	// Only the modes actually used — an empty "dictation 0" column would read as
	// something skipped rather than something never part of this study.
	const modes = (Object.keys(summary.modeTotals) as (keyof typeof summary.modeTotals)[]).filter(
		(m) => summary.modeTotals[m].steps > 0,
	);

	// The recap has to fit one screen; beyond eight steps the list is summarised
	// rather than silently cut off.
	const MAX_STEPS = 8;
	const shown = summary.steps.slice(0, MAX_STEPS);
	const hidden = summary.steps.length - shown.length;

	return new ImageResponse(
		(
			<Shell
				logo={logo}
				chrome={{
					title: ogText(summary.studyName || "Study complete"),
					// A study with no translation pinned is drawing on whatever the reader
					// had open, so it gets the same all-translations chip rather than none.
					context: summary.bible ? ogText(summary.bible.label) : ALL_BIBLES,
					allBibles: !summary.bible,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
					<div style={{ display: "flex", gap: "72px" }}>
						<BigStat
							value={`${summary.stepsCompleted}/${summary.totalSteps}`}
							label="steps"
							accent
						/>
						<BigStat value={String(summary.chaptersStudied)} label="chapters" />
						<BigStat value={formatDuration(summary.totalSeconds)} label="engaged" />
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						{shown.map((step) => (
							<div
								key={step.stepId}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "20px",
									padding: "18px 26px",
									borderRadius: "16px",
									backgroundColor:
										step.modes.length > 0 ? brandAlpha(0.14) : OG_THEME.secondary,
								}}
							>
								<div
									style={{
										width: "12px",
										height: "12px",
										borderRadius: "9999px",
										backgroundColor:
											step.modes.length > 0 ? OG_BRAND : "rgba(255,255,255,0.2)",
									}}
								/>
								<div style={{ fontSize: "32px", fontWeight: 700, color: OG_THEME.foreground }}>
									{ogText(step.reference)}
								</div>
								<div style={{ fontSize: "26px", color: OG_THEME.muted }}>
									{step.modes.map((m) => MODE_LABEL[m] ?? m).join(" · ")}
								</div>
							</div>
						))}
						{hidden > 0 && (
							<div style={{ fontSize: "26px", color: OG_THEME.muted }}>{`+ ${hidden} more`}</div>
						)}
					</div>

					{modes.length > 0 && (
						<div style={{ display: "flex", gap: "64px" }}>
							{modes.map((m) => (
								<BigStat
									key={m}
									value={String(summary.modeTotals[m].steps)}
									label={MODE_LABEL[m] ?? m}
								/>
							))}
						</div>
					)}
				</div>
			</Shell>
		),
		{ ...STORY_SIZE, fonts },
	);
}
