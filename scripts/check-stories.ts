/**
 * Checks the catalog's studies beyond what the seed's validation can: that
 * every image and link a step points at answers, that every video exists, and
 * that every character step names a real profile.
 *
 * The seed validates shapes offline; this goes to the network, so it is a
 * separate step, run after writing or editing a story:
 *
 *   npx tsx scripts/check-stories.ts                 # every study in the catalog
 *   npx tsx scripts/check-stories.ts story-noahs-ark # only these slugs
 *   npx tsx scripts/check-stories.ts src/app/common/study/model/stories/noahsArk.ts
 *                                                    # a story file, listed or not
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";
import { GLOBAL_STUDIES } from "../src/app/common/study/model/globalStudyCatalog";
import { GlobalStudyDef, isScriptureStepDef, validateGlobalStudy } from "../src/app/common/study/model/globalStudy";
import { resolve } from "path";

const USER_AGENT = "TheHolyBeaconStoryCheck/1.0 (https://theholybeacon.com)";

async function answers(url: string, expectImage: boolean): Promise<string | null> {
	try {
		const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": USER_AGENT } });
		await res.body?.cancel();
		if (!res.ok) return `HTTP ${res.status}`;
		if (expectImage && !(res.headers.get("content-type") ?? "").startsWith("image/")) {
			return `not an image (${res.headers.get("content-type")})`;
		}
		return null;
	} catch (e) {
		return e instanceof Error ? e.message : String(e);
	}
}

async function main() {
	const args = process.argv.slice(2);
	const files = args.filter((a) => a.endsWith(".ts"));
	const only = args.filter((a) => !a.endsWith(".ts"));
	const fromFiles: GlobalStudyDef[] = [];
	for (const file of files) {
		const mod = await import(resolve(file));
		fromFiles.push(...(Object.values(mod) as GlobalStudyDef[]).filter((v) => v && typeof v === "object" && "slug" in v));
	}
	const defs = [
		...fromFiles,
		...(only.length ? GLOBAL_STUDIES.filter((d) => only.includes(d.slug)) : files.length ? [] : GLOBAL_STUDIES),
	];
	if (only.length && defs.length !== only.length) {
		const known = new Set(defs.map((d) => d.slug));
		console.error(`Not in the catalog: ${only.filter((s) => !known.has(s)).join(", ")}`);
		process.exit(1);
	}

	const sql = neon(process.env.DATABASE_URL!);
	let failed = false;

	for (const def of defs) {
		const problems = [...validateGlobalStudy(def)];

		for (const [index, step] of def.steps.entries()) {
			if (isScriptureStepDef(step)) continue;
			const label = `step ${index + 1} (${step.content.kind})`;
			const c = step.content;
			if (c.kind === "image") {
				const problem = await answers(c.url, true);
				if (problem) problems.push(`${label}: image ${c.url}: ${problem}`);
				if (c.sourceUrl) {
					const source = await answers(c.sourceUrl, false);
					if (source) problems.push(`${label}: source ${c.sourceUrl}: ${source}`);
				}
			} else if (c.kind === "link") {
				const problem = await answers(c.url, false);
				if (problem) problems.push(`${label}: link ${c.url}: ${problem}`);
			} else if (c.kind === "video") {
				const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${c.videoId}`)}`;
				const problem = await answers(oembed, false);
				if (problem) problems.push(`${label}: video ${c.videoId}: ${problem}`);
			} else if (c.kind === "character") {
				const rows = await sql`select 1 from entity where slug = ${c.entitySlug}`;
				if (!rows.length) problems.push(`${label}: no character profile "${c.entitySlug}"`);
			}
		}

		if (problems.length) {
			failed = true;
			console.error(`✗ ${def.slug}`);
			for (const p of problems) console.error(`    ${p}`);
		} else {
			console.log(`✓ ${def.slug} (${def.steps.length} steps)`);
		}
	}

	process.exit(failed ? 1 : 0);
}

main();
