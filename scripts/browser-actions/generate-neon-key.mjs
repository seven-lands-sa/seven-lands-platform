import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("neon.tech")) || context.pages()[0];

  console.log("On Neon Settings. Finding Create new API key button...");
  const createBtn = page.locator("button:has-text('Create new API key')").first();
  await createBtn.click();
  await page.waitForTimeout(1500);

  // Fill key name
  const nameInput = page.locator("input[placeholder*='key name' i], input[name='name'], input[aria-label*='key' i]").first();
  if (await nameInput.count() > 0) {
    await nameInput.fill("SevenLandsDevOps");
    console.log("Filled key name.");
  }

  // Click Submit / Create button in modal
  const submitBtn = page.locator("button[type='submit'], button:has-text('Create'), button:has-text('Generate')").last();
  await submitBtn.click();
  await page.waitForTimeout(3000);

  // Extract key value
  const keyInput = page.locator("input[readonly], textarea[readonly], [data-testid*='key'], code").last();
  const text = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input, textarea, code")).map(i => i.value || i.innerText || "");
    const match = inputs.find(v => v.length > 20 && !v.includes(" ") && !v.includes("http"));
    return match || "";
  });

  if (text) {
    fs.writeFileSync("scripts/browser-actions/.neon-key.tmp", text.trim(), "utf-8");
    console.log("NEON_API_KEY_CAPTURED_SUCCESSFULLY! Length:", text.trim().length);
  } else {
    console.log("Could not find key automatically. Modal text:\n", await page.evaluate(() => document.body.innerText.slice(0, 1000)));
  }
}

main().catch(err => console.error(err));
