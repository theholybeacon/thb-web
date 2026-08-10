/**
 * Minimal MPEG audio (MP3) frame parser and concatenator — no dependencies.
 *
 * Why this exists: `gpt-4o-mini-tts` returns audio with NO timestamps, and its
 * `input` is capped at 4096 chars (a long chapter blows past that). So a chapter
 * is synthesized one verse at a time and the clips are stitched together here.
 *
 * MPEG audio frames are self-contained, so tag-stripped clips can be byte-
 * concatenated into one playable stream. Frame count is exact, so the duration
 * of each clip — and therefore the start offset of every verse — is *counted*,
 * not estimated. That exactness is what makes verse highlighting and seek-to-verse
 * land on the right word instead of drifting.
 *
 * OpenAI TTS emits 24 kHz mono, which is MPEG-2 Layer III => 576 samples/frame
 * => exactly 24 ms per frame.
 */

/** Bitrate tables (kbps), indexed by the 4-bit bitrate field. 0 = "free", 15 = invalid. */
const BITRATES_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const BITRATES_MPEG2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];

/** Sample rates (Hz), indexed by the 2-bit sample-rate field, per MPEG version. */
const SAMPLE_RATES: Record<number, number[]> = {
	3: [44100, 48000, 32000], // MPEG-1
	2: [22050, 24000, 16000], // MPEG-2
	0: [11025, 12000, 8000], // MPEG-2.5
};

export interface Mp3Info {
	/** Byte offset of the first MPEG frame (after any ID3v2 tag). */
	audioStart: number;
	/** Byte offset just past the last MPEG frame (before any ID3v1 tag). */
	audioEnd: number;
	frameCount: number;
	sampleRate: number;
	/** 1152 for MPEG-1 Layer III, 576 for MPEG-2/2.5 Layer III. */
	samplesPerFrame: number;
	durationMs: number;
	/** False if bitrate varies between frames — see concatMp3's caveat. */
	cbr: boolean;
	bitrateKbps: number;
}

/** Reads a 28-bit syncsafe integer (ID3v2 size fields). */
function syncsafe32(buf: Buffer, offset: number): number {
	return (
		((buf[offset] & 0x7f) << 21) |
		((buf[offset + 1] & 0x7f) << 14) |
		((buf[offset + 2] & 0x7f) << 7) |
		(buf[offset + 3] & 0x7f)
	);
}

/** Byte offset of the first MPEG frame: past an ID3v2 tag if one is present. */
function findAudioStart(buf: Buffer): number {
	if (buf.length >= 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
		// "ID3" — 10-byte header + syncsafe size, plus a footer if bit 4 of flags is set.
		const hasFooter = (buf[5] & 0x10) !== 0;
		return 10 + syncsafe32(buf, 6) + (hasFooter ? 10 : 0);
	}
	return 0;
}

/** Byte offset just past the last MPEG frame: before an ID3v1 tag if one is present. */
function findAudioEnd(buf: Buffer): number {
	if (buf.length >= 128) {
		const tagStart = buf.length - 128;
		if (buf[tagStart] === 0x54 && buf[tagStart + 1] === 0x41 && buf[tagStart + 2] === 0x47) {
			return tagStart; // "TAG"
		}
	}
	return buf.length;
}

interface FrameHeader {
	frameLength: number;
	sampleRate: number;
	samplesPerFrame: number;
	bitrateKbps: number;
}

/**
 * Decodes a 4-byte MPEG audio frame header, or returns null if `offset` is not a
 * valid frame start. Validation is deliberately strict — a false sync would
 * desynchronize the walk and corrupt every offset after it.
 */
function parseFrameHeader(buf: Buffer, offset: number): FrameHeader | null {
	if (offset + 4 > buf.length) return null;

	// Sync word: 11 bits of 1s.
	if (buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) return null;

	const versionBits = (buf[offset + 1] >> 3) & 0x03; // 3=MPEG-1, 2=MPEG-2, 0=MPEG-2.5 (1=reserved)
	const layerBits = (buf[offset + 1] >> 1) & 0x03; // 1 = Layer III
	if (versionBits === 1 || layerBits !== 1) return null;

	const bitrateIndex = (buf[offset + 2] >> 4) & 0x0f;
	const sampleRateIndex = (buf[offset + 2] >> 2) & 0x03;
	const padding = (buf[offset + 2] >> 1) & 0x01;
	if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return null;

	const isMpeg1 = versionBits === 3;
	const bitrateKbps = (isMpeg1 ? BITRATES_MPEG1_L3 : BITRATES_MPEG2_L3)[bitrateIndex];
	const sampleRate = SAMPLE_RATES[versionBits][sampleRateIndex];
	if (!bitrateKbps || !sampleRate) return null;

	const samplesPerFrame = isMpeg1 ? 1152 : 576;
	// Layer III frame length. The coefficient is samplesPerFrame / 8.
	const coefficient = isMpeg1 ? 144000 : 72000;
	const frameLength = Math.floor((coefficient * bitrateKbps) / sampleRate) + padding;
	if (frameLength <= 4) return null;

	return { frameLength, sampleRate, samplesPerFrame, bitrateKbps };
}

/**
 * Walks every MPEG frame header and computes the exact duration by counting
 * frames. Throws if the buffer contains no decodable frames.
 */
export function parseMp3(buf: Buffer): Mp3Info {
	const audioStart = findAudioStart(buf);
	const audioEnd = findAudioEnd(buf);

	let offset = audioStart;
	let frameCount = 0;
	let totalSamples = 0;
	let sampleRate = 0;
	let samplesPerFrame = 0;
	let firstBitrate = 0;
	let cbr = true;

	while (offset < audioEnd) {
		const header = parseFrameHeader(buf, offset);
		if (!header) {
			// Not a frame start. Resync by scanning forward for the next 0xFF.
			const next = buf.indexOf(0xff, offset + 1);
			if (next === -1 || next >= audioEnd) break;
			offset = next;
			continue;
		}

		if (frameCount === 0) {
			sampleRate = header.sampleRate;
			samplesPerFrame = header.samplesPerFrame;
			firstBitrate = header.bitrateKbps;
		} else if (header.bitrateKbps !== firstBitrate) {
			cbr = false;
		}

		frameCount++;
		totalSamples += header.samplesPerFrame;
		offset += header.frameLength;
	}

	if (frameCount === 0 || !sampleRate) {
		throw new Error("parseMp3: no decodable MPEG frames found");
	}

	return {
		audioStart,
		audioEnd,
		frameCount,
		sampleRate,
		samplesPerFrame,
		durationMs: (totalSamples / sampleRate) * 1000,
		cbr,
		bitrateKbps: firstBitrate,
	};
}

/** Returns just the MPEG frame region, with ID3v2/ID3v1 tags stripped off. */
export function stripMp3Tags(buf: Buffer): Buffer {
	return buf.subarray(findAudioStart(buf), findAudioEnd(buf));
}

/**
 * Concatenates several MP3 clips into one playable stream and reports where each
 * clip starts and ends on the combined timeline.
 *
 * Offsets are frame-counted, so they are exact rather than interpolated. Each
 * clip carries a little encoder delay/padding at its edges, which shows up as a
 * ~50-80ms pause at each seam — for scripture narration that reads as a natural
 * beat between verses, and it stays *inside* the clip's measured duration, so the
 * offsets remain correct.
 */
export function concatMp3(parts: Buffer[]): { buffer: Buffer; offsetsMs: number[]; durationMs: number } {
	const frames: Buffer[] = [];
	const offsetsMs: number[] = [];
	let cursorMs = 0;

	for (const part of parts) {
		const info = parseMp3(part);
		offsetsMs.push(cursorMs);
		frames.push(part.subarray(info.audioStart, info.audioEnd));
		cursorMs += info.durationMs;
	}

	return { buffer: Buffer.concat(frames), offsetsMs, durationMs: cursorMs };
}
