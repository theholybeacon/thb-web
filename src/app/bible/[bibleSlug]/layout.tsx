import { notFound } from "next/navigation";
import { getBibleBySlug, getBooks } from "@/app/bible/publicData";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { ExplorerSidebar } from "../components/ExplorerSidebar";
import { BibleLanguageNotice } from "../components/BibleLanguageNotice";
import { languageNameToIso } from "@/lib/bibleLanguage";
import { recommendedForLanguageCode } from "@/lib/recommendedBible";
import {
  BIBLE_FOLLOWS_LANGUAGE_COOKIE,
  bibleFollowsLanguage,
  bibleLanguageDiffers,
} from "@/lib/bibleFollowsLanguage";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ bibleSlug: string }>;
}

export default async function BibleReaderLayout({ children, params }: LayoutProps) {
  const { bibleSlug } = await params;
  const bible = await getBibleBySlug(bibleSlug);

  if (!bible) {
    notFound();
  }

  const books = await getBooks(bible.id);
  const notice = await languageNotice(bible);

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
        {notice && <BibleLanguageNotice bibleSlug={bible.slug} {...notice} />}
        {children}
      </main>
    </div>
  );
}

/**
 * What the reader is told when the Bible is not in the app's language, or null
 * when it is, or when they chose to read across languages.
 */
async function languageNotice(bible: { slug: string; language: string }) {
  const locale = await getLocale();
  const follows = bibleFollowsLanguage((await cookies()).get(BIBLE_FOLLOWS_LANGUAGE_COOKIE)?.value);
  if (!follows || !bibleLanguageDiffers(bible.language, locale)) return null;

  const defaultBible = recommendedForLanguageCode(locale);
  if (!defaultBible) return null;

  // Language names in the app's language ("inglés", not "English"); api.bible's
  // own name when there is no ISO code to name it by.
  const names = new Intl.DisplayNames([locale], { type: "language" });
  const bibleIso = languageNameToIso(bible.language);
  return {
    locale,
    bibleLanguage: (bibleIso && names.of(bibleIso)) || bible.language,
    appLanguage: names.of(locale) ?? locale,
    defaultTranslation: defaultBible.label,
  };
}
