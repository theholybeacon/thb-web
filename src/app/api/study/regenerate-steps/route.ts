export const runtime = 'edge';

import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { StudyRepository } from "@/app/common/study/repository/StudyRepository";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { studyId } = await request.json() as { studyId: string };

    const studyRepository = new StudyRepository();
    const study = await studyRepository.getById(studyId);

    if (!study) {
        return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    if (!study.bibleId) {
        return NextResponse.json({ error: "Study has no Bible translation selected" }, { status: 400 });
    }

    const bibleRepository = new BibleRepository();
    const bible = await bibleRepository.getById(study.bibleId);

    if (!bible) {
        return NextResponse.json({ error: "Bible translation not found" }, { status: 404 });
    }

    const aiRepository = new AIRepository();
    const steps = await aiRepository.studyStepsCreate(
        {
            name: study.name,
            description: study.description,
            depth: study.depth,
            length: study.length,
            topic: study.topic,
            ownerId: study.ownerId,
        },
        bible
    );

    return NextResponse.json(steps);
}
