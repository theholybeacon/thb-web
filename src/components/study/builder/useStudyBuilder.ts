"use client";

import { useCallback, useRef, useState } from "react";
import { studyBuilderDraftSaveSS } from "@/app/common/studyBuilder/service/server/studyBuilderSS";
import type {
	LearnerHighlight,
	StudyBuilderConversationFull,
	StudyBuilderDraft,
	StudyBuilderEvent,
	StudyBuilderMemoryFact,
	StudyBuilderMessage,
	StudyBuilderStatus,
} from "@/app/common/studyBuilder/model/StudyBuilder";

export type BuilderStatus = "idle" | "thinking" | "streaming";

/** Manual edits are saved this long after the last one, so typing a name is one save, not twenty. */
const SAVE_DELAY_MS = 600;

/**
 * The client half of a builder conversation: sends a turn, reads the NDJSON
 * event stream back, and keeps the transcript, the streaming reply and the
 * plan in state. The plan has two authors — the AI and the manual editor —
 * and the page holds the latest version: every turn sends it along, so the
 * AI always works on what the reader sees.
 */
export function useStudyBuilder(onConversation: (id: string) => void) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [conversationStatus, setConversationStatus] = useState<StudyBuilderStatus>("active");
	const [studyId, setStudyId] = useState<string | null>(null);
	const [messages, setMessages] = useState<StudyBuilderMessage[]>([]);
	const [draft, setDraftState] = useState<StudyBuilderDraft | null>(null);
	/** Bumped every time the AI changes the plan, so the plan panel can flash. Manual edits leave it. */
	const [draftVersion, setDraftVersion] = useState(0);
	const [highlights, setHighlights] = useState<LearnerHighlight[] | null>(null);
	const [streamingText, setStreamingText] = useState("");
	const [status, setStatus] = useState<BuilderStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [remembered, setRemembered] = useState<StudyBuilderMemoryFact[]>([]);
	const busy = useRef(false);
	const conversationRef = useRef<string | null>(null);
	const draftRef = useRef<StudyBuilderDraft | null>(null);
	const bibleRef = useRef<string | null>(null);
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saving = useRef<Promise<void>>(Promise.resolve());

	const setDraft = useCallback((next: StudyBuilderDraft | null) => {
		draftRef.current = next;
		setDraftState(next);
	}, []);

	const adopt = useCallback((id: string) => {
		if (conversationRef.current === id) return;
		conversationRef.current = id;
		setConversationId(id);
		onConversation(id);
	}, [onConversation]);

	const load = useCallback((conversation: StudyBuilderConversationFull | null) => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = null;
		conversationRef.current = conversation?.id ?? null;
		setConversationId(conversation?.id ?? null);
		setConversationStatus(conversation?.status ?? "active");
		setStudyId(conversation?.studyId ?? null);
		setMessages(conversation?.messages ?? []);
		setDraft(conversation?.draft ?? null);
		setStreamingText("");
		setError(null);
		setRemembered([]);
	}, [setDraft]);

	const persist = useCallback(() => {
		saveTimer.current = null;
		saving.current = saving.current.then(async () => {
			try {
				const saved = await studyBuilderDraftSaveSS(conversationRef.current, draftRef.current, bibleRef.current);
				adopt(saved.conversationId);
				setConversationStatus(saved.status);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Could not save the plan.");
			}
		});
		return saving.current;
	}, [adopt]);

	/** Waits until every manual edit is saved: before a turn, and before the plan becomes a study. */
	const flush = useCallback(() => {
		if (saveTimer.current) {
			clearTimeout(saveTimer.current);
			return persist();
		}
		return saving.current;
	}, [persist]);

	/** Saves everything and makes sure the plan has a conversation; returns its id. */
	const ensureSaved = useCallback(async () => {
		await flush();
		if (!conversationRef.current) await persist();
		if (!conversationRef.current) throw new Error("Could not save the plan.");
		return conversationRef.current;
	}, [flush, persist]);

	/** A change made by hand in the manual editor. */
	const editDraft = useCallback((next: StudyBuilderDraft, bibleId: string | null) => {
		setDraft(next);
		bibleRef.current = bibleId;
		if (studyId) setConversationStatus("editing");
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => void persist(), SAVE_DELAY_MS);
	}, [persist, setDraft, studyId]);

	const send = useCallback(async (message: string | null, bibleId: string | null) => {
		if (busy.current) return;
		busy.current = true;
		setError(null);
		setStatus("thinking");
		setStreamingText("");
		if (message) {
			setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content: message, payload: null, createdAt: new Date().toISOString() }]);
		}

		try {
			await flush();
			const res = await fetch("/api/study/builder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ conversationId: conversationRef.current, message, bibleId, draft: draftRef.current }),
			});
			if (!res.ok || !res.body) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || "The study builder is unavailable right now.");
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			for (;;) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				let newline;
				while ((newline = buffer.indexOf("\n")) >= 0) {
					const line = buffer.slice(0, newline).trim();
					buffer = buffer.slice(newline + 1);
					if (line) handle(JSON.parse(line) as StudyBuilderEvent);
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Something went wrong.");
		} finally {
			setStatus("idle");
			setStreamingText("");
			busy.current = false;
		}

		function handle(event: StudyBuilderEvent) {
			switch (event.type) {
				case "conversation":
					adopt(event.id);
					break;
				case "context":
					setHighlights(event.highlights);
					break;
				case "delta":
					setStatus("streaming");
					setStreamingText((prev) => prev + event.text);
					break;
				case "done":
					setMessages((prev) => [...prev, event.message]);
					setConversationStatus(event.status);
					if (event.message.payload?.draftChanged) {
						setDraft(event.draft);
						setDraftVersion((v) => v + 1);
					}
					if (event.remembered.length) setRemembered((prev) => [...prev, ...event.remembered]);
					break;
				case "error":
					setError(event.error);
					break;
			}
		}
	}, [adopt, flush, setDraft]);

	return {
		conversationId,
		conversationStatus,
		setConversationStatus,
		studyId,
		messages,
		draft,
		draftVersion,
		highlights,
		streamingText,
		status,
		error,
		remembered,
		load,
		send,
		editDraft,
		ensureSaved,
	};
}
