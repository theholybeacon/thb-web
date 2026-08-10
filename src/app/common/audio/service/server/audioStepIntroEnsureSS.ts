"use server";

import { logger } from "@/app/utils/logger";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studyStepTable } from "@/db/schema/studyStep";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { AudioAssetRepository } from "../../repository/AudioAssetRepository";
import { AudioOpenAiDao } from "../../dao/AudioOpenAiDao";
import { AudioAsset, SynthesisPart, resolveVoice, stepIntroCacheKey } from "../../model/AudioAsset";

const log = logger.child({ module: "audioStepIntroEnsureSS" });

const STALE_GENERATION_MS = 10 * 60 * 1000;

/**
 * Narrates a study step's own content — its title and AI explanation.
 *
 * Deliberately NOT licence-gated: this is text The Holy Beacon wrote, not the
 * scripture text, so we may synthesize it for any translation. That is what lets
 * a user on a copyrighted Bible still get a narrated study — they hear the
 * spoken introduction and commentary, just not the verses read aloud.
 *
 * Keyed by studyStepId, so unlike chapter audio it is NOT shared across studies
 * and never amortizes. Keeping `explanation` at its 2000-char cap keeps this the
 * small line item it should be (~$0.03/step).
 */
export async function audioStepIntroEnsureSS(params: {
	studyStepId: string;
	language?: string | null;
	voice?: string;
}): Promise<AudioAsset | null> {
	const { studyStepId } = params;

	await requirePremiumUserSS();

	const rows = await db
		.select({
			id: studyStepTable.id,
			title: studyStepTable.title,
			explanation: studyStepTable.explanation,
		})
		.from(studyStepTable)
		.where(eq(studyStepTable.id, studyStepId))
		.limit(1);

	const step = rows[0];
	if (!step) throw new Error("STUDY_STEP_NOT_FOUND");

	const voice = resolveVoice(params.voice);
	const cacheKey = stepIntroCacheKey(studyStepId, voice);
	const repo = new AudioAssetRepository();

	await repo.ensureRow({
		cacheKey,
		kind: "step_intro",
		voice,
		language: params.language ?? null,
		studyStepId,
	});

	await repo.reclaimStale(STALE_GENERATION_MS);

	if (!(await repo.claimForGeneration(cacheKey))) {
		return await repo.getByCacheKey(cacheKey);
	}

	try {
		const parts: SynthesisPart[] = [
			{ kind: "title" as const, verseNumber: null, text: step.title.trim() },
			{ kind: "explanation" as const, verseNumber: null, text: step.explanation.trim() },
		].filter((p) => p.text.length > 0 && p.text.length <= AudioOpenAiDao.MAX_INPUT_CHARS);

		if (parts.length === 0) {
			await repo.markFailed(cacheKey, "step has no narratable text");
			return await repo.getByCacheKey(cacheKey);
		}

		const result = await repo.synthesizeAndStore({
			pathname: `audio/step/${studyStepId}-${voice}.mp3`,
			voice,
			language: params.language,
			parts,
		});

		await repo.markReady(cacheKey, {
			model: AudioOpenAiDao.MODEL,
			blobUrl: result.url,
			blobPathname: result.pathname,
			byteSize: result.byteSize,
			durationMs: result.durationMs,
			segments: result.segments,
		});

		log.info({ cacheKey, durationMs: result.durationMs }, "step intro narration ready");
	} catch (err) {
		await repo.markFailed(cacheKey, err instanceof Error ? err.message : String(err));
	}

	return await repo.getByCacheKey(cacheKey);
}
