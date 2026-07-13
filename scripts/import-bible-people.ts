/**
 * Idempotent import of biblical people + their verse mentions from the open
 * theographic-bible-metadata dataset (CC-BY-SA 4.0):
 *   https://github.com/robertrouse/theographic-bible-metadata
 *
 * Populates the `entity` and `entity_mention` tables. Safe to re-run.
 *
 * Prerequisites: the 0012 migration must be applied and DATABASE_URL set
 * (loaded from .env.local via @next/env).
 *
 * Run:  npx tsx scripts/import-bible-people.ts
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { entityTable } from "../src/db/schema/entity";
import { entityMentionTable } from "../src/db/schema/entityMention";

const RAW = "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json";
const PEOPLE_URL = `${RAW}/people.json`;
const VERSES_URL = `${RAW}/verses.json`;

// OSIS book code -> USFM abbreviation (matches the api.bible book ids in our `book` table).
const OSIS_TO_USFM: Record<string, string> = {
	Gen: "GEN", Exod: "EXO", Lev: "LEV", Num: "NUM", Deut: "DEU", Josh: "JOS",
	Judg: "JDG", Ruth: "RUT", "1Sam": "1SA", "2Sam": "2SA", "1Kgs": "1KI", "2Kgs": "2KI",
	"1Chr": "1CH", "2Chr": "2CH", Ezra: "EZR", Neh: "NEH", Esth: "EST", Job: "JOB",
	Ps: "PSA", Prov: "PRO", Eccl: "ECC", Song: "SNG", Isa: "ISA", Jer: "JER", Lam: "LAM",
	Ezek: "EZK", Dan: "DAN", Hos: "HOS", Joel: "JOL", Amos: "AMO", Obad: "OBA", Jonah: "JON",
	Mic: "MIC", Nah: "NAM", Hab: "HAB", Zeph: "ZEP", Hag: "HAG", Zech: "ZEC", Mal: "MAL",
	Matt: "MAT", Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Rom: "ROM",
	"1Cor": "1CO", "2Cor": "2CO", Gal: "GAL", Eph: "EPH", Phil: "PHP", Col: "COL",
	"1Thess": "1TH", "2Thess": "2TH", "1Tim": "1TI", "2Tim": "2TI", Titus: "TIT", Phlm: "PHM",
	Heb: "HEB", Jas: "JAS", "1Pet": "1PE", "2Pet": "2PE", "1John": "1JN", "2John": "2JN",
	"3John": "3JN", Jude: "JUD", Rev: "REV",
};

type AirtableRecord = { id: string; fields: Record<string, unknown> };

async function fetchJson(url: string): Promise<AirtableRecord[]> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return (await res.json()) as AirtableRecord[];
}

function parseAliases(alsoCalled: unknown): string[] {
	if (Array.isArray(alsoCalled)) return alsoCalled.map(String).map((s) => s.trim()).filter(Boolean);
	if (typeof alsoCalled === "string") return alsoCalled.split(",").map((s) => s.trim()).filter(Boolean);
	return [];
}

function parseYear(v: unknown): number | null {
	if (v == null || String(v).trim() === "") return null;
	const n = Number(v);
	return Number.isFinite(n) ? Math.trunc(n) : null;
}

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

async function main() {
	if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (check .env.local)");
	const db = drizzle(neon(process.env.DATABASE_URL));

	console.log("Fetching theographic dataset...");
	const [people, verses] = await Promise.all([fetchJson(PEOPLE_URL), fetchJson(VERSES_URL)]);
	console.log(`Fetched people=${people.length} verses=${verses.length}`);

	// 1) Upsert entities (idempotent on datasetId).
	const entityRows = people.map((p) => {
		const f = p.fields;
		const datasetId = String(f.personLookup ?? f.slug ?? p.id);
		return {
			datasetId,
			slug: String(f.slug ?? datasetId),
			name: String(f.name ?? f.displayTitle ?? "Unknown"),
			aliases: parseAliases(f.alsoCalled),
			gender: f.gender ? String(f.gender) : null,
			birthYear: parseYear(f.birthYear),
			deathYear: parseYear(f.deathYear),
		};
	});

	let upserted = 0;
	for (const batch of chunk(entityRows, 500)) {
		await db
			.insert(entityTable)
			.values(batch)
			.onConflictDoUpdate({
				target: entityTable.datasetId,
				set: {
					name: sql`excluded."name"`,
					slug: sql`excluded."slug"`,
					aliases: sql`excluded."aliases"`,
					gender: sql`excluded."gender"`,
					birthYear: sql`excluded."birthYear"`,
					deathYear: sql`excluded."deathYear"`,
					updatedAt: new Date(),
				},
			});
		upserted += batch.length;
	}
	console.log(`Upserted ${upserted} entities`);

	// 2) Map person Airtable recId -> our entity id (via datasetId).
	const allEntities = await db
		.select({ id: entityTable.id, datasetId: entityTable.datasetId })
		.from(entityTable);
	const datasetIdToId = new Map<string, string>();
	for (const e of allEntities) if (e.datasetId) datasetIdToId.set(e.datasetId, e.id);

	const recIdToDatasetId = new Map<string, string>();
	for (const p of people) {
		recIdToDatasetId.set(p.id, String(p.fields.personLookup ?? p.fields.slug ?? p.id));
	}

	// 3) Build canonical mentions from the verse side (verse.people -> person recIds).
	const mentions: { entityId: string; bookAbbreviation: string; chapter: number; verse: number }[] = [];
	const seen = new Set<string>();
	let skippedRefs = 0;
	for (const v of verses) {
		const f = v.fields;
		const peopleRefs = f.people;
		if (!Array.isArray(peopleRefs) || peopleRefs.length === 0) continue;
		const parts = String(f.osisRef ?? "").split(".");
		if (parts.length !== 3) { skippedRefs++; continue; }
		const usfm = OSIS_TO_USFM[parts[0]];
		const chapter = Number(parts[1]);
		const verse = Number(parts[2]);
		if (!usfm || !Number.isInteger(chapter) || !Number.isInteger(verse)) { skippedRefs++; continue; }
		for (const recId of peopleRefs as string[]) {
			const dsId = recIdToDatasetId.get(recId);
			const entityId = dsId ? datasetIdToId.get(dsId) : undefined;
			if (!entityId) continue;
			const key = `${entityId}|${usfm}|${chapter}|${verse}`;
			if (seen.has(key)) continue;
			seen.add(key);
			mentions.push({ entityId, bookAbbreviation: usfm, chapter, verse });
		}
	}
	console.log(`Prepared ${mentions.length} unique mentions (skipped ${skippedRefs} refs)`);

	let inserted = 0;
	for (const batch of chunk(mentions, 1000)) {
		await db.insert(entityMentionTable).values(batch).onConflictDoNothing();
		inserted += batch.length;
	}
	console.log(`Inserted mentions (idempotent): ${inserted}`);
	console.log("Done. Attribution: theographic-bible-metadata (CC-BY-SA 4.0).");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
