import { Suspense } from "react";
import { WelcomeFlow } from "@/components/welcome/WelcomeFlow";

/**
 * A new reader's first stop after signing up: where they are with the Bible,
 * then their first study (src/components/welcome). /home sends anyone who has
 * not been through it here.
 */
export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeFlow />
    </Suspense>
  );
}
