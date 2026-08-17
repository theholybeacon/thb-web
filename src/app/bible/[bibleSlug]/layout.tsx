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
    // Height comes from whichever chrome wrapped us (public header vs app
    // shell), which publishes --thb-header-h. dvh so retracting mobile browser
    // toolbars do not push the reader's sticky footer out of view.
    <div className="flex h-[calc(100dvh-var(--thb-header-h,3.5rem))]">
      <ExplorerSidebar bible={bible} books={books} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
