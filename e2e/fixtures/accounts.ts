import { randomBytes } from "node:crypto";
import { mergeTests, test as base } from "@playwright/test";
import { createClerkClient } from "@clerk/backend";
import { Pool } from "pg";
import { test as cockpitTest } from "@andresrub10/cockpit/e2e";
import { GlobalStudyDef, globalStudyStepInserts } from "../../src/app/common/study/model/globalStudy";
import type { StepContent } from "../../src/app/common/studyStep/model/StepContent";

/**
 * Test accounts for the signed-in tests: a Clerk user and its `user` row,
 * made for one test and deleted after it, with only the rows that test made.
 *
 * Premium comes from `lifetimePremium`, the comp flag, so no test touches
 * Stripe. `isAdmin` is set here, in the worktree's own database, because that
 * is the only way an admin exists: the app never writes the flag.
 */
export type TestAccount = { id: string; authId: string; email: string; username: string };

export const hasClerk = Boolean(process.env.CLERK_SECRET_KEY && process.env.DATABASE_URL);

let pool: Pool | null = null;
function db(): Pool {
	pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
	return pool;
}

class Accounts {
	private created: TestAccount[] = [];
	private clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

	async create(options: { admin?: boolean } = {}): Promise<TestAccount> {
		const suffix = randomBytes(4).toString("hex");
		const username = `e2e-reader-${suffix}`;
		// "+clerk_test" addresses are Clerk's test emails: no mail is ever sent.
		const email = `e2e-${suffix}+clerk_test@example.com`;

		const clerkUser = await this.clerk.users.createUser({
			emailAddress: [email],
			username,
			password: randomBytes(16).toString("hex"),
			firstName: "Test",
			lastName: "Reader",
			skipPasswordChecks: true,
		});

		const { rows } = await db().query<{ id: string }>(
			`INSERT INTO "user" (name, username, email, "authId", "isEmailVerified", "lifetimePremium", "lifetimePremiumGrantedAt", "isAdmin", "defaultBibleId")
			 VALUES ($1, $2, $3, $4, true, true, now(), $5, (SELECT id FROM bible WHERE slug = 'bsb-en'))
			 RETURNING id`,
			["Test Reader", username, email, clerkUser.id, options.admin ?? false],
		);
		const account = { id: rows[0].id, authId: clerkUser.id, email, username };
		this.created.push(account);
		return account;
	}

	/** A study the account designed itself, with the given steps (a passage first). */
	async createOwnStudy(account: TestAccount, name: string, steps: { title: string; content: StepContent }[]): Promise<string> {
		const { rows } = await db().query<{ id: string }>(
			`INSERT INTO study (name, description, topic, kind, language, "ownerId", "creatorId", "bibleId")
			 VALUES ($1, $2, $2, 'plan', 'en', $3, $3, (SELECT id FROM bible WHERE slug = 'bsb-en')) RETURNING id`,
			[name, `${name}, made by the e2e tests.`, account.id],
		);
		const studyId = rows[0].id;
		await db().query(
			`INSERT INTO study_step ("studyId", "stepNumber", kind, "stepType", title, explanation, "bookAbbreviation", "startChapter", "endChapter")
			 VALUES ($1, 1, 'scripture', 'SingleChapter', 'Psalm 23', 'The Lord is my shepherd.', 'PSA', 23, 23)`,
			[studyId],
		);
		for (const [index, step] of steps.entries()) {
			await db().query(
				`INSERT INTO study_step ("studyId", "stepNumber", kind, title, explanation, content) VALUES ($1, $2, $3, $4, '', $5)`,
				[studyId, index + 2, step.content.kind, step.title, JSON.stringify(step.content)],
			);
		}
		return studyId;
	}

	async cleanup() {
		for (const account of this.created) {
			const id = account.id;
			await db().query(`DELETE FROM note WHERE "ownerId" = $1`, [id]);
			await db().query(`DELETE FROM session WHERE "userId" = $1`, [id]);
			await db().query(`DELETE FROM study_step WHERE "studyId" IN (SELECT id FROM study WHERE "ownerId" = $1)`, [id]);
			await db().query(`DELETE FROM study WHERE "ownerId" = $1`, [id]);
			await db().query(`DELETE FROM media_source WHERE "addedById" = $1`, [id]);
			await db().query(`DELETE FROM user_daily_activity WHERE "userId" = $1`, [id]);
			await db().query(`DELETE FROM chapter_completion WHERE "userId" = $1`, [id]);
			await db().query(`DELETE FROM user_badge WHERE "userId" = $1`, [id]);
			await db().query(`DELETE FROM "user" WHERE id = $1`, [id]);
			await this.clerk.users.deleteUser(account.authId).catch(() => undefined);
		}
		this.created = [];
	}
}

/**
 * Makes sure a catalog study exists in this database, from its definition in
 * code, without touching it if it is already there (seeded, or by a parallel
 * test). The same rows `npm run seed:studies` writes.
 */
export async function ensureGlobalStudy(def: GlobalStudyDef): Promise<void> {
	const client = await db().connect();
	try {
		await client.query("BEGIN");
		const { rows } = await client.query<{ id: string }>(
			`INSERT INTO study (name, description, topic, depth, length, "sortOrder", kind, language, "isGlobal", slug)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
			 ON CONFLICT (slug) DO NOTHING RETURNING id`,
			[def.name, def.description, def.topic, def.depth, def.length, def.sortOrder, def.kind ?? "plan", def.language ?? "en", def.slug],
		);
		if (rows.length) {
			for (const step of globalStudyStepInserts(def)) {
				await client.query(
					`INSERT INTO study_step ("studyId", "stepNumber", kind, "stepType", title, explanation, content,
					   "bookAbbreviation", "startChapter", "endChapter", "startVerse", "endVerse")
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
					[rows[0].id, step.stepNumber, step.kind, step.stepType, step.title, step.explanation,
						step.content ? JSON.stringify(step.content) : null, step.bookAbbreviation, step.startChapter,
						step.endChapter, step.startVerse, step.endVerse],
				);
			}
		}
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

export const test = mergeTests(
	cockpitTest,
	base.extend<{ accounts: Accounts }>({
		accounts: async ({}, use) => {
			const accounts = new Accounts();
			await use(accounts);
			await accounts.cleanup();
		},
	}),
);
