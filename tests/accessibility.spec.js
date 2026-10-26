// Accessibility scans with axe, checking WCAG 2.2 AA rules on every property.
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { loadProperties, openSite } = require("./helpers");

const WCAG_RULES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Turns axe results into a readable list for the test report
function summarize(violations) {
  return violations.map((v) =>
    `${v.id} (${v.impact}): ${v.help}\n` + v.nodes.slice(0, 3).map((n) => "   " + n.target.join(" ")).join("\n")
  );
}

async function scan(page) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_RULES)
    .exclude(".leaflet-tile-pane")   // map tiles are images from OpenStreetMap, not our content
    .analyze();
  return summarize(results.violations);
}

for (const p of loadProperties()) {
  test.describe(p.name, () => {

    test("page has no WCAG 2.2 AA violations", async ({ page }) => {
      await openSite(page, p.id);
      expect(await scan(page)).toEqual([]);
    });

    test("tour picker has no violations after choosing a time", async ({ page }) => {
      await openSite(page, p.id, "2026-11-02T09:00:00");
      if (page.viewportSize().width < 992) {
        await page.locator(".action-bar .button").click();
        await expect(page.locator("#tourPanel")).toBeVisible();
      }
      await page.locator("#timeList button").first().click();
      expect(await scan(page)).toEqual([]);
    });
  });
}
