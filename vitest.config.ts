import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Unit tests for pure logic only (scoring, catalogs, small lib helpers) —
 * a real gap this project had zero of until now (only Playwright E2E
 * existed). Component/UI behavior stays covered by tests/e2e/**; this is
 * for functions cheap enough to test without a browser.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
