"use client";

import { useCallback, useRef, useState } from "react";
import type {
	LearnerHighlight,
	StudyBuilderConversationFull,
	StudyBuilderDraft,
	StudyBuilderEvent,
	StudyBuilderMemoryFact,
	StudyBuilderMessage,
} from "@/app/common/studyBuilder/model/StudyBuilder";

export type BuilderStatus = "idle" | "thinking" | "streaming";

/**
 * The client half of a builder conversation: sends a turn, reads the NDJSON
 * event stream back, and keeps the transcript, the streaming reply and the
 * plan in state.
 */
export function useStudyBuilder(onConversation: (id: string) => void) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [messages, setMessages] = useState<StudyBuilderMessage[]>([]);
	const [draft, setDraft] = useState<StudyBuilderDraft | null>(null);
	/** Bumped every time a turn changes the plan, so the plan panel can flash. */
	const [draftVersion, setDraftVersion] = useState(0);
	const [highlights, setHighlights] = useState<LearnerHighlight[] | null>(null);
	const [streamingText, setStreamingText] = useState("");
	const [status, setStatus] = useState<BuilderStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [remembered, setRemembered] = useState<StudyBuilderMemoryFact[]>([]);
	const [createdStudyId, setCreatedStudyId] = useState<string | null>(null);
	const busy = useRef(false);
	const conversationRef = useRef<string | null>(null);

	const load = useCallback((conversation: StudyBuilderConversationFull | null) => {
		conversationRef.current = conversation?.id ?? null;
		setConversationId(conversation?.id ?? null);
		setMessages(conversation?.messages ?? []);
		setDraft(conversation?.draft ?? null);
		setCreatedStudyId(conversation?.status === "created" ? conversation.studyId : null);
		setStreamingText("");
		setError(null);
		setRemembered([]);
	}, []);

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
			const res = await fetch("/api/study/builder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ conversationId: conversationRef.current, message, bibleId }),
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
					if (conversationRef.current !== event.id) {
						conversationRef.current = event.id;
						setConversationId(event.id);
						onConversation(event.id);
					}
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
	}, [onConversation]);

	return {
		conversationId,
		messages,
		draft,
		draftVersion,
		highlights,
		streamingText,
		status,
		error,
		remembered,
		createdStudyId,
		load,
		send,
	};
}
