// Visual regression tests: compare every theme to its last approved screenshot.
// If a change to the shared code alters how any property looks, this fails and
// saves a picture of the difference in the test report.
//
// After an intended design change, approve the new look with:
//   npm run test:update-screenshots
const { test, expect } = require("@playwright/test");
const { loadProperties, openSite } = require("./helpers");

const FIXED_TIME = "2026-11-02T09:00:00";   // same dates in the tour picker every run

for (const p of loadProperties()) {
  test(`${p.name} looks the same as the approved version`, async ({ page }) => {
    await openSite(page, p.id, FIXED_TIME);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${p.id}.png`, {
      fullPage: true,
      mask: [page.locator("#map")]            // map tiles come from the internet and can change
    });
  });
}
