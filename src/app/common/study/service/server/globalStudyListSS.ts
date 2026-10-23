"use server";

import { GlobalStudyCard } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { SessionRepository } from "@/app/common/session/repository/SessionRepository";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { stepChapterCount } from "@/app/common/studyStep/model/reference";
import { isStudyKind } from "../../model/StudyKind";
import { StepKind } from "@/app/common/studyStep/model/StepContent";

/**
 * The catalog of ready-made plans and stories, with the reader's own progress
 * folded in.
 *
 * Adoption state is resolved here rather than on the client because it is the
 * difference between a "Start" and a "Continue" button, and a card that offers
 * to start a plan the reader is already 40 chapters into is worse than no card.
 */
export async function globalStudyListSS(): Promise<GlobalStudyCard[]> {
	const user = await requirePremiumUserSS();

	const studyRepository = new StudyRepository();
	const sessionRepository = new SessionRepository();

	const [globals, adopted] = await Promise.all([
		studyRepository.getGlobals(),
		studyRepository.getAdoptedByOwnerId(user.id),
	]);

	// One copy per template in practice; the last one wins if a double-submit
	// ever produced two, which is also the one studyAdoptSS would reuse.
	const copyByTemplate = new Map(adopted.map((copy) => [copy.sourceStudyId!, copy]));

	return await Promise.all(
		globals.map(async (study) => {
			const copy = copyByTemplate.get(study.id);
			const session = copy ? await sessionRepository.findByUserAndStudy(user.id, copy.id) : null;

			const stepKinds: Partial<Record<StepKind, number>> = {};
			for (const step of study.steps) {
				const kind = step.kind as StepKind;
				stepKinds[kind] = (stepKinds[kind] ?? 0) + 1;
			}
			const creator = (study as { creator?: { name: string } | null }).creator;

			return {
				id: study.id,
				slug: study.slug!,
				kind: isStudyKind(study.kind) ? study.kind : "plan",
				language: study.language,
				creatorName: creator?.name ?? null,
				name: study.name,
				description: study.description,
				stepKinds,
				stepCount: study.steps.length,
				chapterCount: study.steps.reduce((total, step) => total + stepChapterCount(step), 0),
				bookCount: new Set(study.steps.filter((step) => step.kind === "scripture")
					.map((step) => step.bookAbbreviation).filter(Boolean)).size,
				adopted: copy ? { studyId: copy.id, sessionId: session?.id ?? null } : null,
			};
		}),
	);
}
