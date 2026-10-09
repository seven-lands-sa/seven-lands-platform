import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("vercel.com")) || context.pages()[0];

  console.log("Bringing Vercel page to front...");
  await page.bringToFront();
  await page.goto("https://vercel.com/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("Vercel URL:", page.url());
  console.log("Vercel Title:", await page.title());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("Vercel Snippet:\n", text);
}

main().catch(err => console.error(err));
