"use client";

import { useCallback, useEffect, useState } from "react";
import { readStored, writeStored } from "@/components/reader/readerPrefs";

const OPEN_KEY = "explorer-sidebar-open";

/**
 * Open/collapsed state for the books sidebar in the Bible explorer.
 *
 * Tri-state on purpose. `null` means the reader has never chosen, and the
 * caller answers it with CSS (`w-12 lg:w-72`) instead of JavaScript — so the
 * server render and the first paint are already right on a phone *and* on a
 * desktop, with no flash of the wrong width while storage is read. Once the
 * reader toggles it, the stored boolean applies at every breakpoint.
 *
 * Storage is read in an effect rather than during render: reading it inline
 * would desync SSR, the same discipline useReaderPanel documents.
 */
export function useExplorerSidebar() {
	const [open, setOpen] = useState<boolean | null>(null);

	useEffect(() => {
		setOpen(readStored<boolean | null>(OPEN_KEY, null));
	}, []);

	const set = useCallback((next: boolean) => {
		setOpen(next);
		writeStored(OPEN_KEY, next);
	}, []);

	// No toggle: the rail is only rendered when the panel is not showing and the
	// collapse button only when it is, so each affordance has one direction.
	const openSidebar = useCallback(() => set(true), [set]);
	const closeSidebar = useCallback(() => set(false), [set]);

	return { open, openSidebar, closeSidebar };
}
