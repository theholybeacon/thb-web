import { notFound } from "next/navigation";
import { CrashButton } from "./CrashButton";

/**
 * Dev-only page that crashes on purpose, to check the error fallbacks and
 * error reporting end to end (e2e/errors.spec.ts). Gone in production.
 *   /dev/crash?where=server  throws while rendering on the server
 *   /dev/crash               offers a button that crashes in the browser
 */
export default async function CrashPage({ searchParams }: { searchParams: Promise<{ where?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();

  const { where } = await searchParams;
  if (where === "server") throw new Error("Test crash while rendering on the server");

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <CrashButton />
    </main>
  );
}
