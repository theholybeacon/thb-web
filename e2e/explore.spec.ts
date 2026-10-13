import { test, expect, step, show, covers } from "./support/steps";

test(
	"Search translations and open one",
	{ annotation: covers("src/app/bible/page.tsx", "src/app/bible/components/BibleSelector.tsx", "src/app/bible/?bibleSlug?/page.tsx") },
	async ({ page }) => {
		await step("Open Explore the Bible", "The translation catalogue at /bible, with recommended picks on top.", () =>
			page.goto("/bible"),
		);

		const search = page.getByPlaceholder("Search Bibles...");
		await step("Search for Reina", 'Type "Reina": hundreds of Bibles narrow down to the Reina-Valera ones.', () => search.fill("Reina"), {
			target: search,
		});

		const result = page.locator("main a[href='/bible/rvr09-sp']");
		await step("Open the Reina-Valera 1909", "Click it in the results.", async () => {
			await result.click();
			await page.waitForURL("**/bible/rvr09-sp");
		}, { target: result });

		await show("The Reina-Valera page", "Its page opens with the translation's name as the heading.", () =>
			expect(page.getByRole("heading", { level: 1 })).toContainText("Reina"),
		);
	},
);
