import { notFound } from "next/navigation";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { ExplorerSidebar } from "../components/ExplorerSidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ bibleSlug: string }>;
}

export default async function BibleReaderLayout({ children, params }: LayoutProps) {
  const { bibleSlug } = await params;
  const bible = await bibleGetByVersionSS(bibleSlug);

  if (!bible) {
    notFound();
  }

  const books = await bookGetAllByBibleIdSS(bible.id);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ExplorerSidebar bible={bible} books={books} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
