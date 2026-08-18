"use server";

import { logger } from "@/app/utils/logger";
import { StudyRepository } from "../../repository/StudyRepository";
import { StudyStepRepository } from "@/app/common/studyStep/repository/StudyStepRepository";
import { SessionRepository } from "@/app/common/session/repository/SessionRepository";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";

const log = logger.child({ module: "studyAdoptSS" });

export type AdoptedStudy = {
	studyId: string;
	sessionId: string;
	/** False when the reader already had this plan and was handed it back. */
	created: boolean;
};

/**
 * Takes a plan out of the global catalog and makes it the reader's own.
 *
 * The global study is a template: it has no owner and no translation, so it is
 * copied — study row plus every step — into the reader's account against the
 * Bible they read in, and the session runs on that copy. Copying rather than
 * pointing a session at the shared row is what keeps the rest of the app
 * unchanged: the reader can edit or delete their plan, sessions still resolve
 * their translation through study.bibleId, and the ownership guards still work.
 *
 * Adopting twice returns the existing copy and its session instead of starting
 * the plan over, so a second click (or a return visit) is harmless.
 */
export async function studyAdoptSS(slug: string, bibleId?: string): Promise<AdoptedStudy> {
	const user = await requirePremiumUserSS();

	const studyRepository = new StudyRepository();
	const studyStepRepository = new StudyStepRepository();
	const sessionRepository = new SessionRepository();

	const template = await studyRepository.getGlobalBySlug(slug);
	if (!template) {
		throw new Error("NOT_FOUND");
	}
	if (!template.steps.length) {
		// A seeded plan always has steps; an empty one means the seed half-ran.
		throw new Error("PLAN_HAS_NO_STEPS");
	}

	const existing = (await studyRepository.getAdoptedByOwnerId(user.id))
		.find((copy) => copy.sourceStudyId === template.id);

	if (existing) {
		const session = await sessionRepository.findByUserAndStudy(user.id, existing.id);
		if (session) {
			log.info({ userId: user.id, slug }, "plan already adopted, resuming");
			return { studyId: existing.id, sessionId: session.id, created: false };
		}
		// The copy survived but its session was deleted from the sessions list.
		// Start a fresh run on the copy the reader already has rather than
		// leaving them with a plan they cannot open.
		const steps = (await studyRepository.getById(existing.id))?.steps ?? [];
		if (steps.length) {
			const restarted = await sessionRepository.create({
				studyId: existing.id,
				currentStepId: steps[0].id,
				userId: user.id,
			});
			return { studyId: existing.id, sessionId: restarted.id, created: true };
		}
	}

	// Only now that a copy is definitely being made: an explicit choice wins,
	// then the reader's stored default. There is no third fallback — which
	// translation a plan is read in is not ours to guess silently, and the
	// caller has a picker for exactly this.
	const resolvedBibleId = bibleId || user.defaultBibleId;
	if (!resolvedBibleId) {
		throw new Error("BIBLE_REQUIRED");
	}

	const copy = await studyRepository.create({
		name: template.name,
		description: template.description,
		topic: template.topic,
		depth: template.depth,
		length: template.length,
		ownerId: user.id,
		bibleId: resolvedBibleId,
		sourceStudyId: template.id,
	});

	const stepInserts: StudyStepInsert[] = template.steps.map((step) => ({
		studyId: copy.id,
		stepNumber: step.stepNumber,
		stepType: step.stepType,
		title: step.title,
		explanation: step.explanation,
		bookAbbreviation: step.bookAbbreviation,
		startChapter: step.startChapter,
		endChapter: step.endChapter,
		startVerse: step.startVerse,
		endVerse: step.endVerse,
	}));
	const createdSteps = await studyStepRepository.createMany(stepInserts);

	// RETURNING has no ordering guarantee, and the session's cursor has to start
	// on step 1 rather than on whichever row came back first.
	const firstStep = [...createdSteps].sort((a, b) => a.stepNumber - b.stepNumber)[0];

	const session = await sessionRepository.create({
		studyId: copy.id,
		currentStepId: firstStep.id,
		userId: user.id,
	});

	log.info({ userId: user.id, slug, studyId: copy.id }, "plan adopted");
	return { studyId: copy.id, sessionId: session.id, created: true };
}
