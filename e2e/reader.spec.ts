import { test, expect, step, show, covers } from "./support/steps";
import { openChapter, switchMode } from "./flows/reader";

test("Reader opens a chapter", { annotation: covers("src/app/(app)/session/?id?/components/modes/ReadMode.tsx") }, async ({ page }) => {
	await openChapter(page, "bsb-en", "gen", 1);
	await show(
		"Genesis 1 is on screen",
		'The header reads "Genesis 1" and the text starts with "In the beginning God created the heavens and the earth."',
		async () => {
			await expect(page.getByText("Genesis 1", { exact: true }).first()).toBeVisible();
			await expect(page.locator("main .bible-text").first()).toContainText("In the beginning God created");
		},
	);
});

test(
	"Typing a whole chapter ends on the result tiles",
	{
		annotation: covers(
			"src/app/(app)/session/?id?/components/modes/TypeMode.tsx",
			"src/app/common/verse/model/typingFold.ts",
		),
	},
	async ({ page }) => {
		await openChapter(page, "kjv-en", "psa", 117);
		await switchMode(page, "Type");

		const area = page.locator("div.cursor-text");
		const chars = area.locator(".bible-text span.transition-colors");

		const text = await step(
			"Read the text to type",
			"Every typable slot is a character span, including the one-keystroke slot at each line break. Collect them in order, plain ASCII, so the typing matches what the app expects.",
			async () => {
				await expect(chars.first()).toBeVisible();
				const all = await chars.allTextContents();
				return all
					.map((c) =>
						c
							.normalize("NFD")
							.replace(/[̀-ͯ]/g, "")
							.replace(/[‘’]/g, "'")
							.replace(/[“”]/g, '"')
							.replace(/[–—]/g, "-")
							.replace(/ /g, " "),
					)
					.join("");
			},
		);

		await step(
			"Progress starts at zero",
			`The progress counter shows 0/${text.length}: the app expects exactly as many keystrokes as there are slots on screen.`,
			() => expect(page.getByText(`0/${text.length}`, { exact: true })).toBeVisible(),
		);

		await step("Focus the typing area", "Click the text; keystrokes go to the chapter from here on.", () => area.click(), {
			target: area,
		});

		await step(
			"Type the chapter",
			`Type all ${text.length} characters, line breaks as spaces, with no mistakes.`,
			async () => {
				for (const ch of text) await page.keyboard.press(ch === " " ? "Space" : ch);
			},
		);

		await show(
			"The result tiles",
			"Typing the last character completes the chapter: three tiles show accuracy (100%), words per minute and time spent.",
			async () => {
				const tiles = page.locator(".grid.grid-cols-3");
				await expect(tiles).toBeVisible();
				await expect(tiles).toContainText("100%");
				await expect(tiles).toContainText("WPM");
			},
		);
	},
);
