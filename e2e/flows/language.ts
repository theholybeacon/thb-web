import type { Page } from "@playwright/test";
import { expect, flow, step } from "@andresrub10/cockpit/e2e";

/** The globe button in the header. */
export const globe = (page: Page) => page.getByRole("button", { name: /^(Language|Idioma)$/ });

/** Picks the app language from the globe menu, e.g. changeAppLanguage(page, "Español"). */
export const changeAppLanguage = flow(
	"Change the app language",
	"Uses the globe in the header, the way a reader switches the app between English and Español.",
	async (page: Page, language: "English" | "Español") => {
		await step("Open the globe menu", "Press the globe icon in the header: it lists the app languages and the \"Bible follows app language\" switch.", () => globe(page).click(), {
			target: globe(page),
		});
		const item = page.getByRole("menuitemradio", { name: language });
		await step(`Choose ${language}`, `Pick "${language}". The menu closes and the page reloads in that language.`, async () => {
			await item.click();
			await expect(page.locator("html")).toHaveAttribute("lang", language === "English" ? "en" : "es");
		}, { target: item });
	},
	{ covers: ["src/components/app/LanguageSwitcher.tsx", "src/app/actions/locale.ts"] },
);
