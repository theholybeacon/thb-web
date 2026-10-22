import { db } from "@/db";
import { and, asc, count, desc, eq, gte, inArray, max, ne, sql } from "drizzle-orm";
import { studyBuilderConversationTable, studyBuilderMemoryTable, studyBuilderMessageTable } from "@/db/schema/studyBuilder";
import { userTable } from "@/db/schema/user";
import { studyTable } from "@/db/schema/study";
import { studyStepTable } from "@/db/schema/studyStep";
import { sessionTable } from "@/db/schema/session";
import { chapterCompletionTable } from "@/db/schema/chapterCompletion";
import { noteTable } from "@/db/schema/note";
import { contributionTable } from "@/db/schema/contribution";
import { communityCommentTable } from "@/db/schema/communityComment";
import { entityTable } from "@/db/schema/entity";
import { userDailyActivityTable } from "@/db/schema/userDailyActivity";
import { draftStepToInsert, normalizeStep, planStepSync, stepKey } from "../model/draft";
import type {
	LearnerProfile,
	StudyBuilderConversationFull,
	StudyBuilderConversationSummary,
	StudyBuilderDraft,
	StudyBuilderMemoryFact,
	StudyBuilderMessage,
	StudyBuilderMessagePayload,
	StudyBuilderStatus,
} from "../model/StudyBuilder";

const day = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const trim = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);

type ConversationRow = typeof studyBuilderConversationTable.$inferSelect;
type MessageRow = typeof studyBuilderMessageTable.$inferSelect;

function toSummary(row: ConversationRow): StudyBuilderConversationSummary {
	return {
		id: row.id,
		title: row.title,
		status: row.status === "created" || row.status === "editing" ? row.status : "active",
		studyId: row.studyId,
		updatedAt: row.updatedAt.toISOString(),
	};
}

function toMessage(row: MessageRow): StudyBuilderMessage {
	return {
		id: row.id,
		role: row.role === "user" ? "user" : "assistant",
		content: row.content,
		payload: row.payload ?? null,
		createdAt: row.createdAt.toISOString(),
	};
}

/**
 * Edge-safe (the builder route runs on the edge runtime): plain drizzle over
 * the neon-http driver, no logger.
 */
export class StudyBuilderPostgreSQLDao {

	// ---- conversations ------------------------------------------------------

	async createConversation(
		userId: string,
		bibleId: string | null,
		start: Partial<{ draft: StudyBuilderDraft | null; title: string; status: StudyBuilderStatus; studyId: string }> = {},
	): Promise<StudyBuilderConversationFull> {
		const [row] = await db.insert(studyBuilderConversationTable).values({ userId, bibleId, ...start }).returning();
		return { ...toSummary(row), draft: row.draft ?? null, bibleId: row.bibleId, messages: [] };
	}

	/** The conversation a study was built (or last edited) in, if there is one. */
	async findConversationForStudy(studyId: string, userId: string): Promise<StudyBuilderConversationFull | null> {
		const [row] = await db.select({ id: studyBuilderConversationTable.id }).from(studyBuilderConversationTable)
			.where(and(eq(studyBuilderConversationTable.studyId, studyId), eq(studyBuilderConversationTable.userId, userId)))
			.orderBy(desc(studyBuilderConversationTable.updatedAt))
			.limit(1);
		return row ? this.getConversation(row.id, userId) : null;
	}

	async getConversation(id: string, userId: string): Promise<StudyBuilderConversationFull | null> {
		const [row] = await db.select().from(studyBuilderConversationTable)
			.where(and(eq(studyBuilderConversationTable.id, id), eq(studyBuilderConversationTable.userId, userId)));
		if (!row) return null;
		const messages = await db.select().from(studyBuilderMessageTable)
			.where(eq(studyBuilderMessageTable.conversationId, id))
			.orderBy(studyBuilderMessageTable.createdAt);
		return { ...toSummary(row), draft: row.draft ?? null, bibleId: row.bibleId, messages: messages.map(toMessage) };
	}

	async listConversations(userId: string, limit = 20): Promise<StudyBuilderConversationSummary[]> {
		const rows = await db.select().from(studyBuilderConversationTable)
			.where(eq(studyBuilderConversationTable.userId, userId))
			.orderBy(desc(studyBuilderConversationTable.updatedAt))
			.limit(limit);
		return rows.map(toSummary);
	}

	async updateConversation(
		id: string,
		data: Partial<{ draft: StudyBuilderDraft | null; title: string; bibleId: string; status: StudyBuilderStatus; studyId: string }>,
	): Promise<void> {
		await db.update(studyBuilderConversationTable)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(studyBuilderConversationTable.id, id));
	}

	async addMessage(
		conversationId: string,
		role: "user" | "assistant",
		content: string,
		payload: StudyBuilderMessagePayload | null = null,
	): Promise<StudyBuilderMessage> {
		const [row] = await db.insert(studyBuilderMessageTable).values({ conversationId, role, content, payload }).returning();
		return toMessage(row);
	}

	// ---- studies ------------------------------------------------------------

	/**
	 * Saves an edited plan over its study without losing anyone's place (see
	 * planStepSync): readings still in the plan keep their rows, new ones are
	 * added, and sessions standing on a removed reading move to the one now in
	 * its position. Everything after the inserts runs as one transaction.
	 */
	async applyDraftToStudy(studyId: string, draft: StudyBuilderDraft, bibleId: string): Promise<void> {
		const saved = await db.select().from(studyStepTable)
			.where(eq(studyStepTable.studyId, studyId))
			.orderBy(asc(studyStepTable.stepNumber));
		const savedKey = (row: typeof saved[number]) => {
			const range = (start: number | null, end: number | null) => (start ? (end && end !== start ? `${start}-${end}` : String(start)) : null);
			const step = normalizeStep({ bookAbbreviation: row.bookAbbreviation, chapterNumber: range(row.startChapter, row.endChapter), verseNumber: range(row.startVerse, row.endVerse) });
			// A step the canon does not know cannot be in the plan: it never matches, so it is removed.
			return step ? stepKey(step) : `unknown:${row.id}`;
		};
		const sync = planStepSync(saved.map((row) => ({ id: row.id, key: savedKey(row) })), draft.steps);

		const rows = draft.steps.map((step, i) => ({ ...draftStepToInsert(step, i + 1), studyId }));
		const inserted = sync.insert.length
			? await db.insert(studyStepTable).values(sync.insert.map((i) => rows[i])).returning({ id: studyStepTable.id })
			: [];
		const idAt: string[] = [];
		sync.keep.forEach((k) => (idAt[k.index] = k.id));
		sync.insert.forEach((index, n) => (idAt[index] = inserted[n].id));

		const byId = new Map(saved.map((row) => [row.id, row]));
		const now = new Date();
		const stepUpdates = sync.keep
			.filter(({ id, index }) => {
				const before = byId.get(id)!;
				const after = rows[index];
				return before.stepNumber !== after.stepNumber || before.title !== after.title || before.explanation !== after.explanation || before.bookAbbreviation !== after.bookAbbreviation;
			})
			.map(({ id, index }) => {
				const { stepNumber, title, explanation, bookAbbreviation, stepType } = rows[index];
				return db.update(studyStepTable).set({ stepNumber, title, explanation, bookAbbreviation, stepType, updatedAt: now }).where(eq(studyStepTable.id, id));
			});
		const sessionMoves = sync.remove.map(({ id, successor }) => {
			const next = rows[successor];
			return db.update(sessionTable)
				.set({ currentStepId: idAt[successor], currentBookAbbreviation: next.bookAbbreviation, currentChapter: next.startChapter, currentVerse: next.startVerse, updatedAt: now })
				.where(eq(sessionTable.currentStepId, id));
		});
		const removal = sync.remove.length
			? [db.delete(studyStepTable).where(inArray(studyStepTable.id, sync.remove.map((r) => r.id)))]
			: [];

		await db.batch([
			db.update(studyTable).set({
				name: draft.name,
				description: draft.description,
				topic: draft.topic,
				length: draft.length,
				depth: draft.depth,
				bibleId,
				updatedAt: now,
			}).where(eq(studyTable.id, studyId)),
			...stepUpdates,
			...sessionMoves,
			...removal,
		]);
	}

	// ---- memory -------------------------------------------------------------

	async listMemory(userId: string): Promise<StudyBuilderMemoryFact[]> {
		const rows = await db.select().from(studyBuilderMemoryTable)
			.where(eq(studyBuilderMemoryTable.userId, userId))
			.orderBy(desc(studyBuilderMemoryTable.createdAt))
			.limit(50);
		return rows.map((r) => ({ id: r.id, fact: r.fact, createdAt: r.createdAt.toISOString() }));
	}

	async addMemory(userId: string, facts: string[], conversationId: string): Promise<StudyBuilderMemoryFact[]> {
		if (!facts.length) return [];
		const rows = await db.insert(studyBuilderMemoryTable)
			.values(facts.map((fact) => ({ userId, fact: fact.slice(0, 500), conversationId })))
			.returning();
		return rows.map((r) => ({ id: r.id, fact: r.fact, createdAt: r.createdAt.toISOString() }));
	}

	async deleteMemory(userId: string, id: string): Promise<void> {
		await db.delete(studyBuilderMemoryTable)
			.where(and(eq(studyBuilderMemoryTable.id, id), eq(studyBuilderMemoryTable.userId, userId)));
	}

	// ---- the reader ---------------------------------------------------------

	/**
	 * Everything the app knows about a reader, trimmed for a prompt. One round
	 * of parallel queries; each list is capped so a heavy reader costs the same
	 * tokens as a light one. `currentConversationId` is left out of the history:
	 * its turns are sent as the chat itself.
	 */
	async getLearnerProfile(userId: string, locale: string, currentConversationId: string | null): Promise<LearnerProfile> {
		const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

		const [
			[user],
			[totals],
			books,
			recent,
			studies,
			sessions,
			notes,
			posts,
			comments,
			[activity],
			conversations,
			memory,
		] = await Promise.all([
			db.select({ name: userTable.name, createdAt: userTable.createdAt }).from(userTable).where(eq(userTable.id, userId)),
			db.select({ chapters: count() }).from(chapterCompletionTable).where(eq(chapterCompletionTable.userId, userId)),
			db.select({
				usfm: chapterCompletionTable.bookAbbreviation,
				chapters: sql<number>`count(distinct ${chapterCompletionTable.chapter})`.mapWith(Number),
				lastReadAt: max(chapterCompletionTable.completedAt),
			}).from(chapterCompletionTable)
				.where(eq(chapterCompletionTable.userId, userId))
				.groupBy(chapterCompletionTable.bookAbbreviation)
				.orderBy(desc(sql`count(distinct ${chapterCompletionTable.chapter})`))
				.limit(12),
			db.select({
				usfm: chapterCompletionTable.bookAbbreviation,
				chapter: chapterCompletionTable.chapter,
				mode: chapterCompletionTable.mode,
				completedAt: chapterCompletionTable.completedAt,
			}).from(chapterCompletionTable)
				.where(eq(chapterCompletionTable.userId, userId))
				.orderBy(desc(chapterCompletionTable.completedAt))
				.limit(12),
			db.select({ id: studyTable.id, name: studyTable.name, topic: studyTable.topic, createdAt: studyTable.createdAt })
				.from(studyTable)
				.where(eq(studyTable.ownerId, userId))
				.orderBy(desc(studyTable.createdAt))
				.limit(12),
			db.select({ studyId: sessionTable.studyId, completedAt: sessionTable.completedAt })
				.from(sessionTable)
				.where(eq(sessionTable.userId, userId)),
			db.select({ reference: noteTable.reference, title: noteTable.title, content: noteTable.content, updatedAt: noteTable.updatedAt })
				.from(noteTable)
				.where(eq(noteTable.ownerId, userId))
				.orderBy(desc(noteTable.updatedAt))
				.limit(12),
			db.select({
				reference: contributionTable.reference,
				entityName: entityTable.name,
				kind: contributionTable.kind,
				body: contributionTable.body,
				createdAt: contributionTable.createdAt,
			}).from(contributionTable)
				.leftJoin(entityTable, eq(entityTable.id, contributionTable.entityId))
				.where(and(eq(contributionTable.userId, userId), eq(contributionTable.status, "published")))
				.orderBy(desc(contributionTable.createdAt))
				.limit(10),
			db.select({
				reference: contributionTable.reference,
				entityName: entityTable.name,
				body: communityCommentTable.body,
				createdAt: communityCommentTable.createdAt,
			}).from(communityCommentTable)
				.innerJoin(contributionTable, eq(contributionTable.id, communityCommentTable.contributionId))
				.leftJoin(entityTable, eq(entityTable.id, contributionTable.entityId))
				.where(and(eq(communityCommentTable.userId, userId), eq(communityCommentTable.status, "published")))
				.orderBy(desc(communityCommentTable.createdAt))
				.limit(10),
			db.select({ days: count() }).from(userDailyActivityTable)
				.where(and(eq(userDailyActivityTable.userId, userId), gte(userDailyActivityTable.activityDate, since))),
			db.select().from(studyBuilderConversationTable)
				.where(and(
					eq(studyBuilderConversationTable.userId, userId),
					currentConversationId ? ne(studyBuilderConversationTable.id, currentConversationId) : undefined,
				))
				.orderBy(desc(studyBuilderConversationTable.updatedAt))
				.limit(5),
			db.select({ fact: studyBuilderMemoryTable.fact }).from(studyBuilderMemoryTable)
				.where(eq(studyBuilderMemoryTable.userId, userId))
				.orderBy(desc(studyBuilderMemoryTable.createdAt))
				.limit(40),
		]);

		// What the reader actually said in earlier conversations — their words, not the AI's.
		const pastIds = conversations.map((c) => c.id);
		const pastMessages = pastIds.length
			? await db.select({ conversationId: studyBuilderMessageTable.conversationId, content: studyBuilderMessageTable.content })
				.from(studyBuilderMessageTable)
				.where(and(inArray(studyBuilderMessageTable.conversationId, pastIds), eq(studyBuilderMessageTable.role, "user")))
				.orderBy(studyBuilderMessageTable.createdAt)
			: [];

		const sessionByStudy = new Map(sessions.map((s) => [s.studyId, s]));

		return {
			name: user?.name ?? "friend",
			locale,
			memberSince: day(user?.createdAt) || null,
			activeDaysLast30: activity?.days ?? 0,
			reading: {
				totalChapters: totals?.chapters ?? 0,
				books: books.map((b) => ({ usfm: b.usfm, chapters: b.chapters, lastReadAt: day(b.lastReadAt) })),
				recent: recent.map((r) => ({ usfm: r.usfm, chapter: r.chapter, mode: r.mode, date: day(r.completedAt) })),
			},
			studies: studies.map((s) => {
				const session = sessionByStudy.get(s.id);
				return {
					name: s.name,
					topic: trim(s.topic, 200),
					progress: !session ? "not-started" : session.completedAt ? "completed" : "in-progress",
					createdAt: day(s.createdAt),
				};
			}),
			notes: notes.map((n) => ({ reference: n.reference, title: n.title, content: trim(n.content, 300), date: day(n.updatedAt) })),
			posts: posts.map((p) => ({ where: p.reference ?? p.entityName, kind: p.kind, body: trim(p.body, 300), date: day(p.createdAt) })),
			comments: comments.map((c) => ({ where: c.reference ?? c.entityName, body: trim(c.body, 200), date: day(c.createdAt) })),
			pastConversations: conversations.map((c) => ({
				title: c.title,
				outcome: c.status === "created" ? "created" as const : "unfinished" as const,
				said: pastMessages.filter((m) => m.conversationId === c.id).slice(-6).map((m) => trim(m.content, 200)),
				date: day(c.updatedAt),
			// A conversation the reader opened and left without a word says nothing about them.
			})).filter((c) => c.said.length > 0),
			memory: memory.map((m) => m.fact),
		};
	}
}
