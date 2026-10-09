import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("ionos.com"));

  console.log("Bringing IONOS tab to front...");
  await page.bringToFront();

  // Navigate to Email package selection / creation
  console.log("Navigating to https://my.ionos.com/email-package-selection?domain=7-lands.com...");
  await page.goto("https://my.ionos.com/email-package-selection?domain=7-lands.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Look for Email Forwarding "Create" button
  const forwardingSection = page.locator("div:has-text('Email Forwarding'), section:has-text('Email Forwarding')").last();
  const createBtn = forwardingSection.locator("a:has-text('Create'), button:has-text('Create')").first();

  if (await createBtn.count() > 0) {
    console.log("Clicking Create Email Forwarding button...");
    await createBtn.click();
    await page.waitForTimeout(3000);
    console.log("Current page URL:", page.url());
    const snippet = await page.evaluate(() => document.body.innerText.slice(0, 1500));
    console.log("Forwarding creation page snippet:\n", snippet);
  } else {
    console.log("Could not find Create button in Email Forwarding section directly.");
  }
}

main().catch(err => console.error(err));
