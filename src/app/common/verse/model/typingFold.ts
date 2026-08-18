/**
 * Character folding for Type mode.
 *
 * Scripture carries punctuation and diacritics a keyboard cannot easily produce
 * — curly quotes, en dashes, and accented letters in every non-English
 * translation. Rather than rewrite the text the reader sees, the comparison is
 * made lenient: the displayed character stays exactly as the translation wrote
 * it, and typing its plain ASCII base counts as correct.
 *
 * Case is still significant. That is a separate, larger leniency decision.
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
	const base = STANDALONE[stripped] ?? stripped;
	if (APOSTROPHES.test(base)) return "'";
	if (QUOTES.test(base)) return '"';
	if (DASHES.test(base)) return "-";
	if (SPACES.test(base)) return " ";
	return base;
}
