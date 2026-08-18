"use client";

import { useCallback, useEffect, useState } from "react";

export type ReaderPanelSectionId =
	| "dictionary"
	| "people"
	| "notes"
	| "community"
	| "summary"
	| "translations"
	| "progress";

const OPEN_KEY = "reader-panel-open";
/**
 * Which sections a first-time reader sees open. Community is deliberately not
 * here: the panel is already several sections deep, so a new one arrives
 * collapsed behind its count badge and `revealSection` opens it on demand.
 */
const DEFAULT_EXPANDED: ReaderPanelSectionId[] = ["people", "notes"];
const SECTIONS_KEY = "reader-panel-sections";

function readStored<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}

function writeStored(key: string, value: unknown): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage disabled — the panel still works, it just won't remember */
	}
}

/**
 * Open/collapsed state for the reader info panel, plus which sections are
 * expanded. Persisted so the reader's choice survives chapter navigation, which
 * is a full server-side route change.
 *
 * Both values start at their defaults on the server and are hydrated from
 * localStorage in an effect — reading storage during render would desync SSR.
 */
export function useReaderPanel(defaultOpen = false) {
	const [open, setOpen] = useState(defaultOpen);
	const [expanded, setExpanded] = useState<ReaderPanelSectionId[]>(DEFAULT_EXPANDED);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setOpen(readStored(OPEN_KEY, defaultOpen));
		setExpanded(readStored<ReaderPanelSectionId[]>(SECTIONS_KEY, DEFAULT_EXPANDED));
		setHydrated(true);
		// defaultOpen is only an initial seed; re-running on its change would fight the user.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleOpen = useCallback(() => {
		setOpen((prev) => {
			writeStored(OPEN_KEY, !prev);
			return !prev;
		});
	}, []);

	const openPanel = useCallback(() => {
		setOpen(true);
		writeStored(OPEN_KEY, true);
	}, []);

	const closePanel = useCallback(() => {
		setOpen(false);
		writeStored(OPEN_KEY, false);
	}, []);

	const isExpanded = useCallback(
		(id: ReaderPanelSectionId) => expanded.includes(id),
		[expanded],
	);

	const toggleSection = useCallback((id: ReaderPanelSectionId) => {
		setExpanded((prev) => {
			const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
			writeStored(SECTIONS_KEY, next);
			return next;
		});
	}, []);

	/** Opens the panel and makes sure the given section is expanded. */
	const revealSection = useCallback((id: ReaderPanelSectionId) => {
		setOpen(true);
		writeStored(OPEN_KEY, true);
		setExpanded((prev) => {
			if (prev.includes(id)) return prev;
			const next = [...prev, id];
			writeStored(SECTIONS_KEY, next);
			return next;
		});
	}, []);

	return { open, hydrated, toggleOpen, openPanel, closePanel, isExpanded, toggleSection, revealSection };
}
