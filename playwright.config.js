// Playwright test settings for Front Door.
// Run everything:        npm test
// Run Chrome only:       npm run test:chrome
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:8080",
    timezoneId: "America/Los_Angeles",
    reducedMotion: "reduce",           // no smooth scrolling, so screenshots are steady
    trace: "retain-on-failure"         // saves a step by step replay when a test fails
  },

  // Starts a small local web server before the tests run
  webServer: {
    command: "npx http-server . -p 8080 -c-1 --silent",
    url: "http://localhost:8080",
    reuseExistingServer: true
  },

  // Every test runs in each of these browsers and screen sizes.
  // Screenshot comparisons only run in Chrome, so there is one set of saved images per screen size.
  projects: [
    { name: "desktop-chrome",  use: { ...devices["Desktop Chrome"],  viewport: { width: 1440, height: 900 } } },
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } }, testIgnore: /visual/ },
    { name: "desktop-safari",  use: { ...devices["Desktop Safari"],  viewport: { width: 1440, height: 900 } }, testIgnore: /visual/ },
    { name: "phone-chrome",    use: { ...devices["Pixel 7"] } },
    { name: "phone-safari",    use: { ...devices["iPhone 14"] }, testIgnore: /visual/ }
  ],

  expect: {
    // Allow at most 100 changed pixels. A percentage looked safer, but 1% of a
    // full page is about 60,000 pixels, enough to hide every button changing shape.
    toHaveScreenshot: { maxDiffPixels: 100 }
  }
});
