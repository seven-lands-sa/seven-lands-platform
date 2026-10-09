import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("vercel.com")) || context.pages()[0];

  console.log("Bringing Vercel tab to front...");
  await page.bringToFront();

  console.log("Navigating to https://vercel.com/new...");
  await page.goto("https://vercel.com/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("Vercel New Project URL:", page.url());
  console.log("Vercel Title:", await page.title());

  const newProjectText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
  console.log("Vercel New Project Snippet:\n", newProjectText);
}

main().catch(err => console.error(err));
