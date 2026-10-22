import { DomUtils, parseDocument } from "htmlparser2";
import type { DictionaryPosEntry, DictionarySense } from "../model/Dictionary";

/**
 * Same caps as the English provider: a reading panel wants the primary senses,
 * not the whole entry, and `sourceUrl` links to the rest.
 */
const MAX_POS_ENTRIES = 3;
const MAX_SENSES_PER_POS = 4;

type ChildNode = ReturnType<typeof parseDocument>["children"][number];
type Element = Extract<ChildNode, { attribs: Record<string, string> }>;

const isElement = (node: ChildNode): node is Element => node.type === "tag";

function hasClass(el: Element, name: string): boolean {
	return (el.attribs.class ?? "").split(/\s+/).includes(name);
}

/** Visible text, without the inline styles and footnote markers MediaWiki emits. */
function cleanText(nodes: ChildNode | ChildNode[]): string {
	const list = Array.isArray(nodes) ? nodes : [nodes];
	const parts: string[] = [];
	const walk = (node: ChildNode) => {
		if (node.type === "text") {
			parts.push(node.data);
			return;
		}
		if (!isElement(node)) return;
		if (node.name === "style" || node.name === "link" || node.name === "sup") return;
		if (node.name === "br") {
			parts.push(" ");
			return;
		}
		node.children.forEach(walk);
	};
	list.forEach(walk);
	return parts.join("");
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/** "Sinónimos: a, b, c." → ["a", "b", "c"], skipping the "véase … tesauro" pointer. */
function splitList(text: string): string[] {
	if (/^véase\b/i.test(text)) return [];
	return text
		.replace(/\.$/, "")
		.split(/\s*[,;]\s*/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * Folds one `<li><b>Label:</b> …</li>` annotation into its sense. es.wiktionary
 * renders examples, synonyms and usage notes as labelled list items, either
 * inside the definition's `<dd>` or in a `<dl>` of their own right after it.
 */
function applyAnnotation(sense: DictionarySense, li: Element) {
	const label = DomUtils.findOne((el) => el.name === "b", li.children, false);
	const key = label ? squash(cleanText(label)).replace(/:$/, "").toLowerCase() : "";
	const rest = li.children.filter((c) => c !== label);

	if (key.startsWith("ejemplo")) {
		// Quotations carry their source in a sibling `.ref`; the panel wants the quote.
		const quote = DomUtils.findOne((el) => hasClass(el, "cita"), rest, true);
		const text = squash(cleanText(quote ?? rest));
		if (text) sense.examples.push(text);
	} else if (key.startsWith("sinónimo")) {
		sense.synonyms.push(...splitList(squash(cleanText(rest))));
	} else if (key.startsWith("antónimo")) {
		sense.antonyms.push(...splitList(squash(cleanText(rest))));
	} else if (key === "ámbito" || key === "uso") {
		const text = squash(cleanText(rest)).replace(/\.$/, "");
		if (text) sense.tags.push(text);
	}
}

export interface EsWiktionaryParse {
	entries: DictionaryPosEntry[];
}

/**
 * Reads the definitions for `wordLang` out of an es.wiktionary page, as rendered
 * HTML (`action=parse&prop=text`).
 *
 * The rendered page rather than the wikitext because es.wiktionary builds most
 * definitions of inflected forms from templates — `{{forma verbo|crear|…}}` only
 * becomes "Tercera persona del singular … de crear" once expanded, and that is
 * exactly the kind of word a Bible reader highlights.
 *
 * The page is a flat run of blocks: an `<h2>` per language (tagged with a
 * `.headline-lang` span whose id is the ISO code), `<h3>`/`<h4>` per part of
 * speech, and `<dl>` lists where each `<dt>` is a sense number (plus an
 * optional field, "5 Electricidad") and its `<dd>` the definition.
 */
export function parseEsWiktionary(html: string, wordLang: string): EsWiktionaryParse {
	const doc = parseDocument(html);
	const root = DomUtils.findOne((el) => hasClass(el, "mw-parser-output"), doc.children, true);
	const blocks = (root ?? doc).children.filter(isElement);

	const entries: DictionaryPosEntry[] = [];
	let lang: string | null = null;
	let pronunciation: string | null = null;
	let heading = "";
	let current: DictionaryPosEntry | null = null;
	let lastSense: DictionarySense | null = null;

	for (const block of blocks) {
		if (hasClass(block, "mw-heading2")) {
			const tag = DomUtils.findOne((el) => hasClass(el, "headline-lang"), block.children, true);
			lang = tag?.attribs.id ?? null;
			pronunciation = null;
			current = null;
			lastSense = null;
			continue;
		}
		if (lang !== wordLang) continue;

		if (hasClass(block, "mw-heading3") || hasClass(block, "mw-heading4")) {
			heading = squash(cleanText(block));
			current = null;
			lastSense = null;
			continue;
		}

		if (block.name === "table" && hasClass(block, "pron-graf") && !pronunciation) {
			for (const row of DomUtils.getElementsByTagName("tr", block)) {
				const cells = row.children.filter(isElement).filter((c) => c.name === "td");
				if (cells.length >= 2 && /pronunciación/i.test(cleanText(cells[0]))) {
					const text = squash(cleanText(cells[1]));
					if (text && text !== "falta agregar") pronunciation = text;
					break;
				}
			}
			continue;
		}

		if (block.name !== "dl") continue;

		for (const item of block.children.filter(isElement)) {
			if (item.name === "dt") {
				if (!current) {
					if (entries.filter((e) => e.senses.length > 0).length >= MAX_POS_ENTRIES) {
						lastSense = null;
						break;
					}
					current = {
						partOfSpeech: heading,
						pronunciations: pronunciation ? [{ type: "ipa", text: pronunciation, tags: [] }] : [],
						forms: [],
						senses: [],
					};
					entries.push(current);
				}
				// "5 Electricidad" → the field, as a tag; a bare "2" carries nothing.
				const field = squash(cleanText(item)).replace(/^\d+\s*/, "");
				lastSense = { definition: "", tags: field ? [field] : [], examples: [], synonyms: [], antonyms: [] };
				continue;
			}
			if (item.name !== "dd" || !lastSense) continue;

			const lists = item.children.filter((c): c is Element => isElement(c) && c.name === "ul");
			const body = item.children.filter((c) => !lists.includes(c as Element));
			const definition = squash(cleanText(body));

			if (definition && !lastSense.definition) {
				lastSense.definition = definition;
				if (current && current.senses.length < MAX_SENSES_PER_POS) current.senses.push(lastSense);
			}
			for (const ul of lists) {
				for (const li of ul.children.filter(isElement)) applyAnnotation(lastSense, li);
			}
		}
	}

	return { entries: entries.filter((e) => e.senses.length > 0) };
}
