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

/**
 * A free reader: no subscription and no lifetime premium.
 *  - "new": a first sign-in. The Clerk account exists but the app has no row
 *    for it yet, so the app creates one, as it does for anyone who just signed up.
 *  - "returning": a reader who already used the app, free, before the welcome
 *    week existed, with one study of their own (and, like every reader from
 *    before /welcome, marked as through it).
 * Either way the reader has never had the welcome week. The flow ends on
 * /home, where every sign-in lands.
 */
export const signInAsFreeReader = flow(
	"Sign in as a free reader",
	"Signs in a test reader who is not premium, the way someone without a subscription arrives at the app.",
	async (page: Page, slug: string, name: string, kind: "new" | "returning"): Promise<TestReader> => {
		const email = `e2e-${slug}+clerk_test@theholybeacon.com`;
		const username = `e2e_${slug.replace(/\W/g, "_")}`;
		const db = database();
		const authId = await step(
			"Prepare the test reader",
			kind === "new"
				? `A Clerk dev account for ${name} with no row in this worktree's database yet (any left by an earlier run is deleted), so signing in is their first time in the app.`
				: `${name}'s account in Clerk and in this worktree's database: free, never given the welcome week, and with one study of their own from before.`,
			async () => {
				const authId = await ensureClerkUser(email, username, name);
				await deleteReaderRow(db, email);
				if (kind === "returning") {
					const { rows } = await db.query<{ id: string }>(
						`INSERT INTO "user" ("name", "username", "email", "authId", "isEmailVerified", "onboardedAt") VALUES ($1, $2, $3, $4, true, now()) RETURNING "id"`,
						[name, username, email, authId],
					);
					await db.query(
						`INSERT INTO study (name, description, topic, kind, language, "ownerId", "creatorId", "bibleId")
						 VALUES ('Psalms of comfort', 'A study made before the welcome week.', 'comfort', 'plan', 'en', $1, $1, (SELECT id FROM bible WHERE slug = 'bsb-en'))`,
						[rows[0].id],
					);
				}
				return authId;
			},
		);

		await step("Open the app", "Clerk loads on the public home page; sign-in starts from there.", () => page.goto("/"));
		await step("Sign in", `Signs ${name} in through Clerk with a one-time sign-in token: no password involved. The app then finds or creates their account.`, async () => {
			await clerk.signIn({ page, emailAddress: email });
			await expect.poll(() => page.evaluate(() => Boolean(window.Clerk?.user))).toBe(true);
			// The app has loaded the reader once it has cached their account.
			await expect.poll(() => page.evaluate(() => localStorage.getItem("user")), { timeout: 30_000 }).not.toBeNull();
		});
		const { rows } = await db.query<{ id: string }>(`SELECT "id" FROM "user" WHERE "authId" = $1`, [authId]);

		await step("Go to the app", "Every sign-in ends on /home, the start of the signed-in app.", () => page.goto("/home"));
		return { email, name, userId: rows[0].id, db };
	},
	{ covers: ["src/app/state/LoggedUserContext.tsx", "src/middleware.ts"] },
);

/** Deletes a test reader's row and what hangs off it, so their next sign-in is their first. */
async function deleteReaderRow(db: Pool, email: string): Promise<void> {
	const { rows } = await db.query<{ id: string }>(`SELECT "id" FROM "user" WHERE "email" = $1`, [email]);
	const userId = rows[0]?.id;
	if (!userId) return;
	await db.query(`DELETE FROM session WHERE "userId" = $1`, [userId]);
	await db.query(`DELETE FROM study_step WHERE "studyId" IN (SELECT id FROM study WHERE "ownerId" = $1)`, [userId]);
	await db.query(`DELETE FROM study WHERE "ownerId" = $1`, [userId]);
	await db.query(`DELETE FROM user_daily_activity WHERE "userId" = $1`, [userId]);
	await db.query(`DELETE FROM email_send_log WHERE "userId" = $1`, [userId]);
	await db.query(`DELETE FROM "user" WHERE "id" = $1`, [userId]);
}
