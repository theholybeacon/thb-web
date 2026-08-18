import { ImageResponse } from "next/og";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { chapterGetByBookIdSS } from "@/app/common/chapter/service/chapterGetByBookIdSS";
import { ogFonts, ogText } from "@/lib/og/fonts";
import { OG_THEME, brandAlpha } from "@/lib/og/theme";
import { ogLogo } from "@/lib/og/logo";

export const alt = "Read this chapter on The Holy Beacon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = OG_THEME.brand;

type Params = { bibleSlug: string; bookSlug: string; chapter: string };

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { bibleSlug, bookSlug, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  const bible = await bibleGetByVersionSS(bibleSlug);
  const book = bible ? await bookGetByAbbreviationAndBibleIdSS(bible.id, bookSlug) : null;
  const chapterData =
    bible && book ? await chapterGetByBookIdSS(book.id, book.name, chapterNum) : null;

  const reference = ogText(book ? `${book.name} ${chapterNum}` : "The Holy Beacon");
  const translation = ogText(bible?.name ?? "");
  const firstVerse = ogText(chapterData?.verses?.[0]?.content?.slice(0, 180) ?? "");

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
          padding: "72px",
          backgroundColor: OG_THEME.background,
          backgroundImage: `radial-gradient(circle at 80% 15%, ${brandAlpha(0.2)}, transparent 55%)`,
          color: OG_THEME.foreground,
          fontFamily: "Inter",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src={logo} width={60} height={60} alt="" />
          <div
            style={{
              fontSize: "26px",
              fontFamily: "Merriweather",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: OG_THEME.foreground,
            }}
          >
            THE HOLY BEACON
          </div>
        </div>

        {/* Reference + verse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "96px",
              fontFamily: "Merriweather",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {reference}
          </div>
          {translation ? (
            <div style={{ display: "flex", fontSize: "34px", color: BRAND, fontWeight: 600 }}>
              {translation}
            </div>
          ) : null}
          {firstVerse ? (
            <div
              style={{
                display: "flex",
                fontSize: "36px",
                fontFamily: "Merriweather",
                fontWeight: 400,
                color: OG_THEME.foreground,
                lineHeight: 1.4,
              }}
            >
              “{firstVerse}…”
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", fontSize: "28px", color: OG_THEME.muted }}>
          Read free · theholybeacon.com
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
