"use client";

import { Suspense, use } from "react";
import { AppShell } from "@/components/app";
import { PremiumGate } from "@/components/premium";
import { StudyBuilder } from "@/components/study/builder/StudyBuilder";

/**
 * A study is edited in the builder it was made in: by hand or with the AI, in
 * the same conversation, picking up where the reader left it.
 */
export default function EditStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell immersive>
      <PremiumGate>
        <Suspense>
          <StudyBuilder studyId={id} />
        </Suspense>
      </PremiumGate>
    </AppShell>
  );
}
