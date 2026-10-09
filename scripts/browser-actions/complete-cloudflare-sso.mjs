import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("accounts.google.com") || p.url().includes("cloudflare.com"));

  console.log("Current page on OAuth:", page.url());
  const accountItem = page.locator("[data-email='sevenlands.sa@gmail.com'], div:has-text('sevenlands.sa@gmail.com')").last();
  if (await accountItem.count() > 0) {
    console.log("Found account item for sevenlands.sa@gmail.com, clicking...");
    await accountItem.click();
  } else {
    console.log("No specific data-email item, looking for continue button...");
    const continueBtn = page.locator("button:has-text('Continue'), button:has-text('Next')").first();
    if (await continueBtn.count() > 0) await continueBtn.click();
  }

  await page.waitForTimeout(6000);
  console.log("URL after OAuth flow:", page.url());
  console.log("Page title:", await page.title());
}

main().catch(err => console.error(err));
