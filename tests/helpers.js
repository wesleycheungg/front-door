// Shared helpers for the tests.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Reads every file in properties/ so the tests automatically cover new properties.
function loadProperties() {
  const dir = path.join(__dirname, "..", "properties");
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => {
      const sandbox = { window: {} };
      vm.runInNewContext(fs.readFileSync(path.join(dir, file), "utf8"), sandbox);
      return { id: file.replace(".js", ""), ...sandbox.window.PROPERTY };
    });
}

// Opens the site for one property and waits until it has filled in.
// Pass a time (like "2026-11-02T18:40:00") to freeze the browser clock.
async function openSite(page, propertyId, time) {
  if (time) await page.clock.setFixedTime(new Date(time + "-08:00"));
  await page.goto("/?property=" + propertyId);
  await page.locator("#planList .plan-card").first().waitFor();
}

// Same math the site uses, written separately so the test is an independent check.
function toMinutes(time) {
  const [, h, m, ampm] = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  return (Number(h) % 12 + (ampm.toLowerCase() === "pm" ? 12 : 0)) * 60 + Number(m);
}

const money = (n) => "$" + n.toLocaleString("en-US");

module.exports = { loadProperties, openSite, toMinutes, money };
