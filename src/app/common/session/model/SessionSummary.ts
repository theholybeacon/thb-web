import { StudyMode } from "@/app/common/sessionStepCompletion/model/SessionStepCompletion";

/** One step as it appears in the finished-session recap. */
export type SessionSummaryStep = {
	stepId: string;
	stepNumber: number;
	title: string;
	/** "John 3:16" — already localized to the study's translation where possible. */
	reference: string;
	bookAbbreviation: string | null;
	bookName: string | null;
	chapters: number;
	/** How this step was actually worked through. Empty if it was never recorded. */
	modes: StudyMode[];
	timeSpentSeconds: number;
};

/**
 * Everything the end-of-session recap and its share image need, computed on the
 * server.
 *
 * Server-side rather than assembled from React state because the story image is
 * rendered by a route handler that cannot see the component tree, and the two
 * have to show the same numbers.
 */
export type SessionSummary = {
	sessionId: string;
	studyId: string;
	studyName: string;
	topic: string | null;
	bible: { id: string; slug: string; label: string } | null;
	startedAt: string | null;
	completedAt: string | null;
	steps: SessionSummaryStep[];
	stepsCompleted: number;
	totalSteps: number;
	/** Canonical chapters covered by the steps that were completed. */
	chaptersStudied: number;
	modeTotals: Record<StudyMode, { steps: number; seconds: number }>;
	totalSeconds: number;
};

export const STUDY_MODES: StudyMode[] = ["read", "type", "listen", "dictation"];

export function emptyModeTotals(): Record<StudyMode, { steps: number; seconds: number }> {
	return {
		read: { steps: 0, seconds: 0 },
		type: { steps: 0, seconds: 0 },
		listen: { steps: 0, seconds: 0 },
		dictation: { steps: 0, seconds: 0 },
	};
}
