import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("cloudflare.com")) || context.pages()[0];

  console.log("Navigating to Cloudflare R2...");
  await page.goto("https://dash.cloudflare.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("Dashboard URL:", page.url());
  const accountIdMatch = page.url().match(/dash\.cloudflare\.com\/([a-f0-9]{32})/);
  const accountId = accountIdMatch ? accountIdMatch[1] : null;
  console.log("Cloudflare Account ID:", accountId);

  if (accountId) {
    const r2Url = `https://dash.cloudflare.com/${accountId}/r2/overview`;
    console.log(`Navigating to ${r2Url}...`);
    await page.goto(r2Url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    console.log("R2 Page Title:", await page.title());
    const r2Text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
    console.log("R2 Content Snippet:\n", r2Text);
  }
}

main().catch(err => console.error(err));
