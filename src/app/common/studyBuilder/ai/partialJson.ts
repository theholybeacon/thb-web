/**
 * Reads a string field out of a JSON object that is still arriving.
 *
 * The builder asks the model for one JSON object per turn (so the plan and the
 * quick replies come back machine-readable) but wants the reply itself to
 * appear word by word. The prompt puts `reply` first; this decodes as much of
 * it as has streamed so far. An escape sequence cut in half at the end of the
 * buffer is left for the next call rather than decoded wrong.
 */
export function partialJsonString(buffer: string, key: string): { text: string; complete: boolean } | null {
	const opening = new RegExp(`"${key}"\\s*:\\s*"`).exec(buffer);
	if (!opening) return null;

	let text = "";
	let i = opening.index + opening[0].length;
	while (i < buffer.length) {
		const ch = buffer[i];
		if (ch === '"') return { text, complete: true };
		if (ch !== "\\") {
			text += ch;
			i++;
			continue;
		}
		const next = buffer[i + 1];
		if (next === undefined) break;
		if (next === "u") {
			const hex = buffer.slice(i + 2, i + 6);
			if (hex.length < 4) break;
			text += String.fromCharCode(parseInt(hex, 16));
			i += 6;
			continue;
		}
		text += ESCAPES[next] ?? next;
		i += 2;
	}
	return { text, complete: false };
}

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "\\": "\\", "/": "/" };
