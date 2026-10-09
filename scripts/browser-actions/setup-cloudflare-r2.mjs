import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("cloudflare.com"));

  console.log("Bringing Cloudflare tab to front...");
  await page.bringToFront();

  // Navigate to R2 overview
  const r2OverviewUrl = "https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/overview";
  console.log(`Navigating to ${r2OverviewUrl}...`);
  await page.goto(r2OverviewUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("URL:", page.url());
  const r2Text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("R2 Snippet:\n", r2Text);
}

main().catch(err => console.error(err));
