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
				await expect(page.getByTestId("study-name")).toHaveText("Peace in Anxious Times");
			},
		);
	},
);

test(
	"Put a study together by hand, then edit it with the AI where you left off",
	{
		annotation: covers(
			"src/app/(app)/study/create/**",
			"src/app/(app)/study/[id]/**",
			"src/components/study/builder/**",
			"src/app/common/studyBuilder/**",
			"src/app/api/study/builder/**",
		),
	},
	async ({ page, baseURL }) => {
		test.setTimeout(150_000);
		const reader = await signInAsPremiumReader(page, "study-builder-manual", "Caleb Tester");

		await step(
			"Start Caleb from a clean slate",
			"Removes what earlier runs left for Caleb (builder conversations, memories, studies and their sessions), and has the builder use its scripted AI.",
			async () => {
				const { db, userId } = reader;
				await db.query(`DELETE FROM "study_builder_conversation" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_builder_memory" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "session" WHERE "userId" = $1`, [userId]);
				await db.query(`DELETE FROM "study_step" WHERE "studyId" IN (SELECT "id" FROM "study" WHERE "ownerId" = $1)`, [userId]);
				await db.query(`DELETE FROM "study" WHERE "ownerId" = $1`, [userId]);
				await page.context().addCookies([{ name: "study_builder_fake_ai", value: "1", url: baseURL! }]);
			},
		);

		const byHand = page.getByRole("tab", { name: "By hand" });
		await step(
			"Switch the builder to “By hand”",
			"The builder opens with the AI, which greets Caleb. The switch at the top turns it into a manual builder: a passage finder on the left, the plan as an editor on the right. Both modes work on the same plan, in the same conversation.",
			async () => {
				await page.goto("/study/create");
				await expect(page.getByTestId("builder-chat")).toBeVisible({ timeout: 90_000 });
				await expect(page.getByTestId("builder-assistant-message").first()).toContainText("Hi Caleb!");
				await byHand.click();
				await expect(page.getByTestId("builder-finder")).toBeVisible();
				await expect(page.getByTestId("builder-editor-empty")).toBeVisible();
			},
			{ target: byHand },
		);

		// New and moved readings fade in, and "Added …" unfolds: screenshots wait for them to settle.
		const settled = async ({ justAdded = true } = {}) => {
			if (justAdded) await expect(page.getByTestId("builder-finder-added")).toHaveCSS("opacity", "1");
			for (const reading of await page.getByTestId("builder-plan-step").all()) await expect(reading).toHaveCSS("opacity", "1");
		};

		const search = page.getByRole("textbox", { name: "Find a passage" });
		await step(
			"Add a passage by typing it",
			'Caleb types "John 3:16" in the finder. It reads the reference and offers to add it; one click puts it in the plan.',
			async () => {
				await search.fill("John 3:16");
				await page.getByTestId("builder-finder-add-typed").click();
				await expect(page.getByTestId("builder-finder-added")).toContainText("Added John 3:16");
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(1);
				await settled();
			},
			{ target: search },
		);

		const romansFive = page.getByTestId("builder-finder-book").getByRole("button", { name: "5", exact: true });
		await step(
			"Browse to a book and pick a range of chapters",
			"He opens Romans from the book list, taps chapter 5 and then chapter 8: the finder selects chapters 5 to 8 and adds them as one reading.",
			async () => {
				await page.getByTestId("builder-finder").getByRole("button", { name: "Romans", exact: true }).click();
				await romansFive.click();
				await page.getByTestId("builder-finder-book").getByRole("button", { name: "8", exact: true }).click();
				await expect(page.getByTestId("builder-finder-add")).toHaveText("Add Romans 5-8");
				await page.getByTestId("builder-finder-add").click();
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(2);
				await settled();
			},
			{ target: romansFive },
		);

		const name = page.getByRole("textbox", { name: "Study name" });
		await step(
			"Name the plan and put Romans first",
			'He names the plan "Grace Upon Grace" and moves Romans 5-8 above John 3:16.',
			async () => {
				await name.fill("Grace Upon Grace");
				await page.getByTestId("builder-plan-step").nth(1).getByRole("button", { name: "Move up" }).click();
				await expect(page.getByTestId("builder-plan-step").first()).toContainText("Romans 5-8");
				await expect(page.getByTestId("builder-plan-step").last()).toContainText("John 3:16");
				await settled({ justAdded: false });
			},
			{ target: name },
		);

		const create = page.getByRole("button", { name: "Create this study" });
		let studyId = "";
		await step("Create the study", "The hand-made plan becomes one of his studies, and its page opens.", async () => {
			await create.click();
			await page.waitForURL(/\/study\/[0-9a-f-]{36}$/);
			studyId = page.url().split("/").pop()!;
			await expect(page.getByTestId("study-name")).toHaveText("Grace Upon Grace");
		}, { target: create });

		let sessionStepId = "";
		await step(
			"Caleb starts reading it",
			"Gives Caleb a reading session on the study's first reading (Romans 5-8), as if he had pressed Start Session: editing must not take his place away.",
			async () => {
				const { rows } = await reader.db.query<{ id: string }>(
					`INSERT INTO "session" ("userId", "studyId", "currentStepId", "currentBookAbbreviation", "currentChapter")
					 SELECT $1, $2, "id", 'ROM', 5 FROM "study_step" WHERE "studyId" = $2 AND "stepNumber" = 1
					 RETURNING "currentStepId" AS "id"`,
					[reader.userId, studyId],
				);
				sessionStepId = rows[0].id;
			},
		);

		const edit = page.getByRole("link", { name: "Edit Study" });
		await step(
			"Edit the study",
			'"Edit Study" opens the same builder on this study, still by hand, as he left it: both readings, and a note that the plan matches the saved study.',
			async () => {
				await edit.click();
				await page.waitForURL(/\/edit$/);
				await expect(page.getByRole("heading", { name: "Edit your study" })).toBeVisible({ timeout: 60_000 });
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(2);
				await expect(page.getByTestId("builder-save-state")).toHaveText("Matches your study");
			},
			{ target: edit },
		);

		const withAi = page.getByRole("tab", { name: "With AI" });
		await step(
			"Switch to the AI: the same conversation, where he left it",
			"Back on “With AI”, the chat is the conversation this study was built in, with the AI's greeting from before. Caleb asks it to add a psalm at the end; the AI works on his hand-made plan and adds Psalm 46. The plan now has unsaved changes.",
			async () => {
				await withAi.click();
				await expect(page.getByTestId("builder-assistant-message").first()).toContainText("Hi Caleb!");
				const box = page.getByRole("textbox", { name: /Tell me what's on your heart/ });
				await box.fill("Please add a psalm at the end");
				await box.press("Enter");
				await expect(page.getByTestId("builder-plan-step")).toHaveCount(3);
				await expect(page.getByTestId("builder-plan-step").first()).toContainText("Romans 5-8");
				await expect(page.getByTestId("builder-plan-step").last()).toContainText("Psalms 46");
				await expect(page.getByTestId("builder-save-state")).toHaveText("Unsaved changes");
			},
			{ target: withAi },
		);

		const save = page.getByRole("button", { name: "Save changes" });
		await step("Save the changes", "Saves the edited plan over the study and goes back to its page.", async () => {
			await save.click();
			await page.waitForURL(new RegExp(`/study/${studyId}$`));
		}, { target: save });

		await show(
			"The study, edited, with his place kept",
			'The study now has three readings, ending with "Be Still" (Psalm 46). Caleb\'s session still stands on Romans 5-8: the readings he kept kept their place.',
			async () => {
				await expect(page.getByTestId("study-name")).toHaveText("Grace Upon Grace");
				await expect(page.getByText("Step 3: Be Still")).toBeVisible();
				const { rows } = await reader.db.query<{ currentStepId: string }>(`SELECT "currentStepId" FROM "session" WHERE "studyId" = $1`, [studyId]);
				expect(rows.map((r) => r.currentStepId)).toEqual([sessionStepId]);
			},
		);
	},
);
