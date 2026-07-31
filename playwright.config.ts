import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Some sandboxed dev environments pre-install a browser at a fixed path
// with a version that can trail the @playwright/test version in
// package.json — point at it only when present so `npx playwright
// install` still works normally in a fresh CI runner.
const sandboxChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

/**
 * Real E2E suite (the dependency was already installed but unused — no
 * config, no tests, dead weight). Scoped to the golden paths this project
 * has been manually re-verifying every round via throwaway scripts:
 * page loads, keyboard/skip-link access, responsive overflow, and the one
 * real gameplay flow. `webServer` builds+serves production output so CI
 * tests the same artifact that would actually ship.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    // CI builds explicitly as its own step (clean failure isolation); a
    // local `npm run test:e2e` builds inline so it works standalone.
    command: process.env.CI ? "npm run start -- -p 3100" : "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
