import { StudyStepInsert } from "./StudyStep";
import { stepContentProblems } from "./StepContent";

/**
 * The steps of a study a reader is saving, without the ones that cannot be
 * shown, renumbered from 1.
 *
 * Generated steps reach the save action through the browser (the generator
 * runs on the edge, the save is a server action), so they are untrusted input:
 * a step whose kind and content do not match (see stepContentProblems) is
 * dropped rather than saved as a step the session cannot render. A scripture
 * step never carries content.
 */
export function sanitizeStudySteps(steps: StudyStepInsert[]): StudyStepInsert[] {
	return [...steps]
		.sort((a, b) => a.stepNumber - b.stepNumber)
		.map((step) => ({ ...step, kind: step.kind ?? "scripture" }))
		.filter((step) => stepContentProblems(step).length === 0)
		.map((step, index) => ({
			...step,
			id: undefined,
			stepNumber: index + 1,
			content: step.kind === "scripture" ? null : step.content,
			stepType: step.kind === "scripture" ? step.stepType : null,
		}));
}
