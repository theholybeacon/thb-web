/**
 * The app's palette, for Satori.
 *
 * Every share and OG surface reads from here so the two-brands problem cannot
 * come back: these images previously used a purple (#7c3aed) that appears
 * nowhere in the product, on a cold near-black that fought the warm neutrals in
 * globals.css. Someone landing on a shared card saw a different app.
 *
 * These are the `.dark` block of src/app/globals.css converted from HSL to hex —
 * dark because the app's own default theme is dark, and because a story image is
 * viewed full-bleed on a phone where a bright card is an assault. Keep them in
 * step with globals.css by hand; Satori cannot read CSS variables.
 */
export const OG_THEME = {
	/** --background 30 15% 10% */
	background: "#1D1A16",
	/** --card 30 15% 12% */
	card: "#231F1A",
	/** --secondary 30 12% 18% */
	secondary: "#332E28",
	/** --border 30 12% 20% */
	border: "#39332D",
	/** --foreground 40 15% 90% */
	foreground: "#E9E7E2",
	/** --muted-foreground 40 10% 60% */
	muted: "#A39C8F",
	/** --primary 42 75% 55% — the "beacon" gold. */
	brand: "#E2AF36",
	/** --accent 35 65% 50% */
	accent: "#D28D2D",
	/** --primary-foreground 30 10% 10% */
	onBrand: "#1C1A17",
} as const;

/** The brand gold as raw channels, for the rgba() tints below and in callers. */
export const OG_BRAND_RGB = "226,175,54";

/** Tailwind's `bg-primary/N` in a form Satori understands. */
export function brandAlpha(alpha: number): string {
	return `rgba(${OG_BRAND_RGB},${alpha})`;
}
