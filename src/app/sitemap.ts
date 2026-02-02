import { MetadataRoute } from "next";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theholybeacon.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Static pages
  urls.push(
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/bible`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }
  );

  try {
    // Get all Bibles
    const bibles = await bibleGetAllSS();

    for (const bible of bibles) {
      const bibleSlug = bible.slug;

      // Bible translation page
      urls.push({
        url: `${BASE_URL}/bible/${bibleSlug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });

      // Get all books for this Bible
      const books = await bookGetAllByBibleIdSS(bible.id);

      for (const book of books) {
        const bookSlug = book.slug;

        // Book page (chapter list)
        urls.push({
          url: `${BASE_URL}/bible/${bibleSlug}/${bookSlug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });

        // Individual chapter pages
        const numChapters = book.numChapters || 1;
        for (let chapter = 1; chapter <= numChapters; chapter++) {
          urls.push({
            url: `${BASE_URL}/bible/${bibleSlug}/${bookSlug}/${chapter}`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.6,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return urls;
}
