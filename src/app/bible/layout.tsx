import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app";
import { BibleHeader } from "./components/BibleHeader";

/**
 * The Bible tree is public, but signed-in users should not lose the app when
 * they wander into it — so the chrome branches on the session.
 *
 * The branch is resolved on the server so the correct header is in the first
 * paint. Clerk's <SignedIn>/<SignedOut> would render nothing until hydration,
 * flashing the signed-out header at logged-in users on every load. This costs
 * nothing on the SEO-critical routes: the chapter and character pages already
 * await auth() via isPremiumUserSS().
 */
export default async function BibleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-background [--thb-header-h:3.5rem]">
        <BibleHeader />
        {children}
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
