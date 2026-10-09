import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  console.log("Navigating to https://github.com/settings/emails...");
  await page.goto("https://github.com/settings/emails", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log("GitHub Emails Settings Page (first 1500 chars):");
  console.log(text.slice(0, 1500));
}

main().catch(err => console.error(err));
