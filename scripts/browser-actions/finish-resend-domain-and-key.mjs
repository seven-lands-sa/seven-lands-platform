import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com")) || context.pages()[0];

  console.log("Bringing Resend to front...");
  await page.bringToFront();

  // 1. Complete adding 7-lands.com
  console.log("Navigating to https://resend.com/domains/add...");
  await page.goto("https://resend.com/domains/add", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const domainInput = page.locator("input[placeholder*='domain' i], input[name='name'], input[id='name']").first();
  await domainInput.fill("7-lands.com");
  console.log("Filled domain 7-lands.com");

  const submitDomain = page.locator("button[type='submit']:has-text('Add domain'), button:has-text('Add domain')").last();
  await submitDomain.click();
  await page.waitForTimeout(4000);

  console.log("URL after submitting domain:", page.url());
  const dnsDetails = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr, [role='row']"));
    return rows.map(r => Array.from(r.querySelectorAll("td, [role='cell'], th")).map(c => c.innerText.trim()));
  });
  console.log("Resend DNS Records required:\n", JSON.stringify(dnsDetails, null, 2));

  // 2. Create fresh API key and capture full value
  console.log("Navigating to https://resend.com/api-keys...");
  await page.goto("https://resend.com/api-keys", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const createKeyBtn = page.locator("button:has-text('Create API key'), a:has-text('Create API key')").first();
  await createKeyBtn.click();
  await page.waitForTimeout(1500);

  const keyNameInput = page.locator("input[name='name'], input[placeholder*='name' i]").first();
  await keyNameInput.fill("SevenLandsProdKey");

  const addKeyBtn = page.locator("button[type='submit']:has-text('Add'), button:has-text('Add')").last();
  await addKeyBtn.click();
  await page.waitForTimeout(2500);

  // Read key value from modal
  const keyValue = await page.evaluate(() => {
    const input = document.querySelector("input[readonly], [data-testid*='key'] input, input[value^='re_']");
    if (input) return input.value;
    const allInputs = Array.from(document.querySelectorAll("input")).map(i => i.value).filter(v => v.startsWith("re_"));
    if (allInputs.length) return allInputs[0];
    const codes = Array.from(document.querySelectorAll("code, [data-copy-hint]")).map(c => c.innerText.trim()).filter(c => c.startsWith("re_"));
    return codes[0] || null;
  });

  if (keyValue) {
    fs.writeFileSync("scripts/browser-actions/.resend-key.tmp", keyValue, "utf-8");
    console.log("RESEND_KEY_CAPTURED_SUCCESSFULLY! Length:", keyValue.length, "Prefix:", keyValue.slice(0, 7));
  } else {
    console.log("Could not find key value in modal. Modal text:\n", await page.evaluate(() => document.body.innerText.slice(0, 1000)));
  }
}

main().catch(err => console.error(err));
