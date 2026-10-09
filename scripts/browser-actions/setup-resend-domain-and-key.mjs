import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com")) || context.pages()[0];

  console.log("Bringing Resend tab to front...");
  await page.bringToFront();

  // 1. Create API Key
  console.log("Navigating to https://resend.com/api-keys...");
  await page.goto("https://resend.com/api-keys", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const createKeyBtn = page.locator("button:has-text('Create API key'), a:has-text('Create API key')").first();
  if (await createKeyBtn.count() > 0) {
    console.log("Clicking Create API key...");
    await createKeyBtn.click();
    await page.waitForTimeout(1500);

    // Name the key
    const nameInput = page.locator("input[placeholder*='name' i], input[name='name']").first();
    if (await nameInput.count() > 0) {
      await nameInput.fill("Seven Lands Platform Production");
    }

    // Submit
    const addBtn = page.locator("button[type='submit'], button:has-text('Add')").last();
    await addBtn.click();
    await page.waitForTimeout(3000);

    // Extract key value
    const text = await page.evaluate(() => document.body.innerText);
    const match = text.match(/re_[a-zA-Z0-9_]{32,}/);
    if (match) {
      fs.writeFileSync("scripts/browser-actions/.resend-key.tmp", match[0], "utf-8");
      console.log("RESEND_API_KEY_CAPTURED_SUCCESSFULLY! Starts with:", match[0].slice(0, 7));
    } else {
      console.log("Resend key not matched in text snippet:", text.slice(0, 500));
    }
  }

  // 2. Add Domain 7-lands.com
  console.log("Navigating to https://resend.com/domains...");
  await page.goto("https://resend.com/domains", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const addDomainBtn = page.locator("button:has-text('Add domain'), a:has-text('Add domain')").first();
  if (await addDomainBtn.count() > 0) {
    console.log("Clicking Add domain...");
    await addDomainBtn.click();
    await page.waitForTimeout(1500);

    const domainInput = page.locator("input[placeholder*='domain' i], input[name='name']").first();
    if (await domainInput.count() > 0) {
      await domainInput.fill("7-lands.com");
      console.log("Filled domain 7-lands.com");
    }

    const saveDomainBtn = page.locator("button[type='submit'], button:has-text('Add domain')").last();
    await saveDomainBtn.click();
    await page.waitForTimeout(4000);

    console.log("Domain page URL after add:", page.url());
    const domainDetailsText = await page.evaluate(() => document.body.innerText);
    console.log("Domain DNS instructions snippet:\n", domainDetailsText.slice(0, 1500));
  }
}

main().catch(err => console.error(err));
