import { ImageResponse } from "next/og";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { chapterGetByBookIdSS } from "@/app/common/chapter/service/chapterGetByBookIdSS";
import { ogFonts, ogText } from "@/lib/og/fonts";

export const alt = "Read this chapter on The Holy Beacon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#7c3aed";

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
          backgroundColor: "#0b0b0f",
          backgroundImage: `radial-gradient(circle at 80% 15%, rgba(124,58,237,0.35), transparent 55%)`,
          color: "#fafafa",
          fontFamily: "Inter",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9999px",
              backgroundColor: BRAND,
              boxShadow: `0 0 24px 6px rgba(124,58,237,0.7)`,
            }}
          />
          <div style={{ fontSize: "26px", letterSpacing: "0.28em", color: "#a1a1aa" }}>
            THE HOLY BEACON
          </div>
        </div>

        {/* Reference + verse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "96px", fontWeight: 700, lineHeight: 1 }}>
            {reference}
          </div>
          {translation ? (
            <div style={{ display: "flex", fontSize: "34px", color: BRAND, fontWeight: 600 }}>
              {translation}
            </div>
          ) : null}
          {firstVerse ? (
            <div style={{ display: "flex", fontSize: "36px", color: "#d4d4d8", lineHeight: 1.4 }}>
              “{firstVerse}…”
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", fontSize: "28px", color: "#71717a" }}>
          Read free · theholybeacon.com
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
