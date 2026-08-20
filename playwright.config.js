// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000, // 60 seconds per test
  expect: {
  timeout: 30000,
  },
  use: {
  actionTimeout: 30000,
  navigationTimeout: 30000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'https://www-qa.goddardschool.com/schools/pa/weatherly/weatherly-i',
    browserName: 'chromium',
    headless: false,
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
reporter: [
['html', { outputFolder: 'playwright-report',
  title: 'Public_Website_Automation_Report'
 }],
]
});
