import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (e2e/). They run signed out against public pages only.
 *
 * Point them at a running app with E2E_BASE_URL (or PLAYWRIGHT_BASE_URL).
 * Without either, they start the local dev server on :3014, which needs the
 * usual local env (see docs/env.example). Never point them at production.
 */
const externalBaseURL = process.env.E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? "http://localhost:3014";

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
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
