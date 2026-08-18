import { ImageResponse } from "next/og";
import { entityGetBySlugSS } from "@/app/common/entity/service/server/entityGetBySlugSS";
import { EntityRepository } from "@/app/common/entity/repository/EntityRepository";
import { ogFonts, ogText } from "@/lib/og/fonts";
import { OG_THEME, brandAlpha } from "@/lib/og/theme";
import { ogLogo } from "@/lib/og/logo";

export const alt = "Bible character on The Holy Beacon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = OG_THEME.brand;

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
          backgroundImage: `radial-gradient(circle at 15% 20%, ${brandAlpha(0.2)}, transparent 55%)`,
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

        {/* Name block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", fontSize: "30px", letterSpacing: "0.2em", color: BRAND }}>
            BIBLE CHARACTER
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "108px",
              fontFamily: "Merriweather",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </div>
          {aliases.length > 0 ? (
            <div style={{ display: "flex", fontSize: "32px", color: OG_THEME.foreground }}>
              Also called {aliases.join(", ")}
            </div>
          ) : null}
        </div>

        {/* Footer facts */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", fontSize: "28px", color: OG_THEME.muted }}>
          {dates ? <div style={{ display: "flex" }}>{dates}</div> : null}
          {mentionCount > 0 ? (
            <div style={{ display: "flex", color: OG_THEME.foreground }}>
              {mentionCount} scripture references
            </div>
          ) : null}
          <div style={{ display: "flex", marginLeft: "auto", color: OG_THEME.muted }}>
            theholybeacon.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
