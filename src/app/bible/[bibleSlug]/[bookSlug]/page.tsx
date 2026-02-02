import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ bibleSlug: string; bookSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bibleSlug, bookSlug } = await params;
  const bible = await bibleGetByVersionSS(bibleSlug);

  if (!bible) {
    return { title: "Not Found | The Holy Beacon" };
  }

  const book = await bookGetByAbbreviationAndBibleIdSS(bible.id, bookSlug);

  if (!book) {
    return { title: "Book Not Found | The Holy Beacon" };
  }

  return {
    title: `${book.name} - ${bible.version} | The Holy Beacon`,
    description: `Read the book of ${book.name} in the ${bible.name}. ${book.numChapters} chapters. Free online Bible study.`,
    openGraph: {
      title: `${book.name} - ${bible.version}`,
      description: `Read ${book.name} online. ${book.numChapters} chapters.`,
      type: "website",
    },
  };
}

export default async function BookChaptersPage({ params }: PageProps) {
  const { bibleSlug, bookSlug } = await params;
  const bible = await bibleGetByVersionSS(bibleSlug);

  if (!bible) {
    notFound();
  }

  const book = await bookGetByAbbreviationAndBibleIdSS(bible.id, bookSlug);

  if (!book) {
    notFound();
  }

  const chapters = Array.from({ length: book.numChapters || 1 }, (_, i) => i + 1);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{book.name}</h1>
        <p className="text-muted-foreground">
          {bible.name} • {book.numChapters} chapters
        </p>
      </div>

      {/* Chapters grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {chapters.map((chapter) => (
          <Link
            key={chapter}
            href={`/bible/${bibleSlug}/${bookSlug}/${chapter}`}
            className="aspect-square flex items-center justify-center rounded-lg border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-medium text-lg"
          >
            {chapter}
          </Link>
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: `${book.name} - ${bible.name}`,
            inLanguage: bible.language,
            numberOfPages: book.numChapters,
          }),
        }}
      />
    </div>
  );
}
