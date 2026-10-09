import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  console.log("Navigating to https://7-lands.com/ar ...");
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });

  console.log("Page Title:", await page.title());
  console.log("Console Errors Count:", consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log("Errors:", consoleErrors);
  }

  // Check Chat Widget
  const chatBtn = page.locator('button[aria-label*="محادثة"]').first();
  const chatVisible = await chatBtn.isVisible();
  console.log("Chat widget button visible:", chatVisible);

  if (chatVisible) {
    await chatBtn.click();
    await page.waitForTimeout(1000);
    const chatModal = page.locator("text=مستشار سفن لاند");
    console.log("Chat modal visible after click:", await chatModal.isVisible());
  }

  await page.screenshot({ path: "scripts/browser-actions/live-final-verification.png", fullPage: false });
  console.log("Screenshot saved to live-final-verification.png");

  await browser.close();
}

main().catch(console.error);
