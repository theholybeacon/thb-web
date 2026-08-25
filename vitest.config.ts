import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Test setup exists ONLY for the Content API (docs/content-api.md).
 *
 * This repo had no test runner before it; the rest of the app is unchanged and
 * untested by this config. `include` is scoped deliberately so `npm run test`
 * cannot start reporting on code nobody has written tests for.
 */
export default defineConfig({
	test: {
		include: ["src/lib/contentApi/**/*.test.ts", "src/app/api/content/**/*.test.ts"],
		environment: "node",
	},
	resolve: {
		// Mirrors the "@/*" -> "./src/*" path alias in tsconfig.json.
		alias: { "@": path.resolve(__dirname, "./src") },
	},
});
