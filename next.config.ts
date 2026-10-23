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
  // The e2e runs write screenshots, traces and reports into the project while
  // the dev server they test is running. Watching those folders made it
  // recompile mid-test, and a recompile drops in-flight server actions, so
  // signed-in tests hung on "Loading...". Dev only: webpack is not watching in
  // a production build.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Next's own pattern (node_modules, .git, .next) plus the e2e output folders.
        ignored: /^((?:[^/]*(?:\/|$))*)(\.(git|next)|node_modules|test-results|cockpit-report|playwright-report)(\/((?:[^/]*(?:\/|$))*)(?:$|\/))?/,
      };
    }
    return config;
  },
  outputFileTracingIncludes: {
    "/bible/[bibleSlug]/[bookSlug]/[chapter]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/bible/people/[slug]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/u/[username]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/u/[username]/[bibleSlug]/opengraph-image": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
    "/api/share/story": ["./src/lib/og/*.ttf", "./src/lib/og/*.png"],
  },
};

export default withNextIntl(nextConfig);
