"use server";

import { logger } from "@/app/utils/logger";
import { AlignmentBlobDao, bookPathname } from "../../dao/AlignmentBlobDao";
import { AlignmentApiBibleDao } from "../../dao/AlignmentApiBibleDao";
import { sourceByCode } from "../../model/AlignmentSource";
import { AlignmentRepository } from "../../repository/AlignmentRepository";
import { parseAlignmentJsonl, type ParsedAlignmentWord } from "../../model/parseAlignmentJsonl";

const log = logger.child({ module: "alignmentBookEnsureSS" });

const STALE_LOAD_MS = 10 * 60 * 1000;
/** Neon's HTTP driver round-trips every statement, so batch generously. */
const INSERT_BATCH = 1000;

export type AlignmentBookState = "ready" | "loading" | "unavailable";

/**
 * Makes sure one book of one alignment source is present in `alignment_word`,
 * fetching it from Vercel Blob if not.
 *
 * This is what makes the original-language feature self-healing. The corpus is
 * produced by an offline Python extraction whose intermediate files are not in
 * the repo, so without this a database reset silently took the whole feature
 * down until someone rebuilt it by hand.
 *
 * Mirrors audioChapterEnsureSS: reclaimStale -> ensureRow -> claim (conditional
 * UPDATE) -> load -> markReady/markFailed. Never throws into the reader.
 */
export async function alignmentBookEnsureSS(
	sourceCode: string,
	bookAbbreviation: string,
	chapterNumber?: number,
): Promise<AlignmentBookState> {
	const repo = new AlignmentRepository();
	const source = sourceByCode(sourceCode);

	/*
	 * api.bible has no corpus — it is fetched a chapter at a time from the live
	 * API at ~0.8s per request. Loading a whole book that way means 150 sequential
	 * calls for Psalms, far past the function timeout, so those sources track and
	 * load one chapter at a time. Blob-backed sources ship one file per book and
	 * keep using 0 ("whole book").
	 */
	const isLive = source?.origin.kind === "apibible";
	const unit = isLive ? (chapterNumber ?? 0) : 0;
	if (isLive && !unit) return "unavailable"; // a live source needs a chapter

	try {
		const existing = await repo.getBook(sourceCode, bookAbbreviation, unit);
		if (existing?.status === "ready") return "ready";

		await repo.reclaimStaleBooks(STALE_LOAD_MS);
		await repo.ensureBookRow(sourceCode, bookAbbreviation, unit);

		if (!(await repo.claimBookForLoad(sourceCode, bookAbbreviation, unit))) {
			// Someone else holds the claim, or it just turned ready.
			const current = await repo.getBook(sourceCode, bookAbbreviation, unit);
			return current?.status === "ready" ? "ready" : "loading";
		}

		let words: ParsedAlignmentWord[];
		let origin: string;

		if (source?.origin.kind === "apibible") {
			origin = `apibible:${source.origin.bibleApiId}:${unit}`;
			words = await new AlignmentApiBibleDao().fetchChapter(
				source.origin.bibleApiId, sourceCode, bookAbbreviation, unit);
		} else {
			origin = bookPathname(sourceCode, bookAbbreviation);
			const text = await new AlignmentBlobDao().fetchText(origin);
			if (text === null) {
				await repo.markBookFailed(sourceCode, bookAbbreviation, "BLOB_NOT_FOUND", unit);
				return "unavailable";
			}
			words = parseAlignmentJsonl(sourceCode, text);
		}

		if (words.length === 0) {
			await repo.markBookFailed(sourceCode, bookAbbreviation, "SOURCE_EMPTY", unit);
			return "unavailable";
		}

		// A previous attempt may have died mid-insert; clearing first is what keeps
		// a retry from doubling the rows (and so doubling every `occurrence`).
		await repo.deleteBookWords(sourceCode, bookAbbreviation, isLive ? unit : undefined);

		for (let i = 0; i < words.length; i += INSERT_BATCH) {
			await repo.insertWords(words.slice(i, i + INSERT_BATCH));
		}

		await repo.markBookReady(sourceCode, bookAbbreviation, words.length, origin, unit);
		log.info({ sourceCode, bookAbbreviation, words: words.length }, "loaded alignment book from blob");
		return "ready";
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn({ sourceCode, bookAbbreviation, err: message }, "alignment book load failed");
		try {
			await repo.markBookFailed(sourceCode, bookAbbreviation, message, unit);
		} catch {
			/* the load already failed; a bookkeeping failure must not mask it */
		}
		return "unavailable";
	}
}
