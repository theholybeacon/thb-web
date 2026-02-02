import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theholybeacon.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/bible/"],
        disallow: ["/api/", "/auth/", "/home", "/study", "/session", "/profile"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
