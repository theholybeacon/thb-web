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
      {/* min-w-0: a flex item defaults to min-width:auto, so without it the
          books sidebar props this row past the viewport on narrow screens.
          AppShell carries the same guard, but the signed-out branch of
          app/bible/layout.tsx has no equivalent wrapper. */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
