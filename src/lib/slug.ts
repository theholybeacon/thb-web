/**
 * URL Slug Utility
 *
 * Converts strings with non-ASCII characters (Greek, Hebrew, Spanish accents, etc.)
 * into URL-safe slugs through transliteration and sanitization.
 */

const TRANSLITERATION_MAP: Record<string, string> = {
  // Greek lowercase
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e',
  'ζ': 'z', 'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k',
  'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o',
  'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't',
  'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
  // Greek uppercase
  'Α': 'a', 'Β': 'b', 'Γ': 'g', 'Δ': 'd', 'Ε': 'e',
  'Ζ': 'z', 'Η': 'i', 'Θ': 'th', 'Ι': 'i', 'Κ': 'k',
  'Λ': 'l', 'Μ': 'm', 'Ν': 'n', 'Ξ': 'x', 'Ο': 'o',
  'Π': 'p', 'Ρ': 'r', 'Σ': 's', 'Τ': 't', 'Υ': 'y',
  'Φ': 'ph', 'Χ': 'ch', 'Ψ': 'ps', 'Ω': 'o',
  // Hebrew (basic consonants)
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p',
  'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r',
  'ש': 'sh', 'ת': 't',
  // Spanish/Latin accents
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ñ': 'n', 'ç': 'c',
  'Á': 'a', 'À': 'a', 'Ã': 'a', 'Â': 'a', 'Ä': 'a',
  'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
  'Í': 'i', 'Ì': 'i', 'Î': 'i', 'Ï': 'i',
  'Ó': 'o', 'Ò': 'o', 'Õ': 'o', 'Ô': 'o', 'Ö': 'o',
  'Ú': 'u', 'Ù': 'u', 'Û': 'u', 'Ü': 'u',
  'Ñ': 'n', 'Ç': 'c',
  // German
  'ß': 'ss',
  // Polish/Czech/etc
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
  'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n',
  'Ś': 's', 'Ź': 'z', 'Ż': 'z',
  'č': 'c', 'ř': 'r', 'š': 's', 'ž': 'z', 'ď': 'd', 'ť': 't', 'ň': 'n',
  'Č': 'c', 'Ř': 'r', 'Š': 's', 'Ž': 'z', 'Ď': 'd', 'Ť': 't', 'Ň': 'n',
  // Scandinavian
  'æ': 'ae', 'ø': 'o', 'å': 'a',
  'Æ': 'ae', 'Ø': 'o', 'Å': 'a',
  // Russian Cyrillic (basic)
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd',
  'Е': 'e', 'Ё': 'yo', 'Ж': 'zh', 'З': 'z', 'И': 'i',
  'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n',
  'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't',
  'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch',
  'Ш': 'sh', 'Щ': 'shch', 'Ъ': '', 'Ы': 'y', 'Ь': '',
  'Э': 'e', 'Ю': 'yu', 'Я': 'ya',
};

/**
 * Converts a string to a URL-safe slug.
 *
 * - Transliterates non-ASCII characters (Greek, Hebrew, accented Latin, Cyrillic)
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses consecutive hyphens
 *
 * @param input - The string to convert to a slug
 * @returns A URL-safe slug string
 *
 * @example
 * toUrlSlug("ΑΛΦ") // "alph"
 * toUrlSlug("KJV 2011") // "kjv-2011"
 * toUrlSlug("Nueva Versión Internacional") // "nueva-version-internacional"
 */
export function toUrlSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = input;

  // Apply transliteration character by character
  result = result.split('').map(char => TRANSLITERATION_MAP[char] ?? char).join('');

  // Convert to lowercase
  result = result.toLowerCase();

  // Replace any non-alphanumeric characters with hyphens
  result = result.replace(/[^a-z0-9]+/g, '-');

  // Remove leading and trailing hyphens
  result = result.replace(/^-+|-+$/g, '');

  // Collapse multiple consecutive hyphens
  result = result.replace(/-{2,}/g, '-');

  // Handle edge case where result is empty
  if (!result) {
    return 'untitled';
  }

  // Handle numeric-only slugs (prepend 'v')
  if (/^\d+$/.test(result)) {
    result = `v${result}`;
  }

  // Truncate if too long (max 100 chars, break at hyphen if possible)
  if (result.length > 100) {
    result = result.substring(0, 100);
    const lastHyphen = result.lastIndexOf('-');
    if (lastHyphen > 80) {
      result = result.substring(0, lastHyphen);
    }
    result = result.replace(/-+$/, '');
  }

  return result;
}

/**
 * Generates a unique slug by appending a suffix if the base slug already exists.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Set of existing slugs to check against
 * @param suffix - Optional suffix to append (e.g., language code)
 * @returns A unique slug
 */
export function makeUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>,
  suffix?: string
): string {
  let slug = baseSlug;

  // Try with suffix first if provided
  if (suffix) {
    slug = `${baseSlug}-${suffix}`;
    if (!existingSlugs.has(slug)) {
      return slug;
    }
  }

  // If base slug or suffixed slug exists, append numbers
  if (existingSlugs.has(slug)) {
    let counter = 2;
    const basePart = suffix ? `${baseSlug}-${suffix}` : baseSlug;
    while (existingSlugs.has(`${basePart}-${counter}`)) {
      counter++;
    }
    slug = `${basePart}-${counter}`;
  }

  return slug;
}
