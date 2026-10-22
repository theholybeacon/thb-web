import type { Page } from "@playwright/test";
import { createClerkClient } from "@clerk/backend";
import { clerk } from "@clerk/testing/playwright";
import { Pool } from "pg";
import { expect, flow, step } from "@andresrub10/cockpit/e2e";

/**
 * Signed-in test readers. Each is a user of the Clerk DEV instance (created
 * on first use; "+clerk_test" marks it as a test address there) and a row in
 * this worktree's database with lifetime premium, so premium pages open
 * without Stripe. Each test gets its own reader, so tests never share data.
 */
export type TestReader = { email: string; name: string; userId: string; db: Pool };

let pool: Pool | null = null;
function database(): Pool {
	if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set: run the e2e tests with `npx cockpit e2e test`.");
	pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
	return pool;
}

async function ensureClerkUser(email: string, username: string, name: string): Promise<string> {
	const secretKey = process.env.CLERK_SECRET_KEY;
	if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set: signed-in tests need the Clerk dev keys.");
	if (!secretKey.startsWith("sk_test_")) throw new Error("Refusing to create test users outside the Clerk dev instance.");
	const clerkApi = createClerkClient({ secretKey });
	const existing = await clerkApi.users.getUserList({ emailAddress: [email] });
	if (existing.data[0]) return existing.data[0].id;
	const [firstName, ...rest] = name.split(" ");
	const created = await clerkApi.users.createUser({
		emailAddress: [email],
		username,
		firstName,
		lastName: rest.join(" ") || undefined,
		skipPasswordRequirement: true,
	});
	return created.id;
}

/** `slug` names the reader after its test ("study-builder"), which keeps them apart. */
export const signInAsPremiumReader = flow(
	"Sign in as a premium reader",
	"Signs in a test reader with lifetime premium, the way a subscriber arrives at the app.",
	async (page: Page, slug: string, name: string): Promise<TestReader> => {
		const email = `e2e-${slug}+clerk_test@theholybeacon.com`;
		const reader = await step(
			"Prepare the test reader",
			`The test account for this test (${name}), in the Clerk dev instance and in this worktree's database, with lifetime premium so the premium pages open.`,
			async () => {
				const username = `e2e_${slug.replace(/\W/g, "_")}`;
				const authId = await ensureClerkUser(email, username, name);
				const db = database();
				const { rows } = await db.query<{ id: string }>(
					`INSERT INTO "user" ("name", "username", "email", "authId", "isEmailVerified", "lifetimePremium")
					 VALUES ($1, $2, $3, $4, true, true)
					 ON CONFLICT ("email") DO UPDATE SET "authId" = EXCLUDED."authId", "name" = EXCLUDED."name", "lifetimePremium" = true
					 RETURNING "id"`,
					[name, username, email, authId],
				);
				return { email, name, userId: rows[0].id, db };
			},
		);

		await step("Open the app", "Clerk loads on the public home page; sign-in starts from there.", () => page.goto("/"));
		await step("Sign in", `Signs ${name} in through Clerk with a one-time sign-in token: no password involved.`, async () => {
			await clerk.signIn({ page, emailAddress: email });
			await expect.poll(() => page.evaluate(() => Boolean(window.Clerk?.user))).toBe(true);
		});
		return reader;
	},
	{ covers: ["src/app/state/LoggedUserContext.tsx", "src/components/premium/**", "src/middleware.ts"] },
);
