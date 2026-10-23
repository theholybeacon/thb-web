import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { resetReader, setAdmin } from "./fixtures/readers";
import { signInAsPremiumReader } from "./flows/account";

// Recording a trace cuts the dev server's larger script chunks short (the root
// layout's stops at 1.6 MB), and a half-loaded page never finishes signing in
// or loading. The walkthrough's screenshots are what review uses.
test.use({ trace: "off" });


test(
	"An admin adds a media source",
	{ annotation: covers("src/app/admin/**", "src/app/common/admin/**", "src/app/common/mediaSource/**") },
	async ({ page }) => {
		const admin = await signInAsPremiumReader(page, "admin", "Ezra Admin");
		await step("Make the reader an admin", "Set isAdmin on this test account, in the test database: the app itself never sets it, it is done by hand.", async () => {
			await resetReader(admin);
			await setAdmin(admin, true);
		});
		await step("Open the admin panel", "Go to /admin.", () => page.goto("/admin"));

		await step("The admin panel", "It has its own layout, not the reader's app: Overview, Catalog and Media sources.", async () => {
			await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
			await expect(page.getByText("Stories in the catalog")).toBeVisible();
		});

		const nav = page.getByRole("navigation", { name: "Admin" }).first().getByRole("link", { name: "Media sources" });
		await step("Open Media sources", "The approved places studies take their images and videos from.", async () => {
			await nav.click();
			await page.waitForURL("**/admin/sources");
			await expect(page.getByRole("heading", { level: 1, name: "Media sources" })).toBeVisible();
		}, { target: nav });

		const name = `BibleProject ${Date.now().toString(36)}`;
		await step("Fill in a YouTube channel", `Kind YouTube channel, named "${name}", with its address and a note.`, async () => {
			await page.getByLabel("Kind").selectOption("youtube_channel");
			await page.getByLabel("Name").fill(name);
			await page.getByLabel("Address").fill("https://www.youtube.com/@bibleproject");
			await page.getByLabel("Notes").fill("Animated overviews of each book.");
		});

		const add = page.getByRole("button", { name: "Add source" });
		await step("Add it", "Press \"Add source\".", () => add.click(), { target: add });

		await show("The channel is an approved source", "It is listed with its kind, address and note.", async () => {
			const item = page.getByRole("list", { name: "Approved sources" }).getByRole("listitem").filter({ hasText: name });
			await expect(item).toContainText("YouTube channel");
			await expect(item).toContainText("https://www.youtube.com/@bibleproject");
			await expect(item).toContainText("Animated overviews of each book.");
		});
	},
);

test(
	"The admin panel does not exist for other readers",
	{ annotation: covers("src/app/admin/layout.tsx", "src/app/common/admin/**") },
	async ({ page }) => {
		const reader = await signInAsPremiumReader(page, "admin-denied", "Jonah Reader");
		await step("Not an admin", "This reader has Premium but no admin flag.", () => setAdmin(reader, false));

		const response = await step("Open /admin", "Go straight to the admin panel's address.", () => page.goto("/admin"));

		await show("Page not found", "To anyone who is not an admin, /admin answers 404 like any page that does not exist.", async () => {
			expect(response?.status()).toBe(404);
			await expect(page.getByText("This page could not be found")).toBeVisible();
		});
	},
);
