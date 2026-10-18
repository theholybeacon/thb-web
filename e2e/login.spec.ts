import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";

const loginCovers = covers("src/app/auth/login/**", "src/app/auth/lib/loginTelemetry.ts", "src/lib/posthog-client.ts");

/** Clerk, the sign-in service: its script and its API live on its own domain. */
const isClerk = (url: URL) => url.hostname.includes("clerk");

test("Login says so when the sign-in request can't get through", { annotation: loginCovers }, async ({ page }) => {
	await step("Open the login page", "Signed out, on /auth/login. The form is ready once Clerk has loaded.", async () => {
		await page.goto("/auth/login");
		await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
	});
	await step(
		"Cut the connection to sign-in",
		"From here on the browser drops every sign-in request to Clerk, as when someone's network or a firewall blocks it.",
		() => page.route((url) => isClerk(url) && url.pathname.includes("/sign_ins"), (route) => route.abort()),
	);
	await step("Fill in the form", "A made-up account: the request never reaches Clerk anyway.", async () => {
		await page.getByLabel("Email address").fill("reader@example.com");
		await page.getByLabel("Password").fill("not-a-real-password");
	});
	const signIn = page.getByRole("button", { name: "Sign in", exact: true });
	await step(
		'Press "Sign in"',
		"The request fails before Clerk answers. The page records login_failed (an unexpected reason) and reports it to PostHog Error Tracking.",
		() => signIn.click(),
		{ target: signIn },
	);
	await show(
		"The page says what went wrong",
		'Before, this showed "Additional verification required", which sent people looking for a code that never comes. Now the form says it couldn\'t reach sign-in and to check the connection.',
		() => expect(page.getByRole("alert").filter({ hasText: "couldn't reach the sign-in service" })).toBeVisible(),
	);
});

test("Login says so when sign-in can't load", { annotation: loginCovers }, async ({ page }) => {
	await step(
		"Block Clerk",
		"The browser drops everything from Clerk's domain, its script included, as an ad blocker or an outage would.",
		() => page.route((url) => isClerk(url), (route) => route.abort()),
	);
	await step("Open the login page", "The form renders, but its buttons stay disabled: without Clerk it can't sign anyone in.", () =>
		page.goto("/auth/login"),
	);
	await show(
		"After 10 seconds the page explains",
		"A message says sign-in isn't loading, suggests checking the connection or ad blockers, and offers to reload. The page records login_failed (reason clerk_not_loaded) and reports it to PostHog.",
		async () => {
			const alert = page.getByRole("alert").filter({ hasText: "Sign-in isn't loading" });
			await expect(alert).toBeVisible({ timeout: 20_000 });
			await expect(alert.getByRole("button", { name: "Reload the page" })).toBeVisible();
		},
	);
});
