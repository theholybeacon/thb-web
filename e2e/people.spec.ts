import { test, expect, step, show, covers } from "./support/steps";

test(
	"Search for a person and open their profile",
	{ annotation: covers("src/app/bible/people/**", "src/app/common/entity/**", "src/components/entity/**") },
	async ({ page }) => {
		await step("Open Bible Characters", "The A-Z directory of every person named in scripture, at /bible/people.", () =>
			page.goto("/bible/people"),
		);

		const search = page.getByLabel("Search characters by name");
		await step("Search for Moses", 'Type "Moses" in the search box and press Enter.', async () => {
			await search.fill("Moses");
			await search.press("Enter");
			await page.waitForURL(/[?&]q=Moses/);
		}, { target: search });

		const result = page.locator("main a[href='/bible/people/moses_2108']");
		await step("Open Moses", "Moses is in the results; open his profile.", async () => {
			await result.click();
			await page.waitForURL("**/bible/people/moses_2108");
		}, { target: result });

		await show("Moses' profile", 'His profile page opens with "Moses" as its heading.', () =>
			expect(page.getByRole("heading", { level: 1 })).toHaveText("Moses"),
		);
	},
);
