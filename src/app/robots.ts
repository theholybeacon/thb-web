import { MetadataRoute } from "next";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { isIndexedTranslation } from "@/lib/seo";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theholybeacon.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // `sitemap.ts` uses generateSitemaps(), so Next serves the sitemaps at
  // /sitemap/0.xml ... /sitemap/N.xml — there is NO /sitemap.xml index.
  // Enumerate the real URLs so crawlers reach every per-translation sitemap.
  // Keep the id math in sync with generateSitemaps() in sitemap.ts:
  //   id 0 = static, ids 1..N = one per bible, id N+1 = character pages.
  const bibles = (await bibleGetAllSS()).filter((b) => isIndexedTranslation(b.slug));
  const sitemapCount = bibles.length + 2;
  const sitemap = Array.from(
    { length: sitemapCount },
    (_, id) => `${BASE_URL}/sitemap/${id}.xml`,
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/bible/"],
        disallow: ["/api/", "/auth/", "/home", "/study", "/session", "/profile"],
      },
    ],
    sitemap,
  };
}
