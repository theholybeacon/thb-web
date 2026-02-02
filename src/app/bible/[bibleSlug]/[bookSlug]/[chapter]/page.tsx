import { Metadata } from "next";
import { notFound } from "next/navigation";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { chapterGetByCanonicalRefSS } from "@/app/common/chapter/service/chapterGetByCanonicalRefSS";
import { ExplorerView } from "../../../components/ExplorerView";
import { BookRepository } from "@/app/common/book/repository/BookRepository";

interface PageProps {
  params: Promise<{ bibleSlug: string; bookSlug: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bibleSlug, bookSlug, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  const bible = await bibleGetByVersionSS(bibleSlug);
  if (!bible) {
    return { title: "Not Found | The Holy Beacon" };
  }

  const book = await bookGetByAbbreviationAndBibleIdSS(bible.id, bookSlug);
  if (!book) {
    return { title: "Not Found | The Holy Beacon" };
  }

  const chapterData = await chapterGetByCanonicalRefSS(bible.id, bookSlug, chapterNum);

  // Get first verse for description
  const firstVerseText = chapterData?.verses?.[0]?.content?.slice(0, 150) || "";
  const description = firstVerseText
    ? `"${firstVerseText}..." Read ${book.name} Chapter ${chapterNum} in the ${bible.name}. Free online Bible.`
    : `Read ${book.name} Chapter ${chapterNum} in the ${bible.name}. Free online Bible study.`;

  const title = `${book.name} ${chapterNum} - ${bible.version} | The Holy Beacon`;

  return {
    title,
    description,
    openGraph: {
      title: `${book.name} ${chapterNum} - ${bible.version}`,
      description,
      type: "article",
      siteName: "The Holy Beacon",
    },
    twitter: {
      card: "summary",
      title: `${book.name} ${chapterNum} - ${bible.version}`,
      description,
    },
    alternates: {
      canonical: `/bible/${bibleSlug}/${bookSlug}/${chapter}`,
    },
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { bibleSlug, bookSlug, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum) || chapterNum < 1) {
    notFound();
  }

  const bible = await bibleGetByVersionSS(bibleSlug);
  if (!bible) {
    notFound();
  }

  const book = await bookGetByAbbreviationAndBibleIdSS(bible.id, bookSlug);
  if (!book) {
    notFound();
  }

  if (chapterNum > (book.numChapters || 1)) {
    notFound();
  }

  const chapterData = await chapterGetByCanonicalRefSS(bible.id, bookSlug, chapterNum);

  const hasPrevChapter = chapterNum > 1;
  const hasNextChapter = chapterNum < (book.numChapters || 1);

  // If on last chapter, fetch next book info
  let nextBook: { name: string; slug: string } | null = null;
  if (!hasNextChapter) {
    const bookRepo = new BookRepository();
    const nextBookData = await bookRepo.getNextByOrder(bible.id, book.bookOrder);
    if (nextBookData) {
      nextBook = { name: nextBookData.name, slug: nextBookData.slug };
    }
  }

  // JSON-LD for this specific chapter
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `${book.name} ${chapterNum}`,
    isPartOf: {
      "@type": "Book",
      name: book.name,
      inLanguage: bible.language,
    },
    position: chapterNum,
    text: chapterData?.verses?.map((v) => `${v.verseNumber}. ${v.content}`).join(" "),
    provider: {
      "@type": "Organization",
      name: "The Holy Beacon",
      url: "https://theholybeacon.com",
    },
  };

  return (
    <>
      <ExplorerView
        verses={chapterData?.verses || []}
        bookName={book.name}
        chapterNumber={chapterNum}
        bibleSlug={bibleSlug}
        bookSlug={bookSlug}
        hasPrevChapter={hasPrevChapter}
        hasNextChapter={hasNextChapter}
        nextBook={nextBook}
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
