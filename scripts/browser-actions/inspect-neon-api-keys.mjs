import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("neon.tech")) || context.pages()[0];

  console.log("Navigating to Neon user settings for API keys...");
  await page.goto("https://console.neon.tech/app/settings/api-keys", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("Current URL:", page.url());
  console.log("Current Title:", await page.title());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("Neon API Keys Page Snippet:\n", text);
}

main().catch(err => console.error(err));
