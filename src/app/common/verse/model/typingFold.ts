/**
 * Character folding for Type mode.
 *
 * Scripture carries punctuation and diacritics a keyboard cannot easily produce
 * — curly quotes, en dashes, and accented letters in every non-English
 * translation. Rather than rewrite the text the reader sees, the comparison is
 * made lenient: the displayed character stays exactly as the translation wrote
 * it, and typing its plain ASCII base counts as correct.
 *
 * Case folds too: reaching for Shift on every proper noun and sentence opening is
 * the same kind of friction, so the fold lowercases and a typist gets credit
 * either way. Nothing on screen changes — the rendered glyph comes from the
 * character's `display`, never from the folded value this returns.
 */

/** Letters that carry no combining mark to strip, so NFD cannot fold them. */
const STANDALONE: Record<string, string> = {
	ø: "o", Ø: "O",
	đ: "d", Đ: "D",
	ł: "l", Ł: "L",
	æ: "a", Æ: "A",
	œ: "o", Œ: "O",
	ß: "s",
	ħ: "h",
	ı: "i",
	ŋ: "n", Ŋ: "N",
	þ: "t", Þ: "T",
	ð: "d", Ð: "D",
};

const APOSTROPHES = /[‘’ʼʻ`´]/;
const QUOTES = /[“”„‟«»]/;
const DASHES = /[‐-―−]/;
const SPACES = /[    ]/;

/** Folds one character to the keystroke that is accepted for it. */
export function foldTypedChar(ch: string): string {
	const stripped = ch.normalize("NFD").replace(/\p{M}/gu, "");
	// Lowercasing comes last, after the marks are stripped and STANDALONE has had
	// its turn: lowercasing İ first would re-introduce a combining dot, and the
	// map is keyed on both cases.
	const base = (STANDALONE[stripped] ?? stripped).toLowerCase();
	if (APOSTROPHES.test(base)) return "'";
	if (QUOTES.test(base)) return '"';
	if (DASHES.test(base)) return "-";
	if (SPACES.test(base)) return " ";
	return base;
}
