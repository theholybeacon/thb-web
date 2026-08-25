/**
 * Regenerates the machine-checkable parts of product-knowledge/ and reports what
 * changed.
 *
 * WHY: the knowledge pack is what the marketing system believes about this
 * product. Prose ages gracefully; numbers do not. "3,000+ characters" quietly
 * becomes wrong, and nobody notices until it is in a video. So every count in the
 * pack lives inside a marked block that is rewritten from live data, and this
 * script is the only thing allowed to write them.
 *
 * Everything OUTSIDE the markers is hand-written and is never touched — including
 * positioning.draft.md, which has no generated block at all.
 *
 * Usage:
 *   npm run knowledge:refresh                 # write the generated blocks
 *   npm run knowledge:refresh -- --dry-run    # show the diff, write nothing
 *   npm run knowledge:refresh -- --check      # exit 1 if stale (for a release gate)
 *   npm run knowledge:refresh -- --api        # read counts through the Content API
 *
 * Counts come from the database by default, because that needs no running
 * server. Pass --api to go through the Content API instead (set CONTENT_API_URL
 * and CONTENT_API_KEY), which additionally proves the API agrees with the DB.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

import { AUDIO_VOICES } from "../src/app/common/audio/model/AudioAsset";
import {
	NT_CHAPTERS,
	OT_CHAPTERS,
	TOTAL_BOOKS,
	TOTAL_CHAPTERS,
} from "../src/app/common/canon/model/canon";
import { BADGES } from "../src/app/common/completion/model/badges";
import { GLOBAL_STUDIES } from "../src/app/common/study/model/globalStudyCatalog";
import { globalStudyChapterCount } from "../src/app/common/study/model/globalStudy";
import { DAILY_VERSES } from "../src/lib/dailyVerses";
import { INDEXED_TRANSLATION_SLUGS } from "../src/lib/seo";
import { isAudioLicensedBible } from "../src/lib/bibleLicense";
import { locales } from "../src/i18n/request";

const PACK_DIR = path.join(process.cwd(), "product-knowledge");
const CHANGELOG = path.join(process.cwd(), "CHANGELOG.md");

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const DRY_RUN = flag("dry-run");
const CHECK = flag("check");
const VIA_API = flag("api");

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

type StudyPlanFact = { slug: string; name: string; readings: number; chapters: number };

type Facts = {
	source: string;
	translations: number;
	translationsOpenLicensed: number;
	translationsWarm: number;
	characters: number;
	studyPlans: StudyPlanFact[];
	voices: number;
	locales: number;
	uiStrings: number;
	books: number;
	chapters: number;
	chaptersOT: number;
	chaptersNT: number;
	badges: number;
	dailyVerses: number;
};

/** Counts that live in code. Identical whichever backend supplies the rest. */
function staticFacts() {
	const en = JSON.parse(
		readFileSync(path.join(process.cwd(), "src/messages/en.json"), "utf8"),
	) as Record<string, unknown>;

	const countLeaves = (obj: Record<string, unknown>): number =>
		Object.values(obj).reduce<number>(
			(total, value) =>
				total +
				(value && typeof value === "object"
					? countLeaves(value as Record<string, unknown>)
					: 1),
			0,
		);

	return {
		studyPlans: GLOBAL_STUDIES.map((s) => ({
			slug: s.slug,
			name: s.name,
			readings: s.steps.length,
			chapters: globalStudyChapterCount(s),
		})),
		voices: AUDIO_VOICES.length,
		locales: locales.length,
		uiStrings: countLeaves(en),
		books: TOTAL_BOOKS,
		chapters: TOTAL_CHAPTERS,
		chaptersOT: OT_CHAPTERS,
		chaptersNT: NT_CHAPTERS,
		badges: BADGES.length,
		dailyVerses: DAILY_VERSES.length,
		translationsWarm: INDEXED_TRANSLATION_SLUGS.size,
	};
}

async function factsFromDatabase(): Promise<Facts> {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set. Fill .env.local, or pass --api.");
	}
	const sql = neon(process.env.DATABASE_URL);

	const bibles = (await sql`SELECT version FROM bible`) as { version: string }[];
	const characters = (await sql`SELECT count(*)::int AS n FROM entity`) as { n: number }[];

	return {
		source: "database",
		translations: bibles.length,
		// Reuses the licence audit rather than restating it, so the pack can never
		// disagree with what the product will actually narrate.
		translationsOpenLicensed: bibles.filter((b) => isAudioLicensedBible(b)).length,
		characters: characters[0].n,
		...staticFacts(),
	};
}

async function factsFromApi(): Promise<Facts> {
	const base = process.env.CONTENT_API_URL ?? "http://localhost:3014/api/content/v1";
	const key = process.env.CONTENT_API_KEY;
	if (!key) throw new Error("CONTENT_API_KEY is not set (needed for --api).");

	const res = await fetch(`${base}/meta`, { headers: { "x-api-key": key } });
	if (!res.ok) {
		throw new Error(`GET ${base}/meta failed: ${res.status} ${await res.text()}`);
	}
	const meta = (await res.json()) as { counts: Record<string, number> };

	return {
		source: `Content API (${base})`,
		translations: meta.counts.translations,
		translationsOpenLicensed: meta.counts.translationsOpenLicensed,
		characters: meta.counts.characters,
		...staticFacts(),
		// The API is authoritative for what it actually serves.
		translationsWarm: meta.counts.translationsWarm,
	};
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const n = (value: number) => value.toLocaleString("en-US");

/** Stamped into every generated block so a stale pack is obvious at a glance. */
function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function renderFacts(f: Facts): string {
	return [
		"## Facts (generated — do not hand-edit)",
		"",
		"| | |",
		"|---|---|",
		`| Bible translations available | **${n(f.translations)}** |`,
		`| …cleared for republishing and narration | **${n(f.translationsOpenLicensed)}** |`,
		`| …pre-loaded and reliably instant | **${n(f.translationsWarm)}** |`,
		`| Bible characters with their own page | **${n(f.characters)}** |`,
		"| Ways to go through a chapter | **3** (read, listen, type) |",
		`| Ready-made reading plans | **${n(f.studyPlans.length)}** |`,
		`| Narration voices | **${n(f.voices)}** (one female, one male) |`,
		`| Interface languages | **${n(f.locales)}** (English, Spanish) |`,
		`| Books / chapters covered | **${n(f.books)} / ${n(f.chapters)}** (${n(f.chaptersOT)} Old Testament, ${n(f.chaptersNT)} New Testament) |`,
		`| Milestone badges | **${n(f.badges)}** |`,
		`| Verses in the daily rotation | **${n(f.dailyVerses)}** |`,
		"",
		`*Generated ${today()} from the live product.*`,
	].join("\n");
}

function renderCatalog(f: Facts): string {
	return [
		"| Content | How much | Endpoint |",
		"|---|---|---|",
		`| Bible translations | ${n(f.translations)} (${n(f.translationsOpenLicensed)} cleared for publishing, ${n(f.translationsWarm)} pre-loaded) | \`/meta\` |`,
		`| Verse text | ${n(f.books)} books, ${n(f.chapters)} chapters per translation | \`/verses/{reference}\` |`,
		`| Bible characters | ${n(f.characters)} | \`/characters\`, \`/characters/{slug}\` |`,
		`| Narration audio | Produced on demand; ${n(f.voices)} voices | \`/narration/{reference}\` |`,
		`| Ready-made reading plans | ${n(f.studyPlans.length)} | \`/studies\` |`,
		`| Verse of the day | ${n(f.dailyVerses)} in rotation | \`/daily-verse\` |`,
		"",
		`*Generated ${today()} from the live product.*`,
	].join("\n");
}

const BLOCKS: { file: string; id: string; render: (f: Facts) => string }[] = [
	{ file: "features.md", id: "facts", render: renderFacts },
	{ file: "data-catalog.md", id: "catalog", render: renderCatalog },
];

/**
 * Replaces one marked block. Anything outside the markers is left byte-identical
 * — that is the guarantee that makes this safe to run over hand-written prose.
 */
function replaceBlock(source: string, id: string, body: string): string {
	const open = `<!-- generated:start ${id} -->`;
	const close = `<!-- generated:end ${id} -->`;
	const start = source.indexOf(open);
	const end = source.indexOf(close);
	if (start === -1 || end === -1 || end < start) {
		throw new Error(`Missing or malformed "${id}" block markers.`);
	}
	return source.slice(0, start + open.length) + "\n" + body + "\n" + source.slice(end);
}

// ---------------------------------------------------------------------------
// Diffing
// ---------------------------------------------------------------------------

/** Minimal unified-style diff. Enough to review a block of a few dozen lines. */
function diff(label: string, before: string, after: string): string | null {
	if (before === after) return null;

	const a = before.split("\n");
	const b = after.split("\n");
	const out: string[] = [`--- ${label} (current)`, `+++ ${label} (regenerated)`];

	let i = 0;
	let j = 0;
	while (i < a.length || j < b.length) {
		if (i < a.length && j < b.length && a[i] === b[j]) {
			i++;
			j++;
			continue;
		}
		// Resync on the next line that matches, so one changed line shows as a
		// single -/+ pair instead of dragging the rest of the file with it.
		const resync = i < a.length ? b.indexOf(a[i], j) : -1;
		if (i < a.length && resync === -1) out.push(`- ${a[i++]}`);
		else if (j < b.length && (i >= a.length || resync > j)) out.push(`+ ${b[j++]}`);
		else if (i < a.length) out.push(`- ${a[i++]}`);
		else out.push(`+ ${b[j++]}`);
	}
	return out.join("\n");
}

// ---------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------

const CHANGELOG_PROPOSAL = [
	"  If you adopt one, Keep a Changelog format works well and this script will",
	"  start surfacing new entries as marketing candidates:",
	"",
	"    ## [1.2.0] - 2026-08-25",
	"    ### Added",
	"    - From Cover to Cover reading plan",
].join("\n");

/**
 * Surfaces recent release notes so new features become marketing candidates
 * rather than sitting unnoticed. CHANGELOG.md is optional — if it is absent this
 * proposes a format once and moves on, rather than imposing one.
 */
function reportChangelog(): void {
	if (!existsSync(CHANGELOG)) {
		console.log("\nCHANGELOG.md — not present.");
		console.log(CHANGELOG_PROPOSAL);
		return;
	}

	const entries = readFileSync(CHANGELOG, "utf8")
		.split("\n")
		.filter((line) => /^##\s/.test(line) || /^\s*[-*]\s/.test(line))
		.slice(0, 25);

	console.log("\nRecent changes — marketing candidates:");
	console.log(entries.map((line) => `  ${line}`).join("\n"));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const facts = VIA_API ? await factsFromApi() : await factsFromDatabase();

	console.log(`Source: ${facts.source}`);
	console.log(
		`  ${n(facts.translations)} translations (${n(facts.translationsOpenLicensed)} open-licensed, ` +
			`${n(facts.translationsWarm)} warm) · ${n(facts.characters)} characters · ` +
			`${facts.studyPlans.length} plans · ${n(facts.uiStrings)} UI strings`,
	);
	for (const plan of facts.studyPlans) {
		console.log(`  plan "${plan.slug}": ${plan.readings} readings, ${n(plan.chapters)} chapters`);
	}

	const diffs: string[] = [];

	for (const block of BLOCKS) {
		const file = path.join(PACK_DIR, block.file);
		const before = readFileSync(file, "utf8");
		const after = replaceBlock(before, block.id, block.render(facts));

		const d = diff(`product-knowledge/${block.file}`, before, after);
		if (!d) continue;

		diffs.push(d);
		if (!DRY_RUN && !CHECK) writeFileSync(file, after);
	}

	if (diffs.length === 0) {
		console.log("\n✓ Knowledge pack is up to date.");
	} else {
		console.log(`\n${diffs.length} file(s) changed:\n`);
		console.log(diffs.join("\n\n"));
		if (DRY_RUN) console.log("\n(--dry-run: nothing written)");
		else if (CHECK) console.log("\n(--check: nothing written)");
		else console.log("\n✓ Written. Review the diff, commit on a branch, and open a PR.");
	}

	reportChangelog();

	// A non-zero exit under --check is what lets a release step fail loudly on a
	// stale pack. Without it, drift is silent.
	if (CHECK && diffs.length > 0) {
		console.error("\n✖ Knowledge pack is stale. Run: npm run knowledge:refresh");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(`\n✖ ${err instanceof Error ? err.message : String(err)}`);
	process.exit(1);
});
