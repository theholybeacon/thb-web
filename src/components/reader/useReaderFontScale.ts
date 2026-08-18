"use client";

import { useCallback, useEffect, useState } from "react";
import { readStored, writeStored } from "./readerPrefs";

/**
 * The sizes the A-/A+ control steps through, as multipliers of the reader's
 * base font size. A fixed ladder rather than a free range: every stop is a
 * deliberate, legible size, and "already at the limit" is just an index check.
 *
 * One step down and four up — readers reach for this to make scripture bigger
 * far more often than smaller.
 */
export const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 1.75] as const;

const DEFAULT_SCALE = 1;
const STORAGE_KEY = "reader-font-scale";

/**
 * Reading text size for the reader engine, persisted per browser.
 *
 * The scale VALUE is stored, not its index, so re-tuning `FONT_SCALES` later
 * doesn't silently reinterpret everyone's saved preference as a different size.
 * A stored value that is no longer on the ladder falls back to the default.
 *
 * Starts at the default on the server and hydrates in an effect, for the same
 * reason as `useReaderPanel` — reading storage during render desyncs SSR.
 */
export function useReaderFontScale() {
	const [scale, setScale] = useState<number>(DEFAULT_SCALE);

	useEffect(() => {
		const stored = readStored<number>(STORAGE_KEY, DEFAULT_SCALE);
		setScale(FONT_SCALES.includes(stored as (typeof FONT_SCALES)[number]) ? stored : DEFAULT_SCALE);
	}, []);

	const step = useCallback((direction: 1 | -1) => {
		setScale((prev) => {
			// An off-ladder `prev` cannot happen via the setters, but indexOf would
			// return -1 and quietly jump to the extreme — so anchor on the default.
			const current = FONT_SCALES.indexOf(prev as (typeof FONT_SCALES)[number]);
			const from = current === -1 ? FONT_SCALES.indexOf(DEFAULT_SCALE) : current;
			const next = FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, from + direction))];
			writeStored(STORAGE_KEY, next);
			return next;
		});
	}, []);

	const increase = useCallback(() => step(1), [step]);
	const decrease = useCallback(() => step(-1), [step]);

	return {
		scale,
		increase,
		decrease,
		canIncrease: scale !== FONT_SCALES[FONT_SCALES.length - 1],
		canDecrease: scale !== FONT_SCALES[0],
	};
}
