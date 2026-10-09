import { chromium } from "playwright";

async function createForwarder(page, prefix, target) {
  console.log(`Setting up forwarder: ${prefix}@7-lands.com -> ${target}...`);
  await page.goto("https://my.ionos.com/email-forwarding-create?domain=7-lands.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Fill prefix
  const prefixInput = page.locator("input[name*='email' i], input[id*='prefix' i], input[type='text']").first();
  await prefixInput.fill(prefix);

  // Fill destination
  const targetInput = page.locator("input[placeholder*='e-mail address' i], input[name*='target' i]").first();
  await targetInput.fill(target);

  // Click Save
  const saveBtn = page.locator("button:has-text('Save'), input[type='submit'][value='Save']").last();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log(`Saved forwarder for ${prefix}@7-lands.com! Current URL:`, page.url());
}

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("ionos.com"));

  await createForwarder(page, "info", "sevenlands.sa@gmail.com");
  await createForwarder(page, "admin", "sevenlands.sa@gmail.com");

  console.log("ALL IONOS EMAIL FORWARDERS CREATED SUCCESSFULLY!");
}

main().catch(err => console.error(err));
