import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3106",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run preview -- --port 3106",
      cwd: import.meta.dirname,
      url: "http://127.0.0.1:3106",
      reuseExistingServer: false,
    },
    {
      // The real SDK is exercised against intercepted endpoints with a synthetic token.
      command: "npm exec -- vite --host 127.0.0.1 --port 3107 --strictPort",
      cwd: import.meta.dirname,
      url: "http://127.0.0.1:3107",
      reuseExistingServer: false,
      env: {
        VITE_POSTHOG_PROJECT_TOKEN: "phc_synthetic_browser_test",
        VITE_POSTHOG_HOST: "https://eu.i.posthog.com",
        VITE_POSTHOG_ALLOWED_ORIGIN: "https://analytics.example",
      },
    },
  ],
});
