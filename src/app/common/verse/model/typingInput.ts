import { foldTypedChar } from "./typingFold";

/**
 * Type mode's keystrokes, as a pure step from one typing state to the next.
 *
 * Keys arrive two ways. A hardware keyboard (and iOS's on-screen one) reports
 * each key on `keydown`. Android's on-screen keyboards do not: their `keydown`
 * carries `key: "Unidentified"`, and the text only shows up afterwards, as a
 * `beforeinput` on the focused field — sometimes several characters at once.
 * Both are reduced to the same list of keys and applied here.
 */

export interface TypedCharState {
	/** The folded character expected here. */
	char: string;
	state: "pending" | "correct" | "incorrect";
}

/** A typed character, or a step back. Line breaks arrive as a space. */
export type TypingKey = string | "Backspace";

export interface TypingStep {
	states: TypedCharState[];
	index: number;
}

/**
 * Applies keys in order. Each character is graded against the slot under the
 * cursor and moves it on; Backspace moves it back and clears that slot. Keys
 * past the end are dropped. Returns the input unchanged when nothing moved.
 */
export function applyTypingKeys(states: TypedCharState[], index: number, keys: TypingKey[]): TypingStep {
	let next: TypedCharState[] | null = null;
	let at = index;
	const set = (i: number, state: TypedCharState["state"]) => {
		next ??= [...states];
		next[i] = { ...next[i], state };
	};

	for (const key of keys) {
		if (key === "Backspace") {
			if (at === 0) continue;
			at -= 1;
			set(at, "pending");
			continue;
		}
		if (at >= states.length) break;
		set(at, foldTypedChar(key) === states[at].char ? "correct" : "incorrect");
		at += 1;
	}

	return { states: next ?? states, index: at };
}

/**
 * The keys a `beforeinput` event stands for, or null for one Type mode leaves
 * alone (composition updates, paste, undo...).
 */
export function keysFromInputEvent(inputType: string, data: string | null): TypingKey[] | null {
	switch (inputType) {
		case "insertText":
		case "insertReplacementText":
			return data ? Array.from(data.replace(/\n/g, " ")) : null;
		case "insertLineBreak":
		case "insertParagraph":
			return [" "];
		case "deleteContentBackward":
			return ["Backspace"];
		default:
			return null;
	}
}
