import { MetadataRoute } from "next";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { EntityRepository } from "@/app/common/entity/repository/EntityRepository";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://theholybeacon.com";

export async function generateSitemaps() {
  const bibles = await bibleGetAllSS();
  // id 0 = static pages, ids 1..N = one per bible, id N+1 = character pages
  return [
    { id: 0 },
    ...bibles.map((_, index) => ({ id: index + 1 })),
    { id: bibles.length + 1 },
  ];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  // Static pages sitemap
  if (id === 0) {
    return [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${BASE_URL}/bible`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ];
  }

  const bibles = await bibleGetAllSS();

  // Character pages sitemap (last id)
  if (id === bibles.length + 1) {
    const slugs = await new EntityRepository().getAllSlugs();
    return slugs.map((slug) => ({
      url: `${BASE_URL}/bible/people/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  }

  // Bible-specific sitemap
  const bible = bibles[id - 1];
  if (!bible) return [];

  const urls: MetadataRoute.Sitemap = [];
  const bibleSlug = bible.slug;

  urls.push({
    url: `${BASE_URL}/bible/${bibleSlug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  });

  const books = await bookGetAllByBibleIdSS(bible.id);
  for (const book of books) {
    urls.push({
      url: `${BASE_URL}/bible/${bibleSlug}/${book.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });

    const numChapters = book.numChapters || 1;
    for (let chapter = 1; chapter <= numChapters; chapter++) {
      urls.push({
        url: `${BASE_URL}/bible/${bibleSlug}/${book.slug}/${chapter}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
