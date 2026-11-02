/**
 * A smaller rendition of a Wikimedia Commons image, for a catalog card.
 *
 * The stories' image steps point at 1280px renditions (or the original file),
 * which is right inside a step and far too heavy for a grid of fifty cards.
 * Commons serves any file at a set of standard widths under /thumb/; anything
 * that is not a Commons upload is returned unchanged.
 */
const STANDARD_WIDTHS = [250, 330, 500, 960, 1280] as const;

export function commonsThumbnail(url: string, width: (typeof STANDARD_WIDTHS)[number] = 500): string {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return url;
	}
	if (!/^(upload|thumb)\.wikimedia\.org$/.test(parsed.hostname)) return url;

	// Already a rendition: .../thumb/a/ab/File.jpg/1280px-File.jpg
	const thumb = parsed.pathname.match(/^(\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/[^/]+)\/\d+px-([^/]+)$/);
	if (thumb) return `${parsed.origin}${thumb[1]}/${width}px-${thumb[2]}`;

	// The original: .../a/ab/File.jpg (an SVG's rendition is a PNG, so it is left alone).
	const original = parsed.pathname.match(/^\/wikipedia\/commons\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/);
	if (original && !/\.svg$/i.test(original[2])) {
		return `${parsed.origin}/wikipedia/commons/thumb/${original[1]}/${original[2]}/${width}px-${original[2]}`;
	}
	return url;
}
