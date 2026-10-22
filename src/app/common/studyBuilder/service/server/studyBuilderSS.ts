"use server";

import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { studyCreateSS } from "@/app/common/study/service/server/studyCreateSS";
import { StudyBuilderPostgreSQLDao } from "../../dao/StudyBuilderPostgreSQLDao";
import { draftStepToInsert } from "../../model/draft";
import type {
	StudyBuilderConversationFull,
	StudyBuilderConversationSummary,
	StudyBuilderMemoryFact,
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
 * Turns a conversation's plan into a study in the chosen translation. The
 * conversation stays, marked created and linked to the study, so the builder
 * remembers it next time.
 */
export async function studyBuilderCreateStudySS(conversationId: string, bibleId: string): Promise<{ studyId: string }> {
	const user = await requirePremiumUserSS();
	const dao = new StudyBuilderPostgreSQLDao();
	const conversation = await dao.getConversation(conversationId, user.id);
	if (!conversation) throw new Error("Conversation not found");
	if (conversation.status === "created" && conversation.studyId) return { studyId: conversation.studyId };

	const draft = conversation.draft;
	if (!draft || draft.steps.length === 0) throw new Error("The plan has no readings yet");
	if (!bibleId) throw new Error("Please select a Bible translation");

	const study = await studyCreateSS({
		name: draft.name,
		description: draft.description,
		topic: draft.topic,
		length: draft.length,
		depth: draft.depth,
		ownerId: user.id,
		bibleId,
		steps: draft.steps.map((step, i) => draftStepToInsert(step, i + 1)),
	});
	await dao.updateConversation(conversation.id, { status: "created", studyId: study.id, bibleId });
	return { studyId: study.id };
}
