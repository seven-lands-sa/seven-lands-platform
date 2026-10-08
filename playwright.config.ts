import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke + accessibility gates for the Seven Lands release candidate.
 * Run against a production build: `npm run build && npx playwright test`.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["json", { outputFile: "qa/playwright-report.json" }]],
  use: {
    baseURL: process.env.QA_BASE ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "ar-desktop", use: { ...devices["Desktop Chrome"], locale: "ar-SA" } },
    { name: "ar-mobile", use: { ...devices["Pixel 7"], locale: "ar-SA" } },
    { name: "en-desktop", use: { ...devices["Desktop Chrome"], locale: "en-GB" } },
  ],
  webServer: {
    command: "npm run start -- --hostname 0.0.0.0 --port 3000",
    url: "http://127.0.0.1:3000/ar",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
