"use server";

import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { studyCreateSS } from "@/app/common/study/service/server/studyCreateSS";
import { studyIsOnlyPassages } from "@/app/common/studyStep/model/StepContent";
import { requireOwnedStudySS } from "@/app/common/study/service/server/studyOwnership";
import { StudyBuilderPostgreSQLDao } from "../../dao/StudyBuilderPostgreSQLDao";
import { draftStepToInsert, normalizeDraft, studyToDraft } from "../../model/draft";
import type {
	StudyBuilderConversationFull,
	StudyBuilderConversationSummary,
	StudyBuilderDraft,
	StudyBuilderMemoryFact,
	StudyBuilderStatus,
} from "../../model/StudyBuilder";

/** The reader's builder conversations, most recent first. */
export async function studyBuilderConversationListSS(): Promise<StudyBuilderConversationSummary[]> {
	const user = await requirePremiumUserSS();
	return new StudyBuilderPostgreSQLDao().listConversations(user.id);
}

/** One of the reader's conversations with its turns and plan; null when it is not theirs. */
export async function studyBuilderConversationGetSS(id: string): Promise<StudyBuilderConversationFull | null> {
	const user = await requirePremiumUserSS();
	return new StudyBuilderPostgreSQLDao().getConversation(id, user.id);
}

/** What the builder remembers about the reader. */
export async function studyBuilderMemoryListSS(): Promise<StudyBuilderMemoryFact[]> {
	const user = await requirePremiumUserSS();
	return new StudyBuilderPostgreSQLDao().listMemory(user.id);
}

/** Makes the builder forget one thing it learned. */
export async function studyBuilderMemoryForgetSS(id: string): Promise<void> {
	const user = await requirePremiumUserSS();
	await new StudyBuilderPostgreSQLDao().deleteMemory(user.id, id);
}

/**
 * Saves the plan as the manual editor has it. The first change to a new plan
 * starts its conversation, so the plan survives a reload and the AI picks up
 * from it; a change to an existing study's plan marks it as not saved yet.
 */
export async function studyBuilderDraftSaveSS(
	conversationId: string | null,
	draft: unknown,
	bibleId: string | null,
): Promise<{ conversationId: string; status: StudyBuilderStatus }> {
	const user = await requirePremiumUserSS();
	const dao = new StudyBuilderPostgreSQLDao();
	const plan = normalizeDraft(draft);
	if (!conversationId) {
		const created = await dao.createConversation(user.id, bibleId, { draft: plan, title: plan?.name });
		return { conversationId: created.id, status: created.status };
	}
	const conversation = await dao.getConversation(conversationId, user.id);
	if (!conversation) throw new Error("Conversation not found");
	if (JSON.stringify(plan) === JSON.stringify(conversation.draft)) return { conversationId, status: conversation.status };
	const status: StudyBuilderStatus = conversation.studyId ? "editing" : conversation.status;
	await dao.updateConversation(conversationId, { draft: plan, status, ...(plan ? { title: plan.name } : {}), ...(bibleId ? { bibleId } : {}) });
	return { conversationId, status };
}

/**
 * Opens one of the reader's studies in the builder, in the conversation it was
 * built or last edited in, right where they left it. A study with no
 * conversation yet (made before the builder, or taken from the catalog) gets
 * one that starts from the study as it is.
 */
export async function studyBuilderOpenForStudySS(studyId: string): Promise<{ conversation: StudyBuilderConversationFull; bibleId: string | null }> {
	const study = await requireOwnedStudySS(studyId);
	requireOnlyPassages(study.steps);
	const dao = new StudyBuilderPostgreSQLDao();
	const saved = studyToDraft(study);
	const found = await dao.findConversationForStudy(study.id, study.ownerId!);
	let conversation: StudyBuilderConversationFull;
	if (!found) {
		conversation = await dao.createConversation(study.ownerId!, study.bibleId, { studyId: study.id, status: "created", draft: saved, title: saved.name });
	} else if (found.status !== "editing" && JSON.stringify(found.draft) !== JSON.stringify(saved)) {
		// No unsaved changes: the study is the truth (it may have changed elsewhere, like a regenerate).
		await dao.updateConversation(found.id, { draft: saved, title: saved.name, status: "created" });
		conversation = { ...found, draft: saved, title: saved.name, status: "created" };
	} else {
		conversation = found;
	}
	return { conversation, bibleId: study.bibleId };
}

/** Saves the plan of a study being edited over the study, keeping everyone's progress on it. */
export async function studyBuilderSaveStudySS(conversationId: string, bibleId: string, draft: unknown): Promise<{ studyId: string }> {
	const user = await requirePremiumUserSS();
	const dao = new StudyBuilderPostgreSQLDao();
	const conversation = await dao.getConversation(conversationId, user.id);
	if (!conversation?.studyId) throw new Error("Conversation not found");
	requireOnlyPassages((await requireOwnedStudySS(conversation.studyId)).steps);
	const plan = requirePlan(draft, bibleId);
	await dao.applyDraftToStudy(conversation.studyId, plan, bibleId);
	await dao.updateConversation(conversation.id, { draft: plan, title: plan.name, status: "created", bibleId });
	return { studyId: conversation.studyId };
}

/**
 * The builder's plan is a list of passages. A study with any other kind of
 * step (a story, a plan with text or reflections) cannot round-trip through
 * it: saving would treat every step it does not know as removed and delete it.
 */
function requireOnlyPassages(steps: { kind: string }[]): void {
	if (!studyIsOnlyPassages(steps)) throw new Error("STUDY_HAS_STEPS_THE_BUILDER_CANNOT_EDIT");
}

function requirePlan(draft: unknown, bibleId: string): StudyBuilderDraft {
	const plan = normalizeDraft(draft);
	if (!plan || plan.steps.length === 0) throw new Error("The plan has no readings yet");
	if (!bibleId) throw new Error("Please select a Bible translation");
	return plan;
}

/**
 * Turns a conversation's plan into a study in the chosen translation. The
 * conversation stays, marked created and linked to the study, so the builder
 * remembers it next time and editing the study picks it up again.
 */
export async function studyBuilderCreateStudySS(conversationId: string, bibleId: string, draft?: unknown): Promise<{ studyId: string }> {
	const user = await requirePremiumUserSS();
	const dao = new StudyBuilderPostgreSQLDao();
	const conversation = await dao.getConversation(conversationId, user.id);
	if (!conversation) throw new Error("Conversation not found");
	if (conversation.studyId) return { studyId: conversation.studyId };

	const plan = requirePlan(draft === undefined ? conversation.draft : draft, bibleId);
	const study = await studyCreateSS({
		name: plan.name,
		description: plan.description,
		topic: plan.topic,
		length: plan.length,
		depth: plan.depth,
		ownerId: user.id,
		bibleId,
		steps: plan.steps.map((step, i) => draftStepToInsert(step, i + 1)),
	});
	await dao.updateConversation(conversation.id, { status: "created", studyId: study.id, bibleId, draft: plan, title: plan.name });
	return { studyId: study.id };
}
