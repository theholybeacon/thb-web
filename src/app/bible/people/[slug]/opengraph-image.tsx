import { ImageResponse } from "next/og";
import { entityGetBySlugSS } from "@/app/common/entity/service/server/entityGetBySlugSS";
import { EntityRepository } from "@/app/common/entity/repository/EntityRepository";
import { ogFonts, ogText } from "@/lib/og/fonts";

export const alt = "Bible character on The Holy Beacon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#7c3aed";

function yearLabel(y: number | null): string | null {
  if (y == null) return null;
  return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`;
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await entityGetBySlugSS(slug);

  const name = ogText(entity?.name ?? "The Holy Beacon");
  const aliases = ((entity?.aliases as string[] | null) ?? [])
    .slice(0, 4)
    .map(ogText)
    .filter(Boolean);
  const birth = yearLabel(entity?.birthYear ?? null);
  const death = yearLabel(entity?.deathYear ?? null);
  const dates = birth || death ? `${birth ?? "?"} – ${death ?? "?"}` : "";

  const mentionCount = entity
    ? (await new EntityRepository().getMentionsByEntityId(entity.id)).length
    : 0;

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
          backgroundImage: `radial-gradient(circle at 15% 20%, rgba(124,58,237,0.35), transparent 55%)`,
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

        {/* Name block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", fontSize: "30px", letterSpacing: "0.2em", color: BRAND }}>
            BIBLE CHARACTER
          </div>
          <div style={{ display: "flex", fontSize: "108px", fontWeight: 700, lineHeight: 1 }}>
            {name}
          </div>
          {aliases.length > 0 ? (
            <div style={{ display: "flex", fontSize: "32px", color: "#d4d4d8" }}>
              Also called {aliases.join(", ")}
            </div>
          ) : null}
        </div>

        {/* Footer facts */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", fontSize: "28px", color: "#a1a1aa" }}>
          {dates ? <div style={{ display: "flex" }}>{dates}</div> : null}
          {mentionCount > 0 ? (
            <div style={{ display: "flex", color: "#e4e4e7" }}>
              {mentionCount} scripture references
            </div>
          ) : null}
          <div style={{ display: "flex", marginLeft: "auto", color: "#71717a" }}>
            theholybeacon.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
