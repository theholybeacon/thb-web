import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { openChapter } from "./flows/reader";
import { dictionaryPanel, highlightWord } from "./flows/dictionary";

// Playwright's tracing breaks the dev build's eval'd posthog-js chunk ("Invalid
// or unexpected token" in app/layout.js), so the page never hydrates and a
// selection never reaches the reader. This test needs a live page.
test.use({ trace: "off" });

test(
	"A Spanish Bible's words are defined in Spanish, or in English on request",
	{
		annotation: covers(
			"src/components/reader/panel/sections/DictionarySection.tsx",
			"src/app/common/dictionary/**",
			"src/lib/dictionaryLanguage.ts",
		),
	},
	async ({ page }) => {
		await openChapter(page, "rvr09-sp", "gn", 1);
		await highlightWord(page, 1, "tierra");

		// The panel is mounted twice (desktop column, hidden mobile drawer); check the one on screen.
		const visibleText = (text: string) => page.getByText(text, { exact: false }).filter({ visible: true });
		// Server actions run one at a time per page, so the definition can queue
		// behind the original-language lookup (twice over in dev, with two panels).
		const lookup = { timeout: 45_000 };
		const languages = dictionaryPanel(page).filter({ visible: true });
		const spanish = languages.getByRole("button", { name: /Spanish|Español/ });
		const english = languages.getByRole("button", { name: /English|Inglés/ });

		await show(
			"Defined in Spanish",
			'The Reina-Valera is in Spanish, so "tierra" is defined in Spanish, from the Spanish Wiktionary: "Superficie del planeta Tierra que no se encuentra cubierta por agua." Before, it came back in English ("Earth"). The language switch above shows Spanish selected.',
			async () => {
				await expect(spanish).toHaveAttribute("aria-pressed", "true");
				await expect(visibleText("Superficie del planeta Tierra")).toBeVisible(lookup);
				await expect(page.getByText(/Spanish Wiktionary|Wiktionary en español/).filter({ visible: true })).toBeVisible();
			},
		);

		await step(
			"Switch the definitions to English",
			'Press "English" in the language switch beside the word: the reader wants the same Spanish word explained in English.',
			() => english.click(),
			{ target: english },
		);

		await show(
			"Defined in English",
			'The same word, now defined in English from the English Wiktionary: "Earth (planet of the Solar System…)". The original-language block below it is unchanged. The choice is remembered for Spanish Bibles.',
			async () => {
				await expect(english).toHaveAttribute("aria-pressed", "true");
				await expect(visibleText("Earth (planet of the Solar System")).toBeVisible(lookup);
				await expect(visibleText("Superficie del planeta Tierra")).toHaveCount(0);
			},
		);
	},
);
