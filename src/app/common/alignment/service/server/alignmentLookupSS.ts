"use server";

import { logger } from "@/app/utils/logger";
import { normalizeSurface } from "@/lib/strongs";
import { AlignmentRepository } from "../../repository/AlignmentRepository";
import { alignmentBookEnsureSS } from "./alignmentBookEnsureSS";
import { strongsLexiconEnsureSS } from "./strongsLexiconEnsureSS";
import { AlignmentInferenceAIDao } from "../../dao/AlignmentInferenceAIDao";
import type { InferredKey } from "../../dao/AlignmentPostgreSQLDao";
import {
	AlignedOriginal,
	AlignmentLookupResult,
	AlignmentWord,
	StrongsEntry,
} from "../../model/Alignment";
import {
	AlignmentSource,
	FALLBACK_SOURCE_CODE,
	sourceByCode,
	sourceForVersion,
	sourcesForLanguage,
} from "../../model/AlignmentSource";

const log = logger.child({ module: "alignmentLookupSS" });

const EMPTY: AlignmentLookupResult = {
	tier: null, status: "ready", matched: [], verseWords: [],
	sourceCode: null, sourceLabel: null, attribution: null,
};

/** Nothing to show yet because the book is still being fetched from Blob. */
const PENDING: AlignmentLookupResult = { ...EMPTY, status: "loading" };
const UNAVAILABLE: AlignmentLookupResult = { ...EMPTY, status: "unavailable" };

export interface AlignmentLookupInput {
	/** `bible.version`, e.g. "BSB" — how a source is matched to the reader's text. */
	bibleVersion?: string | null;
	/** ISO code of the reader's translation, for sibling matching. */
	lang?: string | null;
	bookAbbreviation: string;
	chapter: number;
	verse: number;
	/** The highlighted text. */
	selection: string;
	/** 1-based ordinal of the selection within its verse, as counted in the DOM. */
	occurrence: number;
	/** Verse text in the reader's translation — only needed to infer (es/pt/it). */
	verseText?: string | null;
}

/**
 * The original-language word behind a selection, resolved through three tiers.
 *
 * 1. exact   — the reader's own translation is aligned. Word maps to word.
 * 2. sibling — another translation in the same language is aligned; match on
 *              normalised surface within the same verse.
 * 3. verse   — nothing matches the word, so return the verse's original-language
 *              words as a whole. Strong's numbers are language-independent, so
 *              this works for every translation in every language — it is the
 *              only tier available for Portuguese, Italian, German and Spanish.
 *
 * Never throws; the panel degrades to showing nothing rather than breaking the
 * reader over a side lookup.
 */
export async function alignmentLookupSS(
	input: AlignmentLookupInput,
): Promise<AlignmentLookupResult> {
	const { bibleVersion, lang, bookAbbreviation, chapter, verse, selection, occurrence, verseText } = input;
	const surfaceNorm = normalizeSurface(selection);
	if (!surfaceNorm || !bookAbbreviation || !chapter || !verse) return EMPTY;

	const repo = new AlignmentRepository();

	try {
		const own = sourceForVersion(bibleVersion);
		const siblings = sourcesForLanguage(lang).filter((s) => s.code !== own?.code);
		const fallback = sourceByCode(FALLBACK_SOURCE_CODE);

		// Candidates in the order the ladder will try them, deduped.
		const candidates: AlignmentSource[] = [];
		for (const s of [own, ...siblings, fallback]) {
			if (s && !candidates.some((c) => c.code === s.code)) candidates.push(s);
		}
		if (candidates.length === 0) return EMPTY;

		/*
		 * A book with no rows is ambiguous: it may genuinely have no alignment, or
		 * it may simply never have been loaded — which is exactly the state a
		 * database reset leaves everything in. `alignment_book` disambiguates, and
		 * a miss triggers a lazy fetch from Blob rather than silently reporting
		 * "no original-language data" for the whole Bible.
		 */
		const books = await repo.getBooks(candidates.map((c) => c.code), bookAbbreviation, chapter);
		const ready = new Set(books.filter((b) => b.status === "ready").map((b) => b.sourceCode));

		/*
		 * Ensure the reader's OWN source first, even when a fallback is already
		 * loaded. Tier 1 is strictly better than tier 3, so gating on "is anything
		 * ready" would permanently serve a German reader the verse-level fallback
		 * — BSB is always loaded, so l1912 would never get fetched at all.
		 */
		if (own && !ready.has(own.code)) {
			const state = await alignmentBookEnsureSS(own.code, bookAbbreviation, chapter);
			if (state === "ready") ready.add(own.code);
			else if (state === "loading" && ready.size === 0) return PENDING;
		}

		if (ready.size === 0) {
			if (!fallback) return EMPTY;
			const state = await alignmentBookEnsureSS(fallback.code, bookAbbreviation, chapter);
			if (state !== "ready") return state === "loading" ? PENDING : UNAVAILABLE;
			ready.add(fallback.code);
		}

		const usable = candidates.filter((c) => ready.has(c.code));

		// --- Tier 1: the reader's own translation --------------------------------
		if (own && ready.has(own.code)) {
			const hit = await matchWord(repo, own, bookAbbreviation, chapter, verse, surfaceNorm, occurrence);
			if (hit) return await build(repo, own, "exact", hit, bookAbbreviation, chapter, verse);
		}

		// --- Tier 2: a sibling translation in the same language -------------------
		for (const sibling of usable) {
			if (sibling.code === own?.code) continue;
			const hit = await matchWord(repo, sibling, bookAbbreviation, chapter, verse, surfaceNorm, occurrence);
			if (hit) return await build(repo, sibling, "sibling", hit, bookAbbreviation, chapter, verse);
		}

		const verseSource = usable.find((c) => c.code === own?.code) ?? usable[0];
		if (!verseSource) return EMPTY;
		const verseResult = await build(repo, verseSource, "verse", null, bookAbbreviation, chapter, verse);

		/*
		 * --- Tier 4: inferred ------------------------------------------------
		 * Only for translations with no editorial alignment of their own, and only
		 * when we actually have candidates to choose from. Everything above this
		 * is editorial; this is a model's pick and is labelled as such.
		 */
		if (!own && bibleVersion && verseText && verseResult.verseWords.length > 0) {
			const inferred = await inferOne(
				repo, { bibleVersion, bookAbbreviation, chapter, verse, surfaceNorm, occurrence },
				verseResult, verseText, lang ?? "",
			);
			if (inferred) return inferred;
		}

		return verseResult;
	} catch (err) {
		log.warn({ err: err instanceof Error ? err.message : String(err) }, "alignment lookup failed");
		return EMPTY;
	}
}

/**
 * Finds the aligned row for a selection. Tries the exact occurrence first, then
 * falls back to any row whose surface *contains* the token — sources routinely
 * group a phrase under one original word ("they had finished eating" -> G0709),
 * and a reader selecting one word inside such a group should still resolve.
 */
async function matchWord(
	repo: AlignmentRepository,
	source: AlignmentSource,
	book: string,
	chapter: number,
	verse: number,
	surfaceNorm: string,
	occurrence: number,
): Promise<AlignmentWord | null> {
	const direct = await repo.getWord(source.code, book, chapter, verse, surfaceNorm, occurrence);
	if (direct) return direct;

	const contained = await repo.findBySurfaceContaining(source.code, book, chapter, verse, surfaceNorm);
	if (contained.length === 0) return null;

	// Prefer the nth group containing the token, so repeated words inside phrase
	// groups still track the reader's actual selection.
	return contained[Math.min(occurrence - 1, contained.length - 1)] ?? contained[0];
}

async function build(
	repo: AlignmentRepository,
	source: AlignmentSource,
	tier: AlignmentLookupResult["tier"],
	matchedRow: AlignmentWord | null,
	book: string,
	chapter: number,
	verse: number,
): Promise<AlignmentLookupResult> {
	const verseRows = await repo.getVerse(source.code, book, chapter, verse);
	if (verseRows.length === 0) return EMPTY;

	const ids = new Set<string>();
	for (const row of verseRows) for (const id of row.strongs) ids.add(id);
	const lexicon = new Map<string, StrongsEntry>();
	let entries = await repo.getStrongsEntries([...ids]);

	// An empty lexicon with non-empty ids means strongs_entry was wiped; without
	// this the panel would render bare numbers with no glosses and look broken.
	if (entries.length === 0 && ids.size > 0) {
		if ((await strongsLexiconEnsureSS()) === "ready") {
			entries = await repo.getStrongsEntries([...ids]);
		}
	}
	for (const entry of entries) lexicon.set(entry.strongs, entry);

	const toOriginals = (rows: AlignmentWord[]): AlignedOriginal[] => {
		const out: AlignedOriginal[] = [];
		const seen = new Set<string>();
		for (const row of rows) {
			for (const id of row.strongs) {
				// Function words repeat constantly within a verse; showing the article
				// five times crowds out the words the reader actually cares about.
				const key = `${id}:${row.wordIndex}`;
				if (seen.has(key)) continue;
				seen.add(key);
				const entry = lexicon.get(id);
				out.push({
					strongs: id,
					lemma: entry?.lemma ?? row.lemma ?? null,
					translit: entry?.translit ?? null,
					definition: entry?.definition ?? null,
					shortDefinition: entry?.shortDefinition ?? null,
					language: id.startsWith("G") ? "greek" : "hebrew",
					surface: row.surface,
					morph: row.morph,
				});
			}
		}
		return out;
	};

	return {
		tier,
		status: "ready",
		matched: matchedRow ? toOriginals([matchedRow]) : [],
		verseWords: toOriginals(verseRows),
		sourceCode: source.code,
		sourceLabel: source.label,
		attribution: source.attribution,
	};
}


const STALE_INFERENCE_MS = 2 * 60 * 1000;

/** Language names for the prompt; the model reads these better than ISO codes. */
const LANGUAGE_NAMES: Record<string, string> = {
	es: "Spanish", pt: "Portuguese", it: "Italian", de: "German",
	fr: "French", en: "English", nl: "Dutch",
};

/**
 * Resolves one word through the model, cached forever.
 *
 * Returns null rather than throwing whenever anything is off — a failed
 * inference must degrade to the verse-level answer, never break the panel.
 */
async function inferOne(
	repo: AlignmentRepository,
	key: InferredKey,
	verseResult: AlignmentLookupResult,
	verseText: string,
	lang: string,
): Promise<AlignmentLookupResult | null> {
	const finish = (strongs: string | null): AlignmentLookupResult | null => {
		if (!strongs) return null;
		const match = verseResult.verseWords.find((w) => w.strongs === strongs);
		if (!match) return null;
		return { ...verseResult, tier: "inferred", matched: [match] };
	};

	try {
		const cached = await repo.getInferred(key);
		if (cached?.status === "ready") return finish(cached.strongs);

		await repo.reclaimStaleInferred(STALE_INFERENCE_MS);
		await repo.ensureInferredRow(key);
		if (!(await repo.claimInferred(key))) {
			const current = await repo.getInferred(key);
			return current?.status === "ready" ? finish(current.strongs) : null;
		}

		// The English parallel grounds an inflected Romance form against the
		// candidate glosses, which are themselves English.
		const englishText = verseResult.verseWords.map((w) => w.surface ?? "").join(" ");
		const { strongs, model } = await new AlignmentInferenceAIDao().infer({
			languageName: LANGUAGE_NAMES[lang] ?? lang,
			verseText,
			englishText,
			word: key.surfaceNorm,
			occurrence: key.occurrence,
			candidates: verseResult.verseWords,
		});

		await repo.markInferredReady(key, strongs, verseResult.sourceCode ?? "", model);
		return finish(strongs);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn({ ...key, err: message }, "alignment inference failed");
		try { await repo.markInferredFailed(key, message); } catch { /* already failing */ }
		return null;
	}
}
