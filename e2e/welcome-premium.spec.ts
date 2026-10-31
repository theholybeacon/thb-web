import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";
import { signInAsFreeReader } from "./flows/account";

/**
 * The welcome week: seven days of premium every reader gets once, on their
 * first sign-in or, for readers who were already free, their next one. The
 * builder's AI is the scripted one (`study_builder_fake_ai`, outside production
 * only), so no paid model is called.
 */
const WELCOME_COVERS = [
	"src/lib/premium.ts",
	"src/app/common/subscription/service/server/welcomePremiumClaimSS.ts",
	"src/app/common/user/dao/UserPostgreSQLDao.ts",
	"src/components/app/WelcomePremiumNotice.tsx",
	"src/components/app/TrialBanner.tsx",
];

test(
	"A new reader's first visit opens the AI study builder",
	{ annotation: covers(...WELCOME_COVERS, "src/app/(app)/welcome/**", "src/app/(app)/study/create/**", "src/components/study/builder/**") },
	async ({ page, baseURL }) => {
		test.setTimeout(150_000);
		await step("Use the scripted builder AI", "The study builder answers from a script in this test instead of a paid model.", () =>
			page.context().addCookies([{ name: "study_builder_fake_ai", value: "1", url: baseURL! }]),
		);
		await signInAsFreeReader(page, "welcome-new", "Naomi Newcomer", "new");

		const notice = page.locator("[data-sonner-toast]").filter({ hasText: "You have 7 days of premium, on us" });
		const skip = page.getByRole("button", { name: "Skip for now" });
		await step(
			"The welcome questions come first",
			"A new reader goes through the /welcome questions before anything else, and the notice about the week waits until she is past them. (The questions themselves are welcome.spec.ts.)",
			async () => {
				await page.waitForURL("**/welcome", { timeout: 90_000 });
				await expect(skip).toBeVisible();
				await expect(notice).toHaveCount(0);
			},
			{ target: skip },
		);

		await step(
			"Skip them, and land in the study builder",
			'Naomi presses "Skip for now". She has no study and no session yet, so instead of the home page the app opens the AI study builder: the conversation that plans a study around what she is going through.',
			async () => {
				await skip.click();
				await page.waitForURL("**/study/create", { timeout: 60_000 });
				// The first visit in a fresh dev server compiles the page and its server actions.
				await expect(page.getByTestId("builder-chat")).toBeVisible({ timeout: 90_000 });
			},
		);

		await step(
			"Told about the free week",
			'A notice tells her the builder is premium and hers for 7 days: "You have 7 days of premium, on us", and to tell the builder what she is going through.',
			() => expect(notice).toContainText("Tell the study builder what you're going through"),
			{ target: notice },
		);

		await show(
			"The builder speaks first, with the week counting down",
			'Without a subscription, the builder opens and greets her by name before she types anything. Above the app, the banner counts the free week down: "Your free premium week: 7 days left."',
			async () => {
				await expect(page.getByTestId("builder-assistant-message").first()).toContainText("Naomi");
				await expect(page.getByTestId("welcome-premium-banner")).toContainText("Your free premium week: 7 days left.");
			},
		);
	},
);

test(
	"A free reader is given the week on their next sign-in",
	{ annotation: covers(...WELCOME_COVERS, "src/app/(app)/subscription/**", "src/app/(app)/study/page.tsx") },
	async ({ page }) => {
		test.setTimeout(150_000);
		await signInAsFreeReader(page, "welcome-returning", "Ruben Returning", "returning");

		const notice = page.locator("[data-sonner-toast]").filter({ hasText: "You have 7 days of premium, on us" });
		await step(
			"Told on the home page",
			'Ruben already has a study, so he stays on the home page. A notice tells him every premium feature is open for the week, until the date it ends, and offers "Build a study".',
			async () => {
				await expect(page).toHaveURL(/\/home$/);
				await expect(page.getByRole("heading", { name: "Welcome back, Ruben Returning" })).toBeVisible();
				await expect(notice).toContainText("Every premium feature is open until");
				await expect(notice.getByRole("button", { name: "Build a study" })).toBeVisible();
			},
			{ target: notice },
		);

		await step(
			"His studies open",
			'"My Studies" is premium: before, it showed Ruben the upgrade screen. Now his own study from before, "Psalms of comfort", is listed.',
			async () => {
				await page.goto("/study");
				await expect(page.getByText("Psalms of comfort")).toBeVisible({ timeout: 60_000 });
			},
		);

		const keep = page.getByTestId("welcome-premium-banner").getByRole("link", { name: "Keep premium" });
		await step(
			"Keep premium after the week",
			'The banner counts the week down. "Keep premium" opens the plans.',
			async () => {
				await expect(page.getByTestId("welcome-premium-banner")).toContainText("7 days left");
				await keep.click();
				await page.waitForURL("**/subscription");
			},
			{ target: keep },
		);

		await show(
			"The plans, with when the week ends",
			"The subscription page says when his free week ends and offers the plans, rather than a subscription to manage: Ruben has nothing in Stripe yet.",
			() => expect(page.getByTestId("welcome-premium-note")).toContainText("Your free premium week ends on"),
		);
	},
);
