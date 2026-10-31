import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
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
	"Typing a whole chapter is just the text",
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
			"Nothing but the text",
			"Type mode shows the chapter and a reset button: no accuracy, words per minute or progress counter.",
			async () => {
				await expect(page.getByText("WPM")).toHaveCount(0);
				await expect(page.getByText("Accuracy")).toHaveCount(0);
				await expect(page.getByText(new RegExp(`^\\d+/${text.length}$`))).toHaveCount(0);
			},
		);

		await step("Focus the typing area", "Click the text; keystrokes go to the chapter from here on.", () => area.click(), {
			target: area,
		});

		await step(
			"Type the chapter",
			`Type all ${text.length} characters, line breaks as spaces, with no mistakes. Each key waits for its character to turn correct, so the typing keeps pace with the app the way a person's does.`,
			async () => {
				// The key handler is re-attached after every render, so pace the keys
				// by the graded character rather than firing them back to back faster
				// than any person types.
				for (const [i, ch] of [...text].entries()) {
					await page.keyboard.press(ch === " " ? "Space" : ch);
					await expect(chars.nth(i)).toHaveAttribute("data-state", "correct");
				}
			},
		);

		await show(
			"The chapter, typed",
			"Every character is typed and graded correct, and the page ends on the text itself: no result tiles, no score.",
			async () => {
				await expect(area.locator('[data-state="correct"]')).toHaveCount(text.length);
				await expect(page.getByText("WPM")).toHaveCount(0);
				await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
			},
		);
	},
);
