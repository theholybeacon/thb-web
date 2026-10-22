"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/app";
import { PremiumGate } from "@/components/premium";
import { StudyBuilder } from "@/components/study/builder/StudyBuilder";

/**
 * Studies are built in conversation now: the builder talks with the reader,
 * drawing on everything the app knows about them, and assembles the plan as
 * they go (src/components/study/builder).
 */
export default function CreateStudyPage() {
  return (
    <AppShell>
      <PremiumGate>
        <Suspense>
          <StudyBuilder />
        </Suspense>
      </PremiumGate>
    </AppShell>
  );
}
