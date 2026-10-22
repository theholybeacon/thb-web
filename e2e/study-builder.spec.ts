import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { signInAsPremiumReader } from "./flows/account";

/**
 * The builder's AI is the scripted one here (the `study_builder_fake_ai`
 * cookie, honoured outside production only): the test checks the
 * conversation, the memory and the plan, never a paid model.
 */
test(
	"Build a study by talking with the AI",
	{
		annotation: covers(
			"src/app/(app)/study/create/**",
			"src/components/study/builder/**",
			"src/app/common/studyBuilder/**",
			"src/app/api/study/builder/**",
		),
	},
	async ({ page, baseURL }) => {
		test.setTimeout(120_000);
		const reader = await signInAsPremiumReader(page, "study-builder", "Ruth Tester");

		await step(
			"Give Ruth a history in the app",
			"Starts Ruth from a clean slate for this test (no builder conversations, memories or studies from earlier runs), then gives her what a real reader leaves behind: three chapters read, most of them in Romans, and a note on Romans 8:28 about worry.",
			async () => {
				const { db, userId } = reader;
				await db.query(`DELETE FROM "study_builder_conversation" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_builder_memory" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_step" WHERE "studyId" IN (SELECT "id" FROM "study" WHERE "ownerId" = $1)`, [userId]);
				await db.query(`DELETE FROM "study" WHERE "ownerId" = $1`, [userId]);
				await db.query(`DELETE FROM "chapter_completion" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "note" WHERE "ownerId" = $1`, [userId]);
				await db.query(
					`INSERT INTO "chapter_completion" ("userId", "bookAbbreviation", "chapter", "mode", "completedDate")
					 VALUES ($1, 'ROM', 8, 'read', CURRENT_DATE), ($1, 'ROM', 12, 'read', CURRENT_DATE), ($1, 'PSA', 23, 'listen', CURRENT_DATE)`,
					[userId],
				);
				await db.query(
					`INSERT INTO "note" ("ownerId", "targetType", "bibleId", "bookAbbreviation", "chapter", "verse", "reference", "title", "content")
					 SELECT $1, 'verse', "id", 'ROM', 8, 28, 'Romans 8:28', 'Worry', 'I keep coming back to this verse when I am anxious.'
					 FROM "bible" ORDER BY ("slug" = 'bsb-en') DESC LIMIT 1`,
					[userId],
				);
				await page.context().addCookies([{ name: "study_builder_fake_ai", value: "1", url: baseURL! }]);
			},
		);

		await step("Open the study builder", "Studies are created at /study/create, which is now a conversation instead of a form: the chat on the left, the plan on the right.", async () => {
			await page.goto("/study/create");
			// The first visit in a fresh dev server compiles the page and its server actions.
			await expect(page.getByTestId("builder-chat")).toBeVisible({ timeout: 90_000 });
		});

		const firstReply = page.getByTestId("builder-assistant-message").first();
		await step(
			"The builder speaks first, and knows her",
			'Before Ruth types anything, the builder greets her by name and brings up what it knows: she has been reading Romans and wrote a note on Romans 8:28 about "Worry". Above the chat, "Drawing on" lists the sources it used.',
			async () => {
				await expect(firstReply).toContainText("Hi Ruth!");
				await expect(firstReply).toContainText("Romans");
				await expect(firstReply).toContainText("Romans 8:28");
				await expect(page.getByTestId("builder-knowledge")).toContainText("3 chapters read · most in Romans");
				await expect(page.getByTestId("builder-knowledge")).toContainText("1 note");
				await expect(page.getByTestId("builder-plan-empty")).toBeVisible();
			},
			{ target: firstReply },
		);

		const anxiety = page.getByTestId("builder-quick-replies").getByRole("button", { name: "I'm struggling with anxiety" });
		await step(
			"Answer with a quick reply",
			'Ruth taps "I\'m struggling with anxiety", one of the answers the builder suggested. The builder replies and drafts a first plan on the right: four readings on peace. Under its reply, it notes what it will remember about her.',
			async () => {
				await anxiety.click();
				await expect(page.getByTestId("builder-plan-name")).toHaveText("Peace in Anxious Times");
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(4);
				await expect(page.getByTestId("builder-assistant-message").last()).toContainText("Remembered: Ruth is going through a season of anxiety.");
			},
			{ target: anxiety },
		);

		const box = page.getByRole("textbox", { name: /Tell me what's on your heart/ });
		await step(
			"Ask for a change in her own words",
			'Ruth types "Can you make it shorter?" and presses Enter. The builder trims the plan to three readings and says so; the plan panel rebuilds with the change.',
			async () => {
				await box.fill("Can you make it shorter?");
				await box.press("Enter");
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(3);
				await expect(page.getByTestId("builder-plan-count")).toHaveText("3 readings");
			},
			{ target: box },
		);

		const memory = page.getByTestId("builder-memory-button");
		await step(
			"See what the builder remembers",
			"The memory chip opens what the builder has learned about Ruth in this conversation. It starts every later conversation from these, and she can make it forget any of them.",
			async () => {
				await memory.click();
				await expect(page.getByTestId("builder-memory-list")).toContainText("Ruth is going through a season of anxiety.");
				await expect(page.getByTestId("builder-memory-list")).toContainText("Ruth prefers short reading plans.");
				// Let the popover finish fading in, so the screenshot shows it plainly.
				await expect(page.locator("[data-radix-popper-content-wrapper] > div")).toHaveCSS("opacity", "1");
			},
			{ target: memory },
		);

		const create = page.getByRole("button", { name: "Create this study" });
		await step(
			"Create the study",
			'Closes the memory list and presses "Create this study" under the plan, in the translation picked for her. The plan becomes one of her studies and its page opens.',
			async () => {
				await page.keyboard.press("Escape");
				await create.click();
				await page.waitForURL(/\/study\/[0-9a-f-]{36}$/);
			},
			{ target: create },
		);

		await show(
			"Her new study",
			'The study page shows the plan the conversation produced: "Peace in Anxious Times", ready to start.',
			async () => {
				await expect(page.getByRole("heading", { name: "Study Details" })).toBeVisible();
				await expect(page.getByLabel("Name")).toHaveValue("Peace in Anxious Times");
			},
		);
	},
);
