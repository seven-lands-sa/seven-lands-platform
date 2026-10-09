import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com")) || context.pages()[0];

  console.log("Bringing Resend page to front...");
  await page.bringToFront();
  await page.goto("https://resend.com/domains", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("Resend Domains URL:", page.url());
  const domainsText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("Resend Domains Content:\n", domainsText);

  // Check API keys
  console.log("Navigating to https://resend.com/api-keys...");
  await page.goto("https://resend.com/api-keys", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("Resend API Keys URL:", page.url());
  const keysText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log("Resend API Keys Content:\n", keysText);
}

main().catch(err => console.error(err));
