import type { Page } from "@playwright/test";
import { expect, flow, step } from "@andresrub10/cockpit/e2e";

/** The open reader panel's dictionary section. */
export const dictionaryPanel = (page: Page) => page.getByRole("group", { name: /Definitions in|Definiciones en/ });
const visibleDictionary = (page: Page) => dictionaryPanel(page).filter({ visible: true });

/**
 * Highlights one word of a verse, the way a reader drags across it, and waits
 * for the reader panel to open on its dictionary.
 */
export const highlightWord = flow(
	"Highlight a word",
	"Selects a word in the chapter's text. Highlighting a word opens the reader panel on the dictionary.",
	async (page: Page, verse: number, word: string) => {
		const verseText = page.locator(`[data-verse="${verse}"] [data-verse-text]`).first();
		const select = () =>
			verseText.evaluate(async (element, target) => {
				// Clear first, in its own task: re-adding the very range that is already
				// selected is not a change, and the reader would not hear about it.
				window.getSelection()!.removeAllRanges();
				await new Promise((resolve) => setTimeout(resolve, 50));
				const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
				for (let node = walker.nextNode(); node; node = walker.nextNode()) {
					const at = node.textContent?.indexOf(target) ?? -1;
					if (at < 0) continue;
					const range = document.createRange();
					range.setStart(node, at);
					range.setEnd(node, at + target.length);
					window.getSelection()!.addRange(range);
					return;
				}
				throw new Error(`"${target}" is not in this verse`);
			}, word);
		await step(
			`Select "${word}"`,
			`Highlight "${word}" in verse ${verse}, the same selection a reader makes by dragging across it or double-clicking it. The text is server-rendered, so the selection is repeated until the page is interactive and reacts to it.`,
			() =>
				expect(async () => {
					await select();
					await expect(visibleDictionary(page)).toBeVisible({ timeout: 2000 });
				}).toPass({ timeout: 30_000 }),
			{ target: verseText },
		);
		await step(
			"The dictionary opens",
			`The reader panel opens on its dictionary section, headed by "${word}".`,
			() => expect(visibleDictionary(page)).toBeVisible(),
		);
	},
	{ covers: ["src/components/reader/selection/**", "src/components/reader/panel/**"] },
);
