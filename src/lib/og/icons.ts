// The two lucide glyphs the context chip needs, as data URIs.
//
// Satori's handling of inline <svg> children is partial, but it renders an <img>
// pointing at an SVG data URI reliably — so the icons are built as complete
// documents here rather than imported from lucide-react (whose components are
// React elements Satori would have to interpret, and which carry className props
// that mean nothing outside the DOM).
//
// Paths copied from lucide's `globe` and `book-open` at 24x24 so the chip icon is
// the same drawing the journey scope switcher shows.

function svg(body: string, color: string): string {
	const doc =
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
		`stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
	return `data:image/svg+xml;base64,${Buffer.from(doc).toString("base64")}`;
}

/** All Bibles — every translation at once. */
export function globeIcon(color: string): string {
	return svg(
		`<circle cx="12" cy="12" r="10"/>` +
			`<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>` +
			`<path d="M2 12h20"/>`,
		color,
	);
}

/** One named translation. */
export function bookIcon(color: string): string {
	return svg(
		`<path d="M12 7v14"/>` +
			`<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
		color,
	);
}
