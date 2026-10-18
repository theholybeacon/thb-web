import { test, expect, step, show, covers } from "@andresrub10/cockpit/e2e";

// /dev/crash crashes on purpose; it only exists outside production.
const fallbackCovers = covers(
	"src/app/error.tsx",
	"src/app/global-error.tsx",
	"src/components/errors/**",
	"src/lib/posthog-client.ts",
	"src/lib/server-errors.ts",
	"src/instrumentation.ts",
);

test("A page that crashes on the server shows the error screen", { annotation: fallbackCovers }, async ({ page }) => {
	await step(
		"Open a page that crashes on the server",
		"/dev/crash?where=server throws while the server renders it. instrumentation.ts reports the error to PostHog with its digest, and the browser gets the error screen instead of a blank page.",
		() => page.goto("/dev/crash?where=server"),
	);
	await show(
		"The error screen, with a reference",
		'"Something went wrong", a way to try again or go home, and the error reference: the digest the server report carries, so a person quoting it can be found in PostHog under error_ref.',
		async () => {
			await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
			await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
			await expect(page.getByText(/Error reference: \S+/)).toBeVisible();
		},
	);
});

test("A crash in the browser shows the error screen", { annotation: fallbackCovers }, async ({ page }) => {
	await step(
		"Open the crash page",
		"/dev/crash without parameters renders fine and offers a button that crashes the page in the browser, enabled once the page is interactive.",
		async () => {
			await page.goto("/dev/crash");
			await expect(page.getByRole("button", { name: "Crash the page" })).toBeEnabled();
		},
	);
	const crash = page.getByRole("button", { name: "Crash the page" });
	await step(
		'Press "Crash the page"',
		"The next render throws. The error boundary (error.tsx) catches it and reports it to PostHog from the browser.",
		() => crash.click(),
		{ target: crash },
	);
	await step(
		"The error screen replaces the page",
		'"Something went wrong" with a short error reference made up in the browser, the same one sent with the report.',
		async () => {
			await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
			await expect(page.getByText(/Error reference: [a-z0-9]{8}/)).toBeVisible();
		},
	);
	const retry = page.getByRole("button", { name: "Try again" });
	await step("Press \"Try again\"", "The page renders again from scratch, without the crash.", () => retry.click(), {
		target: retry,
	});
	await show("The page is back", 'The "Crash the page" button is on screen again: the person recovered without reloading.', () =>
		expect(page.getByRole("button", { name: "Crash the page" })).toBeVisible(),
	);
});
