import { Metadata } from "next";
import { notFound } from "next/navigation";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ bibleSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bibleSlug } = await params;
  const bible = await bibleGetByVersionSS(bibleSlug);

  if (!bible) {
    return {
      title: "Bible Not Found | The Holy Beacon",
    };
  }

  return {
    title: `${bible.name} - Explore | The Holy Beacon`,
    description: `Read the ${bible.name} (${bible.version}) online. Browse all books of the Old and New Testament. Free Bible study tool.`,
    openGraph: {
      title: `${bible.name} - Explore`,
      description: `Read the ${bible.name} online. Free Bible study.`,
      type: "website",
    },
  };
}

export default async function BibleHomePage({ params }: PageProps) {
  const { bibleSlug } = await params;
  const bible = await bibleGetByVersionSS(bibleSlug);

  if (!bible) {
    notFound();
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{bible.name}</h1>
        <p className="text-muted-foreground mb-2">
          {bible.version} • {bible.language}
        </p>
        {bible.description && (
          <p className="text-sm text-muted-foreground mb-6">
            {bible.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Select a book from the sidebar to start reading.
        </p>
      </div>
    </div>
  );
}
