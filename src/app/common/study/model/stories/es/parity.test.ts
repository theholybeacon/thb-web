/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { GlobalStudyDef, GlobalStudyStepDef, isScriptureStepDef, validateGlobalStudy } from "../../globalStudy";
import { STORIES } from "..";
import { STORIES_ES } from ".";

/**
 * A Spanish story is a translation, not a new story: everything a reader
 * follows (which passages, which pictures, which people) must be the English
 * story's, and only the words change. Translating by hand is where a verse
 * number slips, so this pins every non-prose field to the original.
 */
const modules = import.meta.glob<Record<string, GlobalStudyDef>>(["./*.ts", "!./*.test.ts", "!./index.ts"], { eager: true });
const files = Object.entries(modules).map(([path, mod]) => {
	const defs = Object.values(mod).filter((v): v is GlobalStudyDef => Boolean(v) && typeof v === "object" && "slug" in v);
	return [path, defs] as const;
});

/** A step with its prose replaced by "·", so only what must not change is compared. */
function skeleton(step: GlobalStudyStepDef): unknown {
	const prose = (value: unknown) => (value === undefined ? undefined : "·");
	if (isScriptureStepDef(step)) {
		return { ...step, title: prose(step.title), explanation: prose(step.explanation) };
	}
	const c = step.content;
	const content =
		c.kind === "text" ? { ...c, body: prose(c.body) }
		: c.kind === "reflection" ? { ...c, prompt: prose(c.prompt) }
		: c.kind === "character" ? { ...c, note: prose(c.note) }
		: c.kind === "image" ? { ...c, alt: prose(c.alt), caption: prose(c.caption), credit: prose(c.credit) }
		: c.kind === "video" ? { ...c, caption: prose(c.caption), credit: prose(c.credit) }
		: { ...c, title: prose(c.title), author: prose(c.author), source: prose(c.source), description: prose(c.description) };
	return { ...step, title: prose(step.title), explanation: prose(step.explanation), content };
}

describe("Spanish stories", () => {
	it.each(files)("%s exports one story", (_path, defs) => {
		expect(defs).toHaveLength(1);
	});

	it("are all listed, in the English order", () => {
		const listed = new Set(STORIES_ES.map((def) => def.slug));
		for (const [, defs] of files) for (const def of defs) expect(listed.has(def.slug)).toBe(true);
		const order = (defs: GlobalStudyDef[]) => defs.map((def) => def.slug.replace(/-es$/, ""));
		expect(order(STORIES_ES)).toEqual(order(STORIES).filter((slug) => listed.has(`${slug}-es`)));
	});

	it.each(files.flatMap(([, defs]) => defs).map((def) => [def.slug, def] as const))("%s mirrors its English story", (_slug, es) => {
		expect(validateGlobalStudy(es)).toEqual([]);
		const en = STORIES.find((def) => `${def.slug}-es` === es.slug);
		expect(en, `no English story for ${es.slug}`).toBeDefined();
		expect(es.language).toBe("es");
		expect(es.kind).toBe("story");
		expect({ ...es, slug: en!.slug, language: "en", name: "", description: "", topic: "", steps: [] })
			.toEqual({ ...en!, language: "en", name: "", description: "", topic: "", steps: [] });
		expect(es.steps.map(skeleton)).toEqual(en!.steps.map(skeleton));
	});
});
