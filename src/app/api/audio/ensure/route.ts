import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/utils/logger";
import { audioChapterEnsureSS } from "@/app/common/audio/service/server/audioChapterEnsureSS";
import { audioStepIntroEnsureSS } from "@/app/common/audio/service/server/audioStepIntroEnsureSS";

/**
 * Kicks off (or picks up) narration for a chapter or a study step.
 *
 * This is a Route Handler rather than a plain server action for one reason:
 * generation is a long, multi-call job — a 176-verse chapter is dozens of TTS
 * requests — and server actions inherit the invoking route's function limits,
 * which would kill it partway. Here we can ask for the full 5 minutes.
 *
 * Auth and the licence gate live in the services themselves, so this stays thin.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

const log = logger.child({ module: "api/audio/ensure" });

/** Maps a thrown service error to an HTTP status the client can act on. */
function statusFor(message: string): number {
	switch (message) {
		case "UNAUTHENTICATED":
			return 401;
		case "PREMIUM_REQUIRED":
			return 402;
		case "AUDIO_NOT_LICENSED":
			return 451; // Unavailable For Legal Reasons — literally what this is.
		case "BIBLE_NOT_FOUND":
		case "STUDY_STEP_NOT_FOUND":
		case "CHAPTER_NOT_FOUND":
			return 404;
		default:
			return 500;
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (body.kind === "chapter") {
			const { bibleId, bookAbbreviation, chapterNumber, voice } = body;
			if (!bibleId || !bookAbbreviation || typeof chapterNumber !== "number") {
				return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
			}
			const asset = await audioChapterEnsureSS({ bibleId, bookAbbreviation, chapterNumber, voice });
			return NextResponse.json({ asset });
		}

		if (body.kind === "step_intro") {
			const { studyStepId, language, voice } = body;
			if (!studyStepId) {
				return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
			}
			const asset = await audioStepIntroEnsureSS({ studyStepId, language, voice });
			return NextResponse.json({ asset });
		}

		return NextResponse.json({ error: "INVALID_KIND" }, { status: 400 });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const status = statusFor(message);
		if (status === 500) log.error({ err: message }, "audio ensure failed");
		return NextResponse.json({ error: message }, { status });
	}
}
