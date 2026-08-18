// Explicit fonts for next/og ImageResponse.
//
// next/og's bundled default (Noto Sans) crashes Satori with
// "lookupType: 5 - substFormat: 3 is not yet supported", so we supply our own
// Satori-safe TTFs: Inter for body text and Merriweather for headings, the same
// pairing globals.css sets up for the app (--font-sans / --font-heading).
//
// Merriweather ships only as a variable font in google/fonts, which Satori would
// render at its 400 default; this is the static 700 instance from the Google
// Fonts CSS API, and its GSUB lookup set matches Inter's exactly — no lookupType
// 5 anywhere. Both weights are bundled: 700 for headings, 400 because the
// chapter card quotes scripture, and globals.css sets --font-reading to
// Merriweather at normal weight for exactly that text.
//
// These OG routes must run on the NODE runtime (their data chain imports
// node:crypto via BookExternalAPIDao, which edge can't resolve), so we read the
// fonts from disk with fs. next.config.ts `outputFileTracingIncludes` ships the
// .ttf files into the serverless function bundles on Vercel.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageResponse } from "next/og";

type FontOptions = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"];

const dir = path.join(process.cwd(), "src/lib/og");

export async function ogFonts(): Promise<FontOptions> {
  const [regular, bold, serif, serifBold] = await Promise.all([
    readFile(path.join(dir, "Inter-400.ttf")),
    readFile(path.join(dir, "Inter-700.ttf")),
    readFile(path.join(dir, "Merriweather-400.ttf")),
    readFile(path.join(dir, "Merriweather-700.ttf")),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
    { name: "Merriweather", data: serif, weight: 400, style: "normal" },
    { name: "Merriweather", data: serifBold, weight: 700, style: "normal" },
  ];
}

// Punctuation outside Latin that our Inter subset still covers.
const ALLOWED_PUNCT = new Set([
  0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x00b7, 0x2022,
]);

/**
 * Restrict text to glyphs our Inter TTFs contain. Any other codepoint (Hebrew,
 * Greek, CJK, etc. — the app ships ~400 translations) would make Satori fall
 * back to next/og's bundled Noto, which crashes with
 * "lookupType: 5 - substFormat: 3 is not yet supported" and 500s the route mid-
 * stream (uncatchable). Stripping keeps non-Latin pages rendering a valid, if
 * sparse, card instead of erroring.
 */
export function ogText(input: string): string {
  let out = "";
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    if (cp <= 0x024f || ALLOWED_PUNCT.has(cp) || ch === "\n" || ch === "\t") {
      out += ch;
    }
  }
  return out.replace(/\s+/g, " ").trim();
}
