import { ImageResponse } from "next/og";
import { completionPublicGetSS } from "@/app/common/completion/service/server/completionPublicGetSS";
import { ogFonts, ogText } from "@/lib/og/fonts";

export const alt = "A reading journey on The Holy Beacon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#7c3aed";

/**
 * The share card.
 *
 * Renders the same grid idea as the page — coverage is the thing that reads at a
 * glance and makes someone curious enough to click. Satori has no CSS grid, so
 * the layout is nested flex rows, and every cell is an explicit box.
 *
 * All user text goes through ogText(): Satori falls back to next/og's bundled
 * Noto for any glyph our Inter subset lacks, and that font crashes it mid-stream
 * with an uncatchable 500.
 */
export default async function OgImage({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params;
	const stats = await completionPublicGetSS(username);

	const name = ogText(stats?.name ?? "The Holy Beacon");
	const percent = stats?.percent ?? 0;
	const done = stats?.completedChapters ?? 0;
	const total = stats?.totalChapters ?? 1189;
	const laps = stats?.laps ?? 0;
	const booksDone = stats?.booksCompleted ?? 0;

	// One cell per chapter, in canonical order, wrapped into a block. At 1189
	// cells this stays legible at 1200×630 while still showing the real shape of
	// someone's coverage rather than a decorative stand-in.
	const cells = (stats?.books ?? []).flatMap((book) =>
		book.times.map((times, i) => ({ key: `${book.usfm}-${i}`, times })),
	);

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
							backgroundColor: BRAND,
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
					{/*
					 * Every text node below is a single interpolated string. Satori
					 * requires an explicit `display: flex` on any element with more than
					 * one child, and `{a} of {b} chapters` compiles to several text
					 * children — which crashes the render mid-stream.
					 */}
					<div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
						<div style={{ fontSize: "44px", fontWeight: 700, color: BRAND }}>{`${percent}%`}</div>
						<div style={{ fontSize: "26px", color: "#d4d4d8" }}>
							{`${done} of ${total} chapters`}
						</div>
					</div>
					<div style={{ fontSize: "22px", color: "#a1a1aa" }}>
						{`${booksDone} books finished${laps > 0 ? ` · ${laps} times through the Bible` : ""}`}
					</div>
				</div>

				{/* The grid */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "3px",
						width: "1072px",
					}}
				>
					{cells.map((cell) => (
						<div
							key={cell.key}
							style={{
								width: "13px",
								height: "13px",
								borderRadius: "2px",
								backgroundColor:
									cell.times <= 0
										? "rgba(255,255,255,0.09)"
										: cell.times === 1
											? "rgba(124,58,237,0.55)"
											: cell.times === 2
												? "rgba(124,58,237,0.8)"
												: BRAND,
							}}
						/>
					))}
				</div>
			</div>
		),
		{ ...size, fonts },
	);
}
