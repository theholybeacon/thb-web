/**
 * Proves the load-bearing assumption of Listen Mode: that we can synthesize verses
 * separately, concatenate the MP3s, and know each verse's exact start offset.
 *
 * Synthesizes 3 real verses, parses each clip's frames, concatenates them, then
 * re-parses the combined file and checks the totals agree. If the round-trip
 * duration doesn't match the sum of the parts, verse highlighting would drift and
 * the whole design is wrong.
 *
 * Usage: npx tsx scripts/verify-mp3.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { writeFileSync } from "fs";
import OpenAI from "openai";
import { parseMp3, concatMp3 } from "../src/lib/mp3";

const VERSES = [
	"In the beginning God created the heaven and the earth.",
	"And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
	"And God said, Let there be light: and there was light.",
];

async function main() {
	const client = new OpenAI();
	const clips: Buffer[] = [];

	console.log("Synthesizing 3 verses with gpt-4o-mini-tts...\n");

	for (let i = 0; i < VERSES.length; i++) {
		const res = await client.audio.speech.create({
			model: "gpt-4o-mini-tts",
			voice: "sage",
			input: VERSES[i],
			response_format: "mp3",
			instructions:
				"Read this Bible passage as a calm, warm, unhurried narrator. Natural pacing, clear articulation, no dramatization.",
		});
		const buf = Buffer.from(await res.arrayBuffer());
		clips.push(buf);

		const info = parseMp3(buf);
		console.log(
			`verse ${i + 1}: ${String(buf.length).padStart(7)} bytes | ` +
				`${String(info.frameCount).padStart(4)} frames | ${info.sampleRate} Hz | ` +
				`${info.samplesPerFrame} samples/frame | ${info.bitrateKbps} kbps | ` +
				`cbr=${info.cbr} | ${info.durationMs.toFixed(1)} ms`
		);
	}

	const sumOfParts = clips.reduce((acc, c) => acc + parseMp3(c).durationMs, 0);

	const { buffer, offsetsMs, durationMs } = concatMp3(clips);
	const combined = parseMp3(buffer);

	console.log("\n--- concatenated ---");
	console.log(`bytes:              ${buffer.length}`);
	console.log(`frames:             ${combined.frameCount}`);
	console.log(`verse offsets (ms): ${offsetsMs.map((o) => o.toFixed(0)).join(", ")}`);
	console.log(`sum of parts (ms):  ${sumOfParts.toFixed(2)}`);
	console.log(`accumulated (ms):   ${durationMs.toFixed(2)}`);
	console.log(`re-parsed (ms):     ${combined.durationMs.toFixed(2)}`);

	const drift = Math.abs(combined.durationMs - sumOfParts);
	const framesMatch = combined.frameCount === clips.reduce((a, c) => a + parseMp3(c).frameCount, 0);

	console.log("\n--- assertions ---");
	console.log(`frame count preserved across concat: ${framesMatch ? "PASS" : "FAIL"}`);
	console.log(`duration drift: ${drift.toFixed(4)} ms ${drift < 1 ? "PASS" : "FAIL"}`);
	console.log(`all clips CBR: ${clips.every((c) => parseMp3(c).cbr) ? "PASS" : "WARN (VBR — see mp3.ts caveat)"}`);

	writeFileSync("/tmp/thb-verify.mp3", buffer);
	console.log("\nWrote /tmp/thb-verify.mp3 — play it and confirm the verses run together cleanly.");
	console.log("Expected verse starts:", offsetsMs.map((o) => `${(o / 1000).toFixed(2)}s`).join(", "));

	if (!framesMatch || drift >= 1) process.exit(1);
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
