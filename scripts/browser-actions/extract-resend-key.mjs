import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com"));

  console.log("Navigating to https://resend.com/api-keys...");
  await page.goto("https://resend.com/api-keys", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const createBtn = page.locator("button:has-text('Create API key'), a:has-text('Create API key')").first();
  await createBtn.click();
  await page.waitForTimeout(1500);

  const nameInput = page.locator("input[name='name'], input[placeholder*='name' i]").first();
  await nameInput.fill("SevenLandsProductionKey2");

  const addBtn = page.locator("button[type='submit']:has-text('Add'), button:has-text('Add')").last();
  await addBtn.click();
  await page.waitForTimeout(2500);

  const keyText = await page.evaluate(() => {
    const input = document.querySelector("input[readonly]");
    if (input) return input.value;
    const code = document.querySelector("code");
    if (code) return code.innerText;
    return null;
  });

  console.log("Key extracted:", keyText ? `${keyText.slice(0, 10)}... (length: ${keyText.length})` : "none");
  if (keyText && keyText.startsWith("re_")) {
    fs.writeFileSync("scripts/browser-actions/.resend-key.tmp", keyText.trim(), "utf-8");
    console.log("SAVED_RESEND_KEY_SUCCESSFULLY");
  }
}

main().catch(err => console.error(err));
