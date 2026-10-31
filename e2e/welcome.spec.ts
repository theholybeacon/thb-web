import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import type { Page } from "@playwright/test";
import { signInAsPremiumReader } from "./flows/account";

/** Each /welcome step rises in with GSAP; its last piece fully shown means the screenshot shows it settled. */
const settled = (page: Page) => expect(page.locator("[data-step] [data-rise]").last()).toHaveCSS("opacity", "1");

/**
 * A new reader's first visit: the questions at /welcome, then their first
 * study already proposed by the study builder. The builder's AI is the
 * scripted one (the `study_builder_fake_ai` cookie, honoured outside
 * production only), so the plan it proposes is known.
 */
test(
	"A new reader answers four questions and their first study is waiting",
	{
		annotation: covers(
			"src/app/(app)/welcome/**",
			"src/components/welcome/**",
			"src/app/(app)/home/**",
			"src/app/common/user/model/ReaderStart.ts",
			"src/app/common/user/service/server/userSetReaderStartSS.ts",
			"src/app/common/studyBuilder/**",
			"src/components/study/builder/**",
		),
	},
	async ({ page, baseURL }) => {
		test.setTimeout(150_000);
		// Premium stands in for the welcome week a new reader gets: the study builder is a premium feature.
		const reader = await signInAsPremiumReader(page, "welcome", "Ana Newcomer");

		await step(
			"Make Ana brand new",
			"Clears what earlier runs left for this test reader (answers, builder conversations, memories, studies) and marks her as not through /welcome yet, exactly like a reader who has just signed up.",
			async () => {
				const { db, userId } = reader;
				await db.query(`UPDATE "user" SET "readerStart" = NULL, "onboardedAt" = NULL WHERE "id" = $1`, [userId]);
				await db.query(`DELETE FROM "study_builder_conversation" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_builder_memory" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_step" WHERE "studyId" IN (SELECT "id" FROM "study" WHERE "ownerId" = $1)`, [userId]);
				await db.query(`DELETE FROM "study" WHERE "ownerId" = $1`, [userId]);
				await page.context().addCookies([{ name: "study_builder_fake_ai", value: "1", url: baseURL! }]);
				// The signed-in app caches the user in the browser; start from what the database says.
				await page.evaluate(() => localStorage.removeItem("user"));
			},
		);

		await step(
			"Open the app",
			"Ana goes to /home, where every sign-in lands. She has not been through the questions yet, so the app sends her to /welcome instead.",
			async () => {
				await page.goto("/home");
				await page.waitForURL("**/welcome", { timeout: 90_000 });
			},
		);

		const begin = page.getByRole("button", { name: "Begin" });
		await step(
			"The welcome",
			'Her first screen greets her by name, "Welcome, Ana.", and says what comes next: four questions, then her first study. Behind it, a beacon of light that grows as she answers.',
			async () => {
				await expect(page.getByRole("heading", { name: "Welcome, Ana." })).toBeVisible();
				await expect(begin).toBeVisible();
				await settled(page);
			},
			{ target: begin },
		);

		const newToMe = page.getByRole("button", { name: /It's new to me/ });
		await step("Begin, and say how well she knows the Bible", 'Ana presses "Begin" and answers the first question, "How well do you know the Bible?", with "It\'s new to me". Choosing an answer moves on by itself.', async () => {
			await begin.click();
			await expect(page.getByRole("heading", { name: "How well do you know the Bible?" })).toBeVisible();
			await newToMe.click();
			await expect(page.getByRole("heading", { name: "How deep do you want to go?" })).toBeVisible();
			await settled(page);
		}, { target: newToMe });

		const light = page.getByRole("button", { name: /A passage and a thought/ });
		await step("Say how deep she wants to go", 'She picks "A passage and a thought": read, and take one thing with her.', async () => {
			await light.click();
			await expect(page.getByRole("heading", { name: "What do you want to understand?" })).toBeVisible();
			await settled(page);
		}, { target: light });

		const jesus = page.getByRole("button", { name: "Who Jesus is" });
		const note = page.getByLabel("In your own words (optional)");
		await step(
			"Say what she wants to understand",
			'She picks "Who Jesus is" and adds, in her own words, "A friend invited me to church and I want to know who Jesus is." Several topics can be picked; this one is enough.',
			async () => {
				await jesus.click();
				await expect(jesus).toHaveAttribute("aria-pressed", "true");
				await note.fill("A friend invited me to church and I want to know who Jesus is.");
			},
			{ target: jesus },
		);

		const minutes = page.getByRole("button", { name: /A few minutes/ });
		await step(
			"Say how much time she has",
			'"Continue" leads to the last question. She has "A few minutes" a day. Her answers are saved and the study builder opens.',
			async () => {
				await page.getByRole("button", { name: "Continue" }).click();
				await expect(page.getByRole("heading", { name: "How much time do you have?" })).toBeVisible();
				await minutes.click();
				await page.waitForURL("**/study/create", { timeout: 60_000 });
			},
			{ target: minutes },
		);

		const firstReply = page.getByTestId("builder-assistant-message").first();
		await step(
			"Her first study is already proposed",
			'Before Ana types anything, the builder welcomes her and recommends a first study from her answers: the Gospel of Mark, because she wants to know who Jesus is and the Bible is new to her. The plan is already on the right, "Meeting Jesus in Mark", five readings. Above the chat, "Where you\'re starting" shows it is drawing on her answers.',
			async () => {
				await expect(firstReply).toContainText("Welcome, Ana!", { timeout: 90_000 });
				await expect(firstReply).toContainText("who Jesus is");
				await expect(page.getByTestId("builder-plan-name")).toHaveText("Meeting Jesus in Mark");
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(5);
				await expect(page.getByTestId("builder-start-chip")).toHaveText("Where you're starting");
			},
			{ target: firstReply },
		);

		const shorter = page.getByTestId("builder-quick-replies").getByRole("button", { name: "Make it shorter" });
		await step(
			"Talk back to it",
			'Ana taps "Make it shorter", one of the answers the builder suggests. It replies and trims the plan to three readings: the conversation shapes the plan from here on.',
			async () => {
				await shorter.click();
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(3);
			},
			{ target: shorter },
		);

		await show(
			"Her answers are kept",
			"The plan now has three readings, ready to become her first study. Her four answers are saved on her account, so every later conversation with the builder starts from them too; the \"Where you're starting\" chip opens them again to change.",
			async () => {
				await expect(page.getByTestId("builder-plan-count")).toHaveText("3 readings");
				const { rows } = await reader.db.query<{ readerStart: Record<string, unknown> | null; onboardedAt: Date | null }>(
					`SELECT "readerStart", "onboardedAt" FROM "user" WHERE "id" = $1`,
					[reader.userId],
				);
				expect(rows[0].onboardedAt).not.toBeNull();
				expect(rows[0].readerStart).toMatchObject({ familiarity: "new", depth: "light", interests: ["jesus"], time: "minutes" });
			},
		);
	},
);

test(
	"The landing page shows how a reader starts",
	{ annotation: covers("src/app/page.tsx", "src/app/components/HeroSection.tsx", "src/app/components/StartSection.tsx") },
	async ({ page }) => {
		await step("Open the landing page", "The public page at /, signed out. The hero comes in with its GSAP entrance.", async () => {
			await page.goto("/");
			await expect(page.getByRole("heading", { level: 1, name: /Study the Bible/ })).toBeVisible({ timeout: 90_000 });
			// The entrance has played: the beacon, which comes in last, is fully shown.
			await expect(page.locator("[data-hero='chip']").last()).toHaveCSS("opacity", "1");
		});

		const section = page.locator("#start");
		await step("Scroll to how you start", 'Right under the hero, "Start where you are". Scrolling it into view plays its steps and a sample first conversation in.', async () => {
			await section.scrollIntoViewIfNeeded();
		}, { target: section });

		await show(
			"How a reader starts",
			'Three steps: tell us where you are, your first study already proposed, shape it together. Beside them, a first conversation as it opens, with "Meeting Jesus in Mark" and its readings.',
			async () => {
				await expect(section.getByRole("heading", { name: "Start where you are" })).toBeVisible();
				await expect(section.getByText("Your first study, already proposed")).toBeVisible();
				await expect(section.getByText("Meeting Jesus in Mark")).toBeVisible();
				// The timeline has played: its last pieces are fully shown.
				await expect(section.getByText("This looks good")).toHaveCSS("opacity", "1");
			},
		);
	},
);
