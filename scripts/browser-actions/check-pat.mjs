import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  console.log("Navigating to https://github.com/settings/tokens/new...");
  await page.goto("https://github.com/settings/tokens/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log("Body snippet:", text);
}

main().catch(err => console.error(err));
