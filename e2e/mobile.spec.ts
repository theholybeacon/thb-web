import type { Locator, Page } from "@playwright/test";
import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { signInAsPremiumReader } from "./flows/account";
import { switchMode } from "./flows/reader";

/** A phone: an iPhone 13's screen, touch, and the mobile layout. */
const PHONE = { width: 390, height: 844 };
test.use({ viewport: PHONE, isMobile: true, hasTouch: true });

/** Whether the document itself can scroll — on an immersive screen it must not. */
const pageScrolls = (page: Page) =>
	page.evaluate(() => (document.scrollingElement?.scrollHeight ?? 0) > window.innerHeight + 1);

/** The share of the screen's height a pane takes. */
const screenShare = async (pane: Locator) => ((await pane.boundingBox())?.height ?? 0) / PHONE.height;

/**
 * The builder's AI is the scripted one (the `study_builder_fake_ai` cookie,
 * honoured outside production only), as in study-builder.spec.ts.
 */
test(
	"On a phone, the chat and the reading engine get the screen",
	{
		annotation: covers(
			"src/components/app/AppShell.tsx",
			"src/components/app/useImmersiveViewport.ts",
			"src/components/study/builder/**",
			"src/app/(app)/session/?id?/components/session-view/SessionView.tsx",
			"src/app/(app)/session/?id?/components/modes/TypeMode.tsx",
			"src/app/common/verse/model/typingInput.ts",
			"src/components/reader/ReaderEngine.tsx",
		),
	},
	async ({ page, baseURL }) => {
		test.setTimeout(150_000);
		const reader = await signInAsPremiumReader(page, "mobile-immersive", "Lydia Tester");

		await step(
			"Start Lydia from a clean slate",
			"Removes what earlier runs left for Lydia (builder conversations, memories, studies and their sessions), and has the builder use its scripted AI.",
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

		const chat = page.getByTestId("builder-chat");
		const pill = page.getByTestId("builder-plan-pill");
		await step(
			"Open the study builder on a phone",
			"On a phone the builder is all conversation: a slim app bar, one row of controls (back, With AI / By hand, conversations, start over) and the chat filling the rest of the screen. The plan is not a column under the chat any more but a pill floating above the message box.",
			async () => {
				await page.goto("/study/create");
				// The first visit in a fresh dev server compiles the page and its server actions.
				await expect(chat).toBeVisible({ timeout: 90_000 });
				await expect(page.getByTestId("builder-assistant-message").first()).toContainText("Hi Lydia!");
				await expect(pill).toBeVisible();
				await expect(page.getByTestId("builder-plan-empty")).toHaveCount(0);
				expect(await pageScrolls(page)).toBe(false);
				expect(await screenShare(chat)).toBeGreaterThan(0.55);
			},
			{ target: chat },
		);

		const anxiety = page.getByTestId("builder-quick-replies").getByRole("button", { name: "I'm struggling with anxiety" });
		await step(
			"Answer, and the plan takes shape in the pill",
			'Lydia taps "I\'m struggling with anxiety". The builder drafts a plan, and the pill now carries its name and its four readings, without the plan taking any of the conversation\'s room.',
			async () => {
				await anxiety.click();
				await expect(pill).toContainText("Peace in Anxious Times");
				await expect(pill).toContainText("4");
				expect(await pageScrolls(page)).toBe(false);
			},
			{ target: anxiety },
		);

		const sheet = page.getByTestId("builder-plan-sheet");
		await step(
			"Open the plan",
			"Tapping the pill slides the plan up as a sheet over the conversation: its readings and the button that creates the study.",
			async () => {
				await pill.click();
				await expect(sheet.getByTestId("builder-plan-name")).toHaveText("Peace in Anxious Times");
				await expect(sheet.getByTestId("builder-plan-step")).toHaveCount(4);
				// Let the sheet finish sliding in, so the screenshot shows it in place.
				await expect(sheet).toHaveCSS("transform", "none");
			},
			{ target: pill },
		);

		const create = sheet.getByRole("button", { name: "Create this study" });
		await step("Create the study", 'Lydia presses "Create this study" in the sheet; the study page opens.', async () => {
			await create.click();
			await page.waitForURL(/\/study\/[0-9a-f-]{36}$/);
		}, { target: create });

		const start = page.getByRole("button", { name: "Start Session" });
		await step("Start it", "The play button on the study page starts a session on its first reading.", async () => {
			await start.click();
			await page.waitForURL(/\/session\/[0-9a-f-]{36}$/);
			await expect(page.locator(".bible-text").first()).toBeVisible({ timeout: 30_000 });
		}, { target: start });

		const scroller = page.getByTestId("reader-scroller");
		await step(
			"The reading engine fills the phone",
			"The session is pinned to the screen: the page itself does not scroll, only the text does. Above it, the slim app bar and one line with the steps button and the step's title; below it, a slim bar to move between steps. The text takes most of the screen.",
			async () => {
				expect(await pageScrolls(page)).toBe(false);
				expect(await screenShare(scroller)).toBeGreaterThan(0.6);
			},
			{ target: scroller },
		);

		await switchMode(page, "Type");

		const area = page.locator("div.cursor-text");
		const chars = area.locator(".bible-text span.transition-colors");
		await step(
			"Type with the phone's keyboard",
			"Lydia taps the text and types its first word the way an Android keyboard sends it: as text put into the field, with no key events. Type mode reads it all the same, and grades each letter.",
			async () => {
				await area.click();
				await expect(chars.first()).toBeVisible();
				// The first word, as the phone would type it.
				const first = (await chars.allTextContents())
					.join("")
					.split(" ")[0]
					.normalize("NFD")
					.replace(/[̀-ͯ]/g, "")
					.replace(/[‘’]/g, "'")
					.replace(/[“”]/g, '"');
				await page.keyboard.insertText(first);
				for (let i = 0; i < first.length; i++) await expect(chars.nth(i)).toHaveAttribute("data-state", "correct");
			},
			{ target: area },
		);

		await show(
			"Typed on a phone, still one screen",
			"The first word is typed and graded correct, and the session is still one screen: the page has not scrolled, the text has the room.",
			async () => {
				await expect(area.locator('[data-state="correct"]').first()).toBeVisible();
				expect(await pageScrolls(page)).toBe(false);
			},
		);
	},
);
