import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    // TODO: Fix ESLint errors and remove this
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
