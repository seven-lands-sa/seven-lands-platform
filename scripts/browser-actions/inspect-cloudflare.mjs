import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("cloudflare.com")) || context.pages()[0];

  console.log("Bringing Cloudflare page to front...");
  await page.bringToFront();
  await page.waitForTimeout(3000);

  console.log("Cloudflare URL:", page.url());
  console.log("Cloudflare Title:", await page.title());

  const cfText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("Cloudflare Snippet:\n", cfText);
}

main().catch(err => console.error(err));
