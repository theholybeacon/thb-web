import { ImageResponse } from "next/og";
import type { BookProgress } from "@/app/common/completion/model/Completion";
import type { SessionSummary } from "@/app/common/session/model/SessionSummary";
import { OG_BRAND, OgGrid } from "./grid";
import { ogFonts, ogText } from "./fonts";

/** Instagram/TikTok story canvas. */
export const STORY_SIZE = { width: 1080, height: 1920 };

const BG = "#0b0b0f";
const MUTED = "#a1a1aa";
const FG_SOFT = "#d4d4d8";

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
 * and all user text through ogText(), because a glyph outside our Inter subset
 * makes Satori fall back to a font that 500s the route mid-stream.
 */

type Chrome = { title: string; subtitle?: string | null };

function Shell({ chrome, children }: { chrome: Chrome; children: React.ReactNode }) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "120px 80px",
				backgroundColor: BG,
				backgroundImage:
					"radial-gradient(circle at 15% 10%, rgba(124,58,237,0.38), transparent 55%), radial-gradient(circle at 85% 95%, rgba(124,58,237,0.22), transparent 55%)",
				color: "#fafafa",
				fontFamily: "Inter",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
					<div
						style={{
							width: "22px",
							height: "22px",
							borderRadius: "9999px",
							backgroundColor: OG_BRAND,
							boxShadow: "0 0 32px 8px rgba(124,58,237,0.7)",
						}}
					/>
					<div style={{ fontSize: "30px", letterSpacing: "0.1em", color: MUTED }}>
						THE HOLY BEACON
					</div>
				</div>
				<div style={{ fontSize: "76px", fontWeight: 700, lineHeight: 1.05 }}>{chrome.title}</div>
				{chrome.subtitle && (
					<div style={{ fontSize: "34px", color: OG_BRAND }}>{chrome.subtitle}</div>
				)}
			</div>

			{children}

			<div style={{ fontSize: "28px", color: MUTED }}>theholybeacon.com</div>
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
					color: accent ? OG_BRAND : "#fafafa",
				}}
			>
				{value}
			</div>
			<div style={{ fontSize: "26px", color: MUTED }}>{label}</div>
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
	const fonts = await ogFonts();

	return new ImageResponse(
		(
			<Shell
				chrome={{
					title: ogText(input.title),
					subtitle: input.scopeLabel ? ogText(input.scopeLabel) : null,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
					<div style={{ display: "flex", alignItems: "baseline", gap: "28px" }}>
						<div style={{ fontSize: "168px", fontWeight: 700, lineHeight: 0.9, color: OG_BRAND }}>
							{`${input.percent}%`}
						</div>
						<div style={{ fontSize: "34px", color: FG_SOFT }}>
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
	const fonts = await ogFonts();

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
				chrome={{
					title: ogText(summary.studyName || "Study complete"),
					subtitle: summary.bible ? ogText(summary.bible.label) : null,
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
										step.modes.length > 0 ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.05)",
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
								<div style={{ fontSize: "32px", fontWeight: 700, color: "#fafafa" }}>
									{ogText(step.reference)}
								</div>
								<div style={{ fontSize: "26px", color: MUTED }}>
									{step.modes.map((m) => MODE_LABEL[m] ?? m).join(" · ")}
								</div>
							</div>
						))}
						{hidden > 0 && (
							<div style={{ fontSize: "26px", color: MUTED }}>{`+ ${hidden} more`}</div>
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
