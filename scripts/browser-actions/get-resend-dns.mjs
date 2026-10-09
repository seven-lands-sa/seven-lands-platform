import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com"));

  const manualBtn = page.locator("button:has-text('Manual setup'), a:has-text('Manual setup')").first();
  await manualBtn.click();
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log("Resend Manual DNS Records:\n", text);
}

main().catch(err => console.error(err));
