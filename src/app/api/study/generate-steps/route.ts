export const runtime = 'edge';

import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { StudyInsert } from "@/app/common/study/model/Study";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { studyInsert, bibleId } = await request.json() as {
        studyInsert: StudyInsert;
        bibleId: string;
    };

    const bibleRepository = new BibleRepository();
    const bible = await bibleRepository.getById(bibleId);

    if (!bible) {
        return NextResponse.json({ error: "Bible not found" }, { status: 404 });
    }

    const aiRepository = new AIRepository();
    const steps = await aiRepository.studyStepsCreate(studyInsert, bible);

    return NextResponse.json(steps);
}
