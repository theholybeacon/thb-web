import type { Page } from "@playwright/test";
import { expect, flow, step } from "@andresrub10/cockpit/e2e";

/**
 * Opens a chapter in the reader, e.g. openChapter(page, "bsb-en", "gen", 1).
 * Book slugs are the lowercase three-letter codes used in the URL (gen, psa, jhn).
 */
export const openChapter = flow(
	"Open a chapter",
	"Goes straight to a chapter's reader page and waits for its text, the way a reader arrives from search or a shared link.",
	async (page: Page, translation: string, book: string, chapter: number) => {
		await step(
			"Go to the chapter",
			`Open /bible/${translation}/${book}/${chapter}: ${book.toUpperCase()} ${chapter} in the ${translation} Bible. No sign-in needed.`,
			() => page.goto(`/bible/${translation}/${book}/${chapter}`),
		);
		await step(
			"Wait for the text",
			"The chapter's verses load into the reader, which opens in Read mode.",
			() => expect(page.locator("main .bible-text").first()).toBeVisible(),
		);
	},
	{
		covers: [
			"src/app/bible/?bibleSlug?/?bookSlug?/**",
			"src/app/bible/components/ExplorerView.tsx",
			"src/components/reader/**",
			"src/app/common/chapter/**",
		],
	},
);

/** Switches the reader to another mode with the mode buttons in its toolbar. */
export const switchMode = flow(
	"Switch reader mode",
	"Uses the Read / Type / Listen buttons at the top of the reader.",
	async (page: Page, mode: "Read" | "Type" | "Listen") => {
		const button = page.getByRole("button", { name: mode, exact: true });
		await step(`Press "${mode}"`, `The "${mode}" button in the reader's toolbar switches the chapter to ${mode} mode.`, () => button.click(), {
			target: button,
		});
	},
	{ covers: ["src/components/reader/ReaderEngine.tsx"] },
);
