import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("cloudflare.com")) || context.pages()[0];

  console.log("Bringing Cloudflare tab to front and clicking Google login...");
  await page.bringToFront();

  const googleBtn = page.locator("button:has-text('Google'), a:has-text('Google'), [data-provider='google']").first();
  if (await googleBtn.count() > 0) {
    await googleBtn.click();
    console.log("Clicked Google SSO button on Cloudflare.");
  } else {
    console.log("Google button not found by text.");
  }

  await page.waitForTimeout(5000);
  console.log("Current page URL:", page.url());
  console.log("Current page title:", await page.title());
}

main().catch(err => console.error(err));
