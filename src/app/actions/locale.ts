'use server';

import { cookies } from 'next/headers';
import { type Locale, locales, defaultLocale } from '@/i18n/request';
import { getBibleBySlug, getBookBySlug, getBooks } from '@/app/bible/publicData';
import { userSetDefaultBibleSS } from '@/app/common/user/service/server/userSetDefaultBibleSS';
import { recommendedSlugForLocale } from '@/lib/recommendedBible';
import {
  BIBLE_FOLLOWS_LANGUAGE_COOKIE,
  bibleFollowsLanguage,
  bibleLanguageDiffers,
  biblePathFor,
  parseBiblePath,
} from '@/lib/bibleFollowsLanguage';

const YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    locale = defaultLocale;
  }

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: YEAR,
    sameSite: 'lax',
  });
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}

export async function setBibleFollowsLanguage(follows: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(BIBLE_FOLLOWS_LANGUAGE_COOKIE, follows ? 'on' : 'off', {
    path: '/',
    maxAge: YEAR,
    sameSite: 'lax',
  });
}

/**
 * The same place in the language's default translation, when `pathname` is a
 * reader page in another language; null when there is nowhere to move.
 *
 * Books are matched by USFM code (`apiId`), not URL slug: slugs differ between
 * translations (`gen` in the BSB, `gn` in the Reina-Valera). A book the target
 * lacks (the deuterocanon, an NT-only edition) lands on the translation's page.
 */
export async function bibleForLocalePath(pathname: string, locale: string): Promise<string | null> {
  const current = parseBiblePath(pathname);
  if (!current) return null;

  const bible = await getBibleBySlug(current.bibleSlug);
  if (!bible || !bibleLanguageDiffers(bible.language, locale)) return null;

  const target = await getBibleBySlug(recommendedSlugForLocale(locale));
  if (!target || target.id === bible.id) return null;

  if (!current.bookSlug) return biblePathFor({ bibleSlug: target.slug });

  const book = await getBookBySlug(bible.id, current.bookSlug);
  const targetBook = book ? (await getBooks(target.id)).find((b) => b.apiId === book.apiId) : undefined;
  if (!targetBook) return biblePathFor({ bibleSlug: target.slug });

  return biblePathFor({ bibleSlug: target.slug, bookSlug: targetBook.slug, chapter: current.chapter });
}

/**
 * The globe. Sets the app language and, unless the reader decoupled the two,
 * moves the Bible with it: to the same chapter in the new language's default
 * translation when they are reading one, and as their remembered translation
 * for new studies.
 *
 * Returns where to go next, or null to stay and refresh.
 */
export async function changeAppLanguage(locale: Locale, pathname: string): Promise<{ redirectTo: string | null }> {
  await setLocale(locale);

  const cookieStore = await cookies();
  if (!bibleFollowsLanguage(cookieStore.get(BIBLE_FOLLOWS_LANGUAGE_COOKIE)?.value)) {
    return { redirectTo: null };
  }

  const target = await getBibleBySlug(recommendedSlugForLocale(locale));
  if (target) await userSetDefaultBibleSS(target.id);

  return { redirectTo: await bibleForLocalePath(pathname, locale) };
}
