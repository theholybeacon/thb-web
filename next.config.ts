import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["theholybeacon.localhost"],
  eslint: {
    // TODO: Fix ESLint errors and remove this
    ignoreDuringBuilds: true,
  },
  // Ship the OG-image assets into the serverless function bundles. These routes
  // read the .ttf fonts and the .png logo from disk at render time (see
  // src/lib/og/fonts.ts and src/lib/og/logo.ts); without this, Vercel's file
  // tracing omits them and OG rendering 500s in prod.
  outputFileTracingIncludes: {
    "/bible/[bibleSlug]/[bookSlug]/[chapter]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/bible/people/[slug]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/u/[username]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/u/[username]/[bibleSlug]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/api/share/story": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
  },
};

export default withNextIntl(nextConfig);
