import { defineConfig, devices } from "@playwright/test";

/**
 * Die Tests laufen gegen den Astro-Dev-Server auf der Styleguide-Seite
 * (`/dev/styleguide`). Die braucht kein Storyblok-Token — deshalb laufen sie
 * auch in Pull Requests aus Forks, wo das Secret nicht verfügbar ist.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4321);

// Normalerweise nimmt Playwright den Browser aus seinem eigenen Cache
// (`npx playwright install chromium`). In Umgebungen, die Chromium schon
// mitbringen — Container, gepinnte CI-Images — zeigt PLAYWRIGHT_CHROMIUM_PATH
// darauf, statt ihn ein zweites Mal herunterzuladen.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: `npx astro dev --port ${PORT}`,
    url: `http://localhost:${PORT}/dev/styleguide`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
