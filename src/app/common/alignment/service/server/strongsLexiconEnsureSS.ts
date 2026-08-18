"use server";

import { logger } from "@/app/utils/logger";
import { LEXICON_BOOK_CODE, LEXICON_SOURCE_CODE } from "@/db/schema/alignmentBook";
import { normalizeStrongs } from "@/lib/strongs";
import { AlignmentBlobDao, lexiconPathname } from "../../dao/AlignmentBlobDao";
import { AlignmentRepository } from "../../repository/AlignmentRepository";
import { StrongsEntryInsert } from "../../model/Alignment";

const log = logger.child({ module: "strongsLexiconEnsureSS" });

const STALE_LOAD_MS = 10 * 60 * 1000;
const INSERT_BATCH = 1000;

/** Greek records use `translit`; Hebrew use `xlit` + `pron`. Same family, different keys. */
interface LexiconRecord {
	lemma?: string;
	translit?: string;
	xlit?: string;
	pron?: string;
	strongs_def?: string;
	kjv_def?: string;
	derivation?: string;
}

/**
 * Makes sure `strongs_entry` is populated, loading it from Blob if not.
 *
 * Without this every alignment answer would render as bare numbers after a
 * database reset — the Greek and Hebrew are in `alignment_word`, but the glosses
 * that make them meaningful are not.
 *
 * Locks on a reserved row in `alignment_book` (see LEXICON_SOURCE_CODE) rather
 * than adding a second status table for a single row.
 */
export async function strongsLexiconEnsureSS(): Promise<"ready" | "loading" | "unavailable"> {
	const repo = new AlignmentRepository();

	try {
		if ((await repo.countStrongsEntries()) > 0) return "ready";

		await repo.reclaimStaleBooks(STALE_LOAD_MS);
		await repo.ensureBookRow(LEXICON_SOURCE_CODE, LEXICON_BOOK_CODE);

		if (!(await repo.claimBookForLoad(LEXICON_SOURCE_CODE, LEXICON_BOOK_CODE))) {
			return (await repo.countStrongsEntries()) > 0 ? "ready" : "loading";
		}

		const dao = new AlignmentBlobDao();
		let total = 0;

		for (const language of ["greek", "hebrew"] as const) {
			const text = await dao.fetchText(lexiconPathname(language));
			if (text === null) {
				await repo.markBookFailed(LEXICON_SOURCE_CODE, LEXICON_BOOK_CODE, `BLOB_NOT_FOUND_${language}`);
				return "unavailable";
			}

			const dict = JSON.parse(text) as Record<string, LexiconRecord>;
			const rows: StrongsEntryInsert[] = [];
			for (const [rawId, rec] of Object.entries(dict)) {
				const strongs = normalizeStrongs(rawId);
				if (!strongs) continue; // out-of-range ids are grammar codes, not lexemes
				rows.push({
					strongs,
					language,
					lemma: rec.lemma ?? null,
					translit: rec.translit ?? rec.xlit ?? null,
					pronunciation: rec.pron ?? null,
					definition: (rec.strongs_def ?? "").trim() || null,
					shortDefinition: (rec.kjv_def ?? "").trim() || null,
					derivation: (rec.derivation ?? "").trim() || null,
					source: "openscriptures",
				});
			}

			for (let i = 0; i < rows.length; i += INSERT_BATCH) {
				await repo.upsertStrongsEntries(rows.slice(i, i + INSERT_BATCH));
			}
			total += rows.length;
		}

		await repo.markBookReady(LEXICON_SOURCE_CODE, LEXICON_BOOK_CODE, total, "alignment/lexicon");
		log.info({ entries: total }, "loaded strongs lexicon from blob");
		return "ready";
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn({ err: message }, "strongs lexicon load failed");
		try {
			await repo.markBookFailed(LEXICON_SOURCE_CODE, LEXICON_BOOK_CODE, message);
		} catch {
			/* already failing */
		}
		return "unavailable";
	}
}
