import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { BibleSelector } from "./components/BibleSelector";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore the Bible | The Holy Beacon",
  description: "Read the Bible online in multiple translations. Choose from various Bible versions including NIV, ESV, KJV, and more. Free online Bible study tool.",
  openGraph: {
    title: "Explore the Bible | The Holy Beacon",
    description: "Read the Bible online in multiple translations. Free online Bible study tool.",
    type: "website",
  },
};

export default async function BibleExplorerPage() {
  const bibles = await bibleGetAllSS();
  const t = await getTranslations("bible");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">{t("explorer")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("selectTranslation")}
        </p>
      </div>

      {/* Bible Selector */}
      <BibleSelector bibles={bibles} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Explore the Bible",
            description: "Read the Bible online in multiple translations",
            provider: {
              "@type": "Organization",
              name: "The Holy Beacon",
            },
          }),
        }}
      />
    </main>
  );
}
