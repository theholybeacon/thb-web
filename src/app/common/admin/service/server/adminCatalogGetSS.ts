"use server";

import { requireAdminSS } from "./requireAdminSS";
import { StudyRepository } from "@/app/common/study/repository/StudyRepository";
import { isStudyKind, StudyKind } from "@/app/common/study/model/StudyKind";
import { isStepKind, StepKind } from "@/app/common/studyStep/model/StepContent";
import { stepChapterCount } from "@/app/common/studyStep/model/reference";

export type AdminCatalogRow = {
	id: string;
	slug: string;
	name: string;
	kind: StudyKind;
	language: string;
	sortOrder: number;
	steps: number;
	chapters: number;
	stepKinds: Partial<Record<StepKind, number>>;
	updatedAt: string | null;
};

/** The global catalog as the admin panel lists it: every plan and story, with what it is made of. */
export async function adminCatalogGetSS(): Promise<AdminCatalogRow[]> {
	await requireAdminSS();

	const globals = await new StudyRepository().getGlobals();
	return globals.map((study) => {
		const stepKinds: Partial<Record<StepKind, number>> = {};
		for (const step of study.steps) {
			if (isStepKind(step.kind)) stepKinds[step.kind] = (stepKinds[step.kind] ?? 0) + 1;
		}
		return {
			id: study.id,
			slug: study.slug ?? "",
			name: study.name,
			kind: isStudyKind(study.kind) ? study.kind : "plan",
			language: study.language,
			sortOrder: study.sortOrder,
			steps: study.steps.length,
			chapters: study.steps.reduce((total, step) => total + stepChapterCount(step), 0),
			stepKinds,
			updatedAt: study.updatedAt?.toISOString() ?? null,
		};
	});
}
