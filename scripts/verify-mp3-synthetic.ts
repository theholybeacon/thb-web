/**
 * Hermetic unit test for src/lib/mp3.ts — no network, no API key.
 *
 * Builds MPEG-2 Layer III frames by hand (the exact shape OpenAI TTS emits:
 * 24 kHz mono => 576 samples/frame => exactly 24 ms/frame), so the expected
 * frame count and duration are known precisely. If the parser can't recover
 * them, verse offsets would drift and read-along highlighting would be wrong.
 *
 * Usage: npx tsx scripts/verify-mp3-synthetic.ts
 */
import { parseMp3, stripMp3Tags, concatMp3 } from "../src/lib/mp3";

const SAMPLE_RATE = 24000;
const BITRATE_KBPS = 48;
const SAMPLES_PER_FRAME = 576;
const MS_PER_FRAME = (SAMPLES_PER_FRAME / SAMPLE_RATE) * 1000; // exactly 24ms
const FRAME_LENGTH = Math.floor((72000 * BITRATE_KBPS) / SAMPLE_RATE); // 144 bytes

/** One MPEG-2 Layer III frame: 4-byte header + zeroed payload. */
function makeFrame(): Buffer {
	const frame = Buffer.alloc(FRAME_LENGTH, 0);
	frame[0] = 0xff; // sync
	frame[1] = 0xf3; // sync(3) | version=2 (MPEG-2) | layer=01 (III) | no CRC
	frame[2] = 0x64; // 0110=bitrate idx 6 (48kbps) | 01=samplerate idx 1 (24000) | 0=no padding
	frame[3] = 0xc0; // mono
	return frame;
}

function makeMp3(frameCount: number, opts: { id3v2?: boolean; id3v1?: boolean } = {}): Buffer {
	const chunks: Buffer[] = [];

	if (opts.id3v2) {
		// "ID3" + version + flags + syncsafe size (32 bytes of payload)
		const header = Buffer.alloc(10 + 32, 0);
		header.write("ID3", 0, "ascii");
		header[3] = 0x03;
		header[9] = 32; // syncsafe size = 32
		chunks.push(header);
	}

	for (let i = 0; i < frameCount; i++) chunks.push(makeFrame());

	if (opts.id3v1) {
		const tag = Buffer.alloc(128, 0);
		tag.write("TAG", 0, "ascii");
		chunks.push(tag);
	}

	return Buffer.concat(chunks);
}

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
	const ok = actual === expected;
	if (!ok) failures++;
	console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(52)} got=${actual} want=${expected}`);
}

console.log(`Frame geometry: ${FRAME_LENGTH} bytes, ${MS_PER_FRAME} ms/frame @ ${SAMPLE_RATE} Hz\n`);

console.log("--- bare stream (100 frames) ---");
{
	const mp3 = makeMp3(100);
	const info = parseMp3(mp3);
	check("frameCount", info.frameCount, 100);
	check("sampleRate", info.sampleRate, SAMPLE_RATE);
	check("samplesPerFrame", info.samplesPerFrame, SAMPLES_PER_FRAME);
	check("bitrateKbps", info.bitrateKbps, BITRATE_KBPS);
	check("cbr", info.cbr, true);
	check("durationMs (100 * 24ms)", info.durationMs, 2400);
	check("audioStart", info.audioStart, 0);
}

console.log("\n--- with ID3v2 head + ID3v1 tail (50 frames) ---");
{
	const mp3 = makeMp3(50, { id3v2: true, id3v1: true });
	const info = parseMp3(mp3);
	check("skips ID3v2 (audioStart)", info.audioStart, 42);
	check("trims ID3v1 (audioEnd)", info.audioEnd, 42 + 50 * FRAME_LENGTH);
	check("frameCount", info.frameCount, 50);
	check("durationMs (50 * 24ms)", info.durationMs, 1200);
	check("stripMp3Tags length", stripMp3Tags(mp3).length, 50 * FRAME_LENGTH);
}

console.log("\n--- concat: 3 tagged clips of 10 / 25 / 40 frames ---");
{
	const clips = [
		makeMp3(10, { id3v2: true, id3v1: true }),
		makeMp3(25, { id3v2: true }),
		makeMp3(40, { id3v1: true }),
	];
	const { buffer, offsetsMs, durationMs } = concatMp3(clips);
	const combined = parseMp3(buffer);

	check("verse 1 offset", offsetsMs[0], 0);
	check("verse 2 offset (10 * 24ms)", offsetsMs[1], 240);
	check("verse 3 offset (35 * 24ms)", offsetsMs[2], 840);
	check("accumulated duration (75 * 24ms)", durationMs, 1800);

	// The real assertion: after concatenation, re-parsing the combined stream must
	// recover exactly the frames we put in. If this drifts, offsets are lies.
	check("re-parsed frameCount", combined.frameCount, 75);
	check("re-parsed durationMs", combined.durationMs, 1800);
	check("no tags survived concat", combined.audioStart, 0);
	check("byte length is pure frames", buffer.length, 75 * FRAME_LENGTH);
}

console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
