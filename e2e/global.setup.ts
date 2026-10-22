import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Signed-in tests sign in with Clerk's testing token, which this fetches once
 * per run. Without Clerk keys (a signed-out-only environment) there is nothing
 * to set up, and the signed-in tests skip themselves (see fixtures/accounts.ts).
 */
export default async function globalSetup() {
	if (!process.env.CLERK_SECRET_KEY) return;
	await clerkSetup();
}
