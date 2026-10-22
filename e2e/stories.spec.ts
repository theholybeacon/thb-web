import type { Page } from "@playwright/test";
import { expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { test, hasClerk, ensureGlobalStudy } from "./fixtures/accounts";
import { signIn } from "./flows/account";
import { NOAHS_ARK } from "../src/app/common/study/model/stories/noahsArk";

test.skip(!hasClerk, "needs the worktree's Clerk keys and database");
// Recording a trace cuts the dev server's larger script chunks short (the root
// layout's stops at 1.6 MB), and a half-loaded layout never starts Clerk, so
// these tests could not sign in. The walkthrough's screenshots cover review.
test.use({ trace: "off" });

/** The session footer's Next: completes the step on screen and opens the next one. */
async function next(page: Page, explain: string, expectedTitle: string) {
	const button = page.locator("main footer").getByRole("button", { name: "Next", exact: true });
	await step(`Next: ${expectedTitle}`, explain, async () => {
		await button.click();
		await expect(page.getByRole("heading", { level: 1, name: expectedTitle })).toBeVisible();
	}, { target: button });
}

test(
	"Take a story: Noah's Ark mixes Scripture with text, a character, images and a reflection",
	{
		annotation: covers(
			"src/components/study/**",
			"src/app/(app)/study/**",
			"src/app/(app)/session/**",
			"src/app/common/study/**",
			"src/app/common/studyStep/**",
			"src/app/common/session/**",
		),
	},
	async ({ page, accounts }) => {
		// Ten steps, each a round trip to the server: longer than the default minute.
		test.setTimeout(180_000);
		await step("Make sure Noah's Ark is in the catalog", "The Holy Beacon's stories are seeded from code; this adds Noah's Ark to the test database if it is not there yet, exactly as `npm run seed:studies` writes it.", () =>
			ensureGlobalStudy(NOAHS_ARK),
		);
		const reader = await step("Create a Premium reader", "A new account with Premium, whose default Bible is the Berean Standard Bible.", () =>
			accounts.create(),
		);
		await signIn(page, reader, "/study");

		const storiesTab = page.getByRole("tab", { name: /^Stories/ });
		await step("Show only the stories", "The catalog of ready-made studies now holds plans and stories; the Stories filter leaves the stories.", () =>
			storiesTab.click(), { target: storiesTab });

		const card = page.getByTestId("catalog-card").filter({ hasText: "Noah's Ark" });
		await step("Find Noah's Ark", "Its card is marked as a Story by The Holy Beacon, and counts what it is made of: passages, texts, a character, images and a reflection.", async () => {
			await expect(card).toContainText("Story");
			await expect(card).toContainText("By The Holy Beacon");
			await expect(card).toContainText("10 steps");
			await expect(card).toContainText("4 passages");
			await expect(card).toContainText("2 images");
		}, { target: card });

		await step("Start the story", "Press \"Start story\". A dialog asks which translation to read it in.", () =>
			card.getByRole("button", { name: "Start story" }).click(), { target: card.getByRole("button", { name: "Start story" }) });

		const dialog = page.getByRole("dialog");
		await step("Read it in the reader's Bible", "The story is written in English, so the dialog offers English translations and says so. The reader's default, the Berean Standard Bible, is already chosen.", async () => {
			await expect(dialog).toContainText("This study is written in English");
			await dialog.getByRole("button", { name: "Start story" }).click();
			await page.waitForURL(/\/session\//);
		}, { target: dialog });

		await step("Step 1 is text", "The story opens with a page written by The Holy Beacon that sets the scene, citing a verse for every claim. There is no reader toolbar: it is not a passage.", async () => {
			await expect(page.getByRole("heading", { level: 1, name: "Before the flood" })).toBeVisible();
			await expect(page.locator("[data-step-kind=text]")).toContainText("Ten generations separate Adam from Noah");
		});

		await next(page, "Step 2 is a passage, Genesis 6, open in the reader in Read mode, with its explanation.", "God sees the earth and calls Noah");
		await step("Genesis 6 in the reader", "The passage's text loads, the same reader every plan uses.", () =>
			expect(page.locator("main .bible-text").first()).toBeVisible());

		await next(page, "Step 3 is a character: Noah's profile in brief, with a link to the full profile.", "Noah");
		await step("Noah's character card", "The note says why Noah matters to the story; \"Open the full profile\" opens his page.", async () => {
			await expect(page.locator("[data-step-kind=character]")).toContainText("righteous, blameless in his generation");
			await expect(page.getByRole("link", { name: "Open the full profile" })).toHaveAttribute("href", "/bible/people/noah_2210");
		});

		await next(page, "Step 4 is Genesis 7, the flood itself.", "The flood");
		await next(page, "Step 5 is an image: Gustave Doré's engraving of the flood, public domain, with its caption and credit.", "The Deluge");
		await step("The engraving and its credit", "The image loads from Wikimedia Commons, and its credit links back to the file page.", async () => {
			const image = page.getByRole("img", { name: /people and a tiger clinging to a rock/ });
			await expect(image).toBeVisible();
			await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
			await expect(page.getByRole("link", { name: /Gustave Doré, The Deluge/ })).toBeVisible();
		});

		await next(page, "Step 6 is Genesis 8: the waters go down.", "God remembers Noah");
		await next(page, "Step 7 is the second image, the dove returning to the ark.", "The dove returns");
		await next(page, "Step 8 is a verse range, Genesis 9:1-17, the covenant and the rainbow.", "The covenant and the rainbow");
		await next(page, "Step 9 is text again: where Noah appears in the rest of the Bible.", "Noah in the rest of the Bible");
		await next(page, "Step 10, the last, is a reflection: a question to answer in the reader's own words.", "A promise kept");

		const answer = page.getByRole("textbox", { name: "Write your answer…" });
		await step("Answer the reflection", "Write an answer. It will be saved to the reader's notes, on Genesis 9:13.", () =>
			answer.fill("When my father recovered, I knew God had heard us."), { target: answer });
		const save = page.getByRole("button", { name: "Save to my notes" });
		await step("Save it to my notes", "Press \"Save to my notes\"; the step confirms and offers to open them.", async () => {
			await save.click();
			await expect(page.getByText("Saved to your notes. You can come back to it any time.")).toBeVisible();
		}, { target: save });

		const finish = page.locator("main footer").getByRole("button", { name: /Finish Study/ });
		await step("Finish the story", "On the last step, Next becomes Finish Study, which records the step and shows the recap.", () =>
			finish.click(), { target: finish });

		await show("The recap counts every step", "Study complete: 10 of 10 steps. The passages are listed by their reference; the other steps by their title, marked done.", async () => {
			const recap = page.getByRole("dialog");
			await expect(recap).toContainText("Study complete");
			await expect(recap).toContainText("10/10");
			await expect(recap).toContainText("A promise kept");
		});
	},
);

test(
	"A reflection answer is kept in My Notes",
	{ annotation: covers("src/components/study/steps/**", "src/app/common/note/**", "src/app/(app)/notes/**") },
	async ({ page, accounts }) => {
		await step("Make sure Noah's Ark is in the catalog", "Seeded from its definition in code if the test database does not have it yet.", () =>
			ensureGlobalStudy(NOAHS_ARK));
		const reader = await step("Create a Premium reader", "A new account with Premium, reading the Berean Standard Bible.", () =>
			accounts.create());
		await signIn(page, reader, "/study");

		await step("Start Noah's Ark", "Start the story from the catalog in the reader's default Bible.", async () => {
			const card = page.getByTestId("catalog-card").filter({ hasText: "Noah's Ark" });
			await card.getByRole("button", { name: "Start story" }).click();
			await page.getByRole("dialog").getByRole("button", { name: "Start story" }).click();
			await page.waitForURL(/\/session\//);
		});

		const reflection = page.getByRole("button", { name: /Step 10/ });
		await step("Jump to the reflection", "The steps list on the left shows each step's kind; step 10 is marked Reflection. Open it directly.", async () => {
			await expect(reflection).toContainText("Reflection");
			await reflection.click();
			await expect(page.getByRole("heading", { level: 1, name: "A promise kept" })).toBeVisible();
		}, { target: reflection });

		await step("Answer and save", "Write an answer and press \"Save to my notes\".", async () => {
			await page.getByRole("textbox", { name: "Write your answer…" }).fill("He kept his word to Noah, and to me.");
			await page.getByRole("button", { name: "Save to my notes" }).click();
			await expect(page.getByText("Saved to your notes.", { exact: false })).toBeVisible();
		});

		await step("Open my notes", "\"Open my notes\" goes to My Notes, where every note the reader wrote is listed.", async () => {
			await page.getByRole("link", { name: "Open my notes" }).click();
			await page.waitForURL("**/notes");
		});

		await show("The answer is a note on Genesis 9:13", "The reflection's question is the note's title, the answer its text, and it is anchored on the verse the reflection points to.", async () => {
			await expect(page.getByText("He kept his word to Noah, and to me.")).toBeVisible();
			await expect(page.getByText(/Genesis 9:13/).first()).toBeVisible();
		});
	},
);

test(
	"A study can show a video and a link between its passages",
	{ annotation: covers("src/components/study/steps/**", "src/app/(app)/study/[id]/**", "src/app/(app)/session/**") },
	async ({ page, accounts }) => {
		const reader = await step("Create a Premium reader", "A new account with Premium.", () => accounts.create());
		const studyId = await step(
			"Give the reader a study with a video and a link",
			"A study the reader designed: Psalm 23, then a BibleProject video, then a link to a book. The same rows the study generator writes.",
			() => accounts.createOwnStudy(reader, "Shepherd psalm", [
				{ title: "Watch: the Bible's story", content: { kind: "video", provider: "youtube", videoId: "GQI72THyO5I", start: 0, credit: "BibleProject" } },
				{ title: "Read further", content: { kind: "link", linkType: "book", url: "https://www.gutenberg.org/ebooks/10", title: "The King James Bible", source: "Project Gutenberg", description: "The whole Bible, free to read online." } },
			]),
		);
		await signIn(page, reader, `/study/${studyId}`);

		await step("The study's page", "It is a Plan, and it says it was made by the reader. The steps list marks the video and the link by their kind.", async () => {
			await expect(page.getByTestId("study-byline")).toContainText("Plan");
			await expect(page.getByTestId("study-byline")).toContainText("By you");
			await expect(page.getByText("Video", { exact: true })).toBeVisible();
			await expect(page.getByText("Link", { exact: true })).toBeVisible();
		});

		const start = page.getByRole("button", { name: "Start Session" });
		await step("Start a session", "Press \"Start Session\": step 1 is Psalm 23 in the reader.", async () => {
			await start.click();
			await page.waitForURL(/\/session\//);
			await expect(page.getByRole("heading", { level: 1, name: "Psalm 23" })).toBeVisible();
		}, { target: start });

		await next(page, "Step 2 is the video, embedded from YouTube without tracking cookies.", "Watch: the Bible's story");
		await step("The video player", "The embed comes from youtube-nocookie.com, credited to the channel.", async () => {
			await expect(page.locator("iframe[src^='https://www.youtube-nocookie.com/embed/GQI72THyO5I']")).toBeVisible();
			await expect(page.locator("[data-step-kind=video]")).toContainText("BibleProject");
		});

		await next(page, "Step 3 is a link to a book, which opens in a new tab.", "Read further");
		await show("The book's card", "The card names the book and where it is published, with a button to open it.", async () => {
			const link = page.locator("[data-step-kind=link]");
			await expect(link).toContainText("The King James Bible");
			await expect(link).toContainText("Project Gutenberg");
			await expect(link.getByRole("link", { name: "Open on gutenberg.org" })).toHaveAttribute("target", "_blank");
		});
	},
);
