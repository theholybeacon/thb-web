import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Test setup started life as the Content API's alone (docs/content-api.md).
 *
 * This repo had no test runner before it, so `include` stays an explicit list
 * rather than a repo-wide test glob: `npm run test` must never start reporting
 * on code nobody has written tests for. Add a path here when you add a test.
 */
export default defineConfig({
	test: {
		include: [
			"src/lib/contentApi/**/*.test.ts",
			"src/app/api/content/**/*.test.ts",
			"src/lib/username.test.ts",
			"src/lib/prices.test.ts",
			"src/lib/warmPriority.test.ts",
			"src/lib/recommendedBible.test.ts",
			"src/lib/nameMatch.test.ts",
			"src/app/common/chapter/model/parseChapterText.test.ts",
		],
		environment: "node",
	},
	resolve: {
		// Mirrors the "@/*" -> "./src/*" path alias in tsconfig.json.
		alias: { "@": path.resolve(__dirname, "./src") },
	},
});
