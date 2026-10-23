"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/app";
import { PremiumGate } from "@/components/premium";
import { StudyBuilder } from "@/components/study/builder/StudyBuilder";

/**
 * Studies are built with the AI, in conversation — it draws on everything the
 * app knows about the reader and assembles the plan as they talk — or by hand,
 * passage by passage (src/components/study/builder).
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
