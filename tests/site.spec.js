// Behavior tests: does each part of the site work, for every property?
const { test, expect } = require("@playwright/test");
const { loadProperties, openSite, toMinutes, money } = require("./helpers");

const isPhone = (page) => page.viewportSize().width < 992;

// On phones the tour picker is in a slide up sheet, so open it first
async function openTourPicker(page) {
  if (isPhone(page)) {
    await page.locator(".action-bar .button").click();
    await expect(page.locator("#tourPanel")).toBeVisible();
  }
}

for (const p of loadProperties()) {
  test.describe(p.name, () => {

    test("shows this property's content and theme", async ({ page }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await openSite(page, p.id);

      await expect(page).toHaveTitle(new RegExp("^" + p.name));
      await expect(page.locator("h1")).toHaveText(p.headline);
      await expect(page.locator(".promo")).toContainText(p.special.text);
      await expect(page.locator("html")).toHaveAttribute("data-theme", p.theme);
      await expect(page.locator("#planList .plan-card")).toHaveCount(p.floorPlans.length);
      await expect(page.locator("#factList .fact")).toHaveCount(p.facts.length);
      await expect(page.locator("#amenityList li")).toHaveCount(p.amenities.length);
      expect(errors).toEqual([]);
    });

    test("bedroom filter shows only matching floor plans", async ({ page }) => {
      await openSite(page, p.id);
      const bedCounts = [...new Set(p.floorPlans.map((plan) => plan.beds))];

      for (const beds of bedCounts) {
        const button = page.locator(`#bedButtonList [data-beds="${beds}"]`);
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
        const expected = p.floorPlans.filter((plan) => plan.beds === beds).length;
        await expect(page.locator("#planList .plan-card")).toHaveCount(expected);
        await button.click();   // tap again to clear
        await expect(page.locator("#planList .plan-card")).toHaveCount(p.floorPlans.length);
      }
    });

    test("max rent options come from this property's prices", async ({ page }) => {
      await openSite(page, p.id);
      const rents = p.floorPlans.map((plan) => plan.rent);
      const expected = ["No max"];
      for (let max = Math.ceil(Math.min(...rents) / 500) * 500; max < Math.max(...rents); max += 500) {
        expected.push(money(max));
      }
      await expect(page.locator("#maxRent option")).toHaveText(expected);
    });

    test("pricing total adds rent and the chosen fees", async ({ page }) => {
      await openSite(page, p.id);
      const rentable = p.floorPlans.filter((plan) => plan.available > 0);

      for (let i = 0; i < rentable.length; i++) {
        await page.locator("#pricePlan").selectOption(String(i));
        const fees = p.fees.monthly
          .filter((fee) => !fee.optional || fee.checked)
          .reduce((sum, fee) => sum + fee.amount, 0);
        await expect(page.locator("#priceTotal")).toHaveText(money(rentable[i].rent + fees));
      }

      // Turning an optional fee on or off changes the total by that amount
      const optional = p.fees.monthly.filter((fee) => fee.optional);
      if (optional.length) {
        const before = await page.locator("#priceTotal").textContent();
        await page.locator("#feeOptionList input").first().click();
        const change = optional[0].checked ? -optional[0].amount : optional[0].amount;
        const after = Number(before.replace(/\D/g, "")) + change;
        await expect(page.locator("#priceTotal")).toHaveText(money(after));
      }
    });

    test("tour picker hides times that already passed today", async ({ page }) => {
      await openSite(page, p.id, "2026-11-02T16:40:00");   // a Monday at 4:40 pm
      await openTourPicker(page);
      const now = 16 * 60 + 40;

      for (let t = 0; t < p.tour.types.length; t++) {
        await page.locator("#tourTypeList button").nth(t).click();
        await page.locator("#dayList button").nth(0).click();   // today
        const later = p.tour.types[t].times.filter((time) => toMinutes(time) > now);
        if (later.length) {
          await expect(page.locator("#timeList button")).toHaveText(later);
        } else {
          await expect(page.locator("#timeList")).toContainText("No times left today");
        }
        await page.locator("#dayList button").nth(1).click();   // tomorrow
        await expect(page.locator("#timeList button")).toHaveText(p.tour.types[t].times);
      }
    });

    test("booking a tour confirms the choice", async ({ page }) => {
      await openSite(page, p.id, "2026-11-02T09:00:00");
      await openTourPicker(page);
      const submit = page.locator("#tourSubmit");
      await expect(submit).toBeDisabled();

      const firstTime = p.tour.types[0].times[0];
      await page.locator("#timeList button").first().click();
      await expect(submit).toHaveText("Continue with today at " + firstTime);
      await submit.click();
      await expect(page.locator("#tourDone")).toContainText("Request received");
    });

    test("travel mode switch updates neighborhood times", async ({ page }) => {
      await openSite(page, p.id);
      for (const mode of ["walk", "bike", "drive"]) {
        await page.locator(`#travelModeList [data-mode="${mode}"]`).click();
        await expect(page.locator("#placeList strong")).toHaveText(p.neighborhood.places.map((place) => place[mode]));
      }
    });

    test("phone action bar shows only on phones", async ({ page }) => {
      await openSite(page, p.id);
      if (isPhone(page)) {
        await expect(page.locator(".action-bar")).toBeVisible();
        await expect(page.locator(".action-bar .js-phone")).toHaveAttribute("href", "tel:+1" + p.phone.replace(/\D/g, ""));
      } else {
        await expect(page.locator(".action-bar")).toBeHidden();
        await expect(page.locator("#tourForm")).toBeVisible();   // picker sits in the page on desktop
      }
    });
  });
}

test.describe("Loading a property", () => {
  for (const bad of ["harbr", "../properties/harbor"]) {
    test(`unknown name "${bad}" falls back to the default`, async ({ page }) => {
      await page.goto("/?property=" + encodeURIComponent(bad));
      await page.locator("#planList .plan-card").first().waitFor();
      await expect(page).toHaveTitle(/^The Mesa/);
    });
  }
});
