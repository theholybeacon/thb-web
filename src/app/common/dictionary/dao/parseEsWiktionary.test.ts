import { describe, expect, it } from "vitest";
import { parseEsWiktionary } from "./parseEsWiktionary";

/** Trimmed from es.wiktionary's rendered "tierra" and "love" pages. */
const page = (body: string) => `<div class="mw-content-ltr mw-parser-output" lang="es" dir="ltr">${body}</div>`;

const SPANISH = `
<div class="mw-heading mw-heading2"><h2 id="Español"><span id="es" class="headline-lang"></span><a href="#">Español</a></h2></div>
<style>.mw-parser-output .pron-graf{float:right}</style>
<table class="pron-graf"><tbody>
<tr><td colspan="2"><span>tierra</span></td></tr>
<tr><td><a href="#"><b>pronunciación</b></a> (AFI)</td><td>[ˈt̪jera]<br /></td></tr>
</tbody></table>
<div class="mw-heading mw-heading3"><h3 id="Etimología_1">Etimología 1</h3></div>
<p>Del latín <i>terra</i>.</p>
<div class="mw-heading mw-heading4"><h4 id="Sustantivo_femenino">Sustantivo femenino</h4></div>
<dl><dt>1</dt>
<dd>Superficie del planeta <a href="/wiki/Tierra">Tierra</a> que no se encuentra cubierta por <a href="/wiki/agua">agua</a>.<sup class="reference">[1]</sup></dd>
<dt>2</dt>
<dd><a href="/wiki/material">Material</a> granuloso y oscuro que compone el suelo.</dd></dl>
<dl><dd><ul><li><b>Ejemplo:</b> Los niños juegan con <i>tierra</i>.</li></ul></dd></dl>
<dl><dt>3</dt>
<dd><a href="/wiki/suelo">Suelo</a>.
<ul><li><b>Sinónimo:</b> <a href="/wiki/piso">piso</a>.</li></ul></dd></dl>
<dl><dt>5 Electricidad</dt>
<dd>Puesta a tierra.
<ul><li><b>Ámbito:</b> Venezuela.</li></ul></dd></dl>
<dl><dd><ul><li><b>Ejemplo:</b>&#160;<div><blockquote><p><span class="cita">Aunque sea el fin del <b>amor</b><br />Yo he visto</span><span class="ref">Charly García. 1991.</span></p></blockquote></div></li></ul></dd></dl>
<dl><dt>6</dt><dd>Quinto sentido, más allá del límite.</dd></dl>
<div class="mw-heading mw-heading4"><h4 id="Locuciones">Locuciones</h4></div>
<ul><li><a href="#">tierra firme</a></li></ul>
`;

const ENGLISH = `
<div class="mw-heading mw-heading2"><h2 id="Inglés"><span id="en" class="headline-lang"></span>Inglés</h2></div>
<div class="mw-heading mw-heading4"><h4 id="Verbo">Verbo</h4></div>
<dl><dt>1</dt><dd><a href="/wiki/amar">Amar</a>.</dd></dl>
`;

describe("parseEsWiktionary", () => {
	it("reads the senses of the requested language, in Spanish", () => {
		const { entries } = parseEsWiktionary(page(SPANISH + ENGLISH), "es");

		expect(entries).toHaveLength(1);
		const [entry] = entries;
		expect(entry.partOfSpeech).toBe("Sustantivo femenino");
		expect(entry.pronunciations).toEqual([{ type: "ipa", text: "[ˈt̪jera]", tags: [] }]);
		expect(entry.senses.map((s) => s.definition)).toEqual([
			"Superficie del planeta Tierra que no se encuentra cubierta por agua.",
			"Material granuloso y oscuro que compone el suelo.",
			"Suelo.",
			"Puesta a tierra.",
		]);
	});

	it("attaches examples, synonyms and fields to their sense", () => {
		const [entry] = parseEsWiktionary(page(SPANISH), "es").entries;

		expect(entry.senses[1].examples).toEqual(["Los niños juegan con tierra."]);
		expect(entry.senses[2].synonyms).toEqual(["piso"]);
		expect(entry.senses[3].tags).toEqual(["Electricidad", "Venezuela"]);
		// A quotation keeps the quote and drops its source line.
		expect(entry.senses[3].examples).toEqual(["Aunque sea el fin del amor Yo he visto"]);
	});

	it("defines a word of another language in Spanish", () => {
		const { entries } = parseEsWiktionary(page(SPANISH + ENGLISH), "en");

		expect(entries).toEqual([
			{
				partOfSpeech: "Verbo",
				pronunciations: [],
				forms: [],
				senses: [{ definition: "Amar.", tags: [], examples: [], synonyms: [], antonyms: [] }],
			},
		]);
	});

	it("finds nothing when the page has no section for the language", () => {
		expect(parseEsWiktionary(page(ENGLISH), "es").entries).toEqual([]);
	});
});
