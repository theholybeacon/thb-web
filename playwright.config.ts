import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (e2e/). Most run signed out against public pages; signed-in
 * tests sign in a test reader through Clerk's testing tokens (e2e/flows/account.ts,
 * set up in e2e/global-setup.ts), which needs the Clerk dev keys.
 *
 * Point them at a running app with E2E_BASE_URL (or PLAYWRIGHT_BASE_URL).
 * Without either, they start the local dev server on :3014, which needs the
 * usual local env (see docs/env.example). Never point them at production.
 */
const externalBaseURL = process.env.E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? "http://localhost:3014";

export default defineConfig({
	testDir: "e2e",
	globalSetup: "./e2e/global-setup.ts",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["list"], ['@andresrub10/cockpit/reporter']] : [["list"], ["html", { open: "never" }], ['@andresrub10/cockpit/reporter']],
	timeout: 60_000,
	expect: { timeout: 15_000 },
	use: {
		baseURL,
		locale: "en-US",
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: externalBaseURL
		? undefined
		: {
				// Not `npm run dev`: its predev hook registers a local reverse proxy.
				command: "npx next dev -p 3014",
				url: baseURL,
				reuseExistingServer: true,
				timeout: 180_000,
			},
});
