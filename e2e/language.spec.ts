import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { openChapter } from "./flows/reader";
import { changeAppLanguage, globe } from "./flows/language";

const notice = (page: import("@playwright/test").Page) => page.getByTestId("bible-language-notice");

test(
	"Changing the app language changes the Bible too",
	{ annotation: covers("src/components/app/LanguageSwitcher.tsx", "src/app/actions/locale.ts", "src/lib/bibleFollowsLanguage.ts", "src/lib/recommendedBible.ts") },
	async ({ page }) => {
		await openChapter(page, "bsb-en", "gen", 1);
		await changeAppLanguage(page, "Español");

		await show(
			"Genesis 1, now in Spanish",
			"The reader moved to the same chapter in the Versión Biblia Libre, the modern Spanish translation that is the default for Español: the URL is /bible/vbl-sp-2/genesis/1 (its own slug for Genesis; the BSB's is gen) and the text starts \"En el principio, Dios creó los cielos y la tierra.\" No notice: the Bible and the app are both in Spanish.",
			async () => {
				await expect(page).toHaveURL(/\/bible\/vbl-sp-2\/genesis\/1$/);
				await expect(page.locator("main .bible-text").first()).toContainText("En el principio, Dios creó");
				await expect(notice(page)).toHaveCount(0);
			},
		);
	},
);

test(
	"A Bible in another language says so and offers the app's own",
	{ annotation: covers("src/app/bible/components/BibleLanguageNotice.tsx", "src/app/bible/?bibleSlug?/layout.tsx") },
	async ({ page }) => {
		await openChapter(page, "rvr09-sp", "gn", 1);

		await step(
			"The notice names the mismatch",
			'The app is in English but this is the Reina-Valera, in Spanish. Above the text: "This Bible is in Spanish, but the app is in English." The reader is not redirected: a shared link still opens what was shared.',
			() => expect(notice(page)).toContainText("This Bible is in Spanish, but the app is in English."),
		);

		const readDefault = notice(page).getByRole("button", { name: "Read the Berean Standard Bible" });
		await step("Read the English Bible", 'Press "Read the Berean Standard Bible", the default English translation.', async () => {
			await readDefault.click();
			await page.waitForURL("**/bible/bsb-en/gen/1");
		}, { target: readDefault });

		await show(
			"Genesis 1 in the Berean Standard Bible",
			'Same chapter, now in English: "In the beginning God created the heavens and the earth." The notice is gone.',
			async () => {
				await expect(page.locator("main .bible-text").first()).toContainText("In the beginning God created");
				await expect(notice(page)).toHaveCount(0);
			},
		);
	},
);

test(
	"Keeping a Bible in another language decouples it from the app",
	{ annotation: covers("src/app/bible/components/BibleLanguageNotice.tsx", "src/components/app/LanguageSwitcher.tsx", "src/components/app/useBibleFollowsLanguage.ts") },
	async ({ page }) => {
		await openChapter(page, "rvr09-sp", "gn", 1);

		const keep = notice(page).getByRole("button", { name: "Keep this translation" });
		await step("Keep the Spanish Bible", 'The notice offers the English Bible; press "Keep this translation" instead: this reader wants the app in English and the Bible in Spanish.', async () => {
			await keep.click();
			await expect(notice(page)).toHaveCount(0);
		}, { target: keep });

		await step("Check the globe menu", 'Open the globe: "Bible follows app language" is now unchecked, and says the reader picks the translation in any language.', async () => {
			await globe(page).click();
			await expect(page.getByRole("menuitemcheckbox", { name: /Bible follows app language/ })).toHaveAttribute("aria-checked", "false");
			await page.keyboard.press("Escape");
		}, { target: globe(page) });

		await changeAppLanguage(page, "Español");
		await changeAppLanguage(page, "English");

		await show(
			"Still the Reina-Valera, app in English",
			"Switching the app to Español and back left the Bible alone: the URL is still /bible/rvr09-sp/gn/1, and no notice nags about the language.",
			async () => {
				await expect(page).toHaveURL(/\/bible\/rvr09-sp\/gn\/1$/);
				await expect(page.locator("main .bible-text").first()).toBeVisible();
				await expect(notice(page)).toHaveCount(0);
			},
		);
	},
);
