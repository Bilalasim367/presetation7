import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const webServer = process.env.PW_NO_SERVER
  ? undefined
  : {
      command: "npm run build && npm run preview:test",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      stdout: "pipe" as const,
      stderr: "pipe" as const,
    };

/**
 * Chrome is the presentation browser. Edge is included when Playwright can
 * find the installed channel (`PW_EDGE=1` forces it, `PW_EDGE=0` disables it).
 * Layout-only projects cover the other projector and 4:3 aspect ratios.
 */
const edgeEnabled = process.env.PW_EDGE !== "0";
const firefoxEnabled = process.env.PW_FIREFOX === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 35_000,
  expect: { timeout: 6_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    colorScheme: "dark",
  },
  ...(webServer ? { webServer } : {}),
  projects: [
    {
      name: "chrome-1920x1080",
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
    ...(edgeEnabled
      ? [
          {
            name: "edge-1920x1080",
            testMatch: /navigation\.spec\.ts/,
            use: { ...devices["Desktop Edge"], viewport: { width: 1920, height: 1080 } },
          },
        ]
      : []),
    ...(firefoxEnabled
      ? [
          {
            name: "firefox-1920x1080",
            testMatch: /navigation\.spec\.ts/,
            use: { ...devices["Desktop Firefox"], viewport: { width: 1920, height: 1080 } },
          },
        ]
      : []),
    {
      name: "chrome-1366x768",
      testMatch: /layout\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
    {
      name: "chrome-1280x720",
      testMatch: /layout\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      name: "chrome-1024x768",
      testMatch: /layout\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } },
    },
  ],
});
