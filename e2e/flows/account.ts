import type { Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { expect, flow, step } from "@andresrub10/cockpit/e2e";
import type { TestAccount } from "../fixtures/accounts";

/** Signs a test account in, then opens the page the test starts on. */
export const signIn = flow(
	"Sign in",
	"Signs in a Premium test reader made for this test, with Clerk's testing token instead of the login form.",
	async (page: Page, account: TestAccount, startAt: string) => {
		await step("Open the site", "Clerk has to be loaded on a page before it can sign anyone in, so we start on the home page.", () =>
			page.goto("/"),
		);
		await step("Sign in as the test reader", "A fresh account with Premium, made for this test and deleted after it.", () =>
			clerk.signIn({ page, emailAddress: account.email }),
		);
		await step(`Go to ${startAt}`, `Open ${startAt} as the signed-in reader.`, async () => {
			await page.goto(startAt);
			await expect(page.locator("main").first()).toBeVisible();
		});
	},
	{ covers: ["src/app/state/LoggedUserContext.tsx", "src/middleware.ts"] },
);
