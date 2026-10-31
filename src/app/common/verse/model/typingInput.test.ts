import { describe, expect, it } from "vitest";
import { applyTypingKeys, keysFromInputEvent, type TypedCharState } from "./typingInput";

const pending = (text: string): TypedCharState[] => Array.from(text, (char) => ({ char, state: "pending" }));

describe("applyTypingKeys", () => {
	it("grades each key against the slot under the cursor", () => {
		const { states, index } = applyTypingKeys(pending("in the"), 0, ["i", "m", " "]);
		expect(index).toBe(3);
		expect(states.slice(0, 3).map((s) => s.state)).toEqual(["correct", "incorrect", "correct"]);
		expect(states[3].state).toBe("pending");
	});

	it("folds case and accents like the rest of Type mode", () => {
		const { states } = applyTypingKeys(pending("dios"), 0, ["D", "I"]);
		expect(states.slice(0, 2).map((s) => s.state)).toEqual(["correct", "correct"]);
	});

	it("applies a burst of characters in one go, as Android keyboards send them", () => {
		const { states, index } = applyTypingKeys(pending("praise"), 0, Array.from("prai"));
		expect(index).toBe(4);
		expect(states.filter((s) => s.state === "correct")).toHaveLength(4);
	});

	it("steps back and clears the slot on Backspace", () => {
		const typed = applyTypingKeys(pending("ab"), 0, ["x"]);
		const { states, index } = applyTypingKeys(typed.states, typed.index, ["Backspace", "a"]);
		expect(index).toBe(1);
		expect(states[0].state).toBe("correct");
	});

	it("ignores Backspace at the start and keys past the end", () => {
		expect(applyTypingKeys(pending("a"), 0, ["Backspace"]).index).toBe(0);
		const { index, states } = applyTypingKeys(pending("a"), 0, ["a", "b", "c"]);
		expect(index).toBe(1);
		expect(states).toHaveLength(1);
	});

	it("leaves the states it was given untouched", () => {
		const before = pending("ab");
		applyTypingKeys(before, 0, ["a"]);
		expect(before[0].state).toBe("pending");
	});
});

describe("keysFromInputEvent", () => {
	it("splits inserted text into keys", () => {
		expect(keysFromInputEvent("insertText", "Praise")).toEqual(["P", "r", "a", "i", "s", "e"]);
	});

	it("turns line breaks into a space", () => {
		expect(keysFromInputEvent("insertLineBreak", null)).toEqual([" "]);
		expect(keysFromInputEvent("insertParagraph", null)).toEqual([" "]);
	});

	it("turns a backward delete into Backspace", () => {
		expect(keysFromInputEvent("deleteContentBackward", null)).toEqual(["Backspace"]);
	});

	it("leaves composition and paste alone", () => {
		expect(keysFromInputEvent("insertCompositionText", "Pra")).toBeNull();
		expect(keysFromInputEvent("insertFromPaste", "Praise")).toBeNull();
	});
});
