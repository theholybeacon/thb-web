import type { BookProgress } from "@/app/common/completion/model/Completion";

/**
 * The coverage grid, for Satori.
 *
 * Shared by every share surface — the profile card, its scoped variant and the
 * vertical story images — because the grid IS the thing that reads at a glance,
 * and a card whose shading ladder differed from the page it links to would
 * misrepresent the same data twice.
 *
 * Satori has no CSS grid, so this is a wrapping flex row of explicit boxes, and
 * every element with more than one child needs an explicit `display: flex`.
 */

export const OG_BRAND = "#7c3aed";

/** One cell per canonical chapter, in canonical order. */
export function gridCells(books: BookProgress[]): { key: string; times: number }[] {
	return books.flatMap((book) =>
		book.times.map((times, i) => ({ key: `${book.usfm}-${i}`, times })),
	);
}

/**
 * Shading by re-read count, capped at three steps.
 *
 * Beyond a third pass the eye cannot tell the levels apart at cell size anyway,
 * so more shades would only make the picture noisier.
 */
export function cellColor(times: number): string {
	if (times <= 0) return "rgba(255,255,255,0.09)";
	if (times === 1) return "rgba(124,58,237,0.55)";
	if (times === 2) return "rgba(124,58,237,0.8)";
	return OG_BRAND;
}

export function OgGrid({
	books,
	width,
	cell = 13,
	gap = 3,
}: {
	books: BookProgress[];
	/** Fixed width so the wrap point is deterministic — Satori will not measure for us. */
	width: number;
	cell?: number;
	gap?: number;
}) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: `${gap}px`, width: `${width}px` }}>
			{gridCells(books).map((c) => (
				<div
					key={c.key}
					style={{
						width: `${cell}px`,
						height: `${cell}px`,
						borderRadius: "2px",
						backgroundColor: cellColor(c.times),
					}}
				/>
			))}
		</div>
	);
}
