export const runtime = 'edge';

import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { StudyBuilderPostgreSQLDao } from "@/app/common/studyBuilder/dao/StudyBuilderPostgreSQLDao";
import { FakeStudyBuilderAI, OpenAIStudyBuilderAI } from "@/app/common/studyBuilder/ai/StudyBuilderAI";
import { studyBuilderTurn } from "@/app/common/studyBuilder/service/studyBuilderTurn";
import { NextRequest, NextResponse } from "next/server";

/**
 * One turn of the conversational study builder, streamed as newline-delimited
 * JSON (StudyBuilderEvent). Edge runtime for the same reason as
 * generate-steps: the 25s limit applies to the first byte, and the first
 * events go out before the model is even called.
 */
export async function POST(request: NextRequest) {
    // Premium feature and a paid model call — enforced here, PremiumGate is UX only.
    let user;
    try {
        user = await requirePremiumUserSS();
    } catch (e) {
        const reason = e instanceof Error ? e.message : "UNAUTHENTICATED";
        return NextResponse.json({ error: reason }, { status: reason === "PREMIUM_REQUIRED" ? 402 : 401 });
    }

    const body = await request.json() as { conversationId?: string | null; message?: string | null; bibleId?: string | null; draft?: unknown };
    const locale = request.cookies.get("locale")?.value === "es" ? "es" : "en";

    // e2e tests and keyless local work use the scripted builder. Never in production.
    const fake = process.env.NODE_ENV !== "production" && request.cookies.get("study_builder_fake_ai")?.value === "1";
    const ai = fake ? new FakeStudyBuilderAI() : new OpenAIStudyBuilderAI();

    const events = studyBuilderTurn(
        {
            userId: user.id,
            locale,
            conversationId: body.conversationId ?? null,
            message: body.message ?? null,
            bibleId: body.bibleId ?? null,
            draft: body.draft,
        },
        new StudyBuilderPostgreSQLDao(),
        ai,
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const event of events) {
                    controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
                }
            } catch (e) {
                console.error("study builder turn failed", e);
                controller.enqueue(encoder.encode(JSON.stringify({ type: "error", error: "Something went wrong. Please try again." }) + "\n"));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
    });
}
