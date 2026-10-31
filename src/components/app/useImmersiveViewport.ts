"use client";

import { useEffect, useState } from "react";

export interface ViewportBox {
	height: number;
	top: number;
}

/**
 * Below this share of the window's height, the visual viewport has been taken
 * by the on-screen keyboard. A browser's own chrome never hides this much.
 */
const KEYBOARD_RATIO = 0.75;

/**
 * Pins an immersive screen (the reading engine, the study builder chat) to the
 * part of the screen the reader can actually see.
 *
 * While it is mounted the document itself does not scroll — `html.thb-immersive`
 * locks it, so only the screen's own panes scroll — and the shell is sized to
 * the visual viewport rather than the layout viewport. On phones those differ
 * by the keyboard: iOS and Chrome on Android leave the layout viewport alone
 * when the keyboard opens and just cover it, so a `100dvh` shell would keep its
 * bottom (the text being typed, the chat composer) under the keyboard.
 *
 * `html[data-keyboard="open"]` is set while the keyboard is up, so chrome that
 * is only in the way then can step aside (`.thb-keyboard-hide`).
 */
export function useImmersiveViewport(enabled: boolean): ViewportBox | null {
	const [box, setBox] = useState<ViewportBox | null>(null);

	useEffect(() => {
		if (!enabled) return;
		const root = document.documentElement;
		root.classList.add("thb-immersive");

		const viewport = window.visualViewport;
		if (!viewport) {
			return () => root.classList.remove("thb-immersive");
		}

		const update = () => {
			// Pinch-zoomed: the visual viewport is a magnified piece of the page, not
			// the screen. Sizing the shell to it would shrink the layout under the zoom.
			if (viewport.scale > 1.01) {
				setBox(null);
				delete root.dataset.keyboard;
				return;
			}
			setBox({ height: Math.round(viewport.height), top: Math.round(viewport.offsetTop) });
			if (viewport.height < window.innerHeight * KEYBOARD_RATIO) root.dataset.keyboard = "open";
			else delete root.dataset.keyboard;
		};

		update();
		viewport.addEventListener("resize", update);
		viewport.addEventListener("scroll", update);
		return () => {
			viewport.removeEventListener("resize", update);
			viewport.removeEventListener("scroll", update);
			root.classList.remove("thb-immersive");
			delete root.dataset.keyboard;
		};
	}, [enabled]);

	return enabled ? box : null;
}
