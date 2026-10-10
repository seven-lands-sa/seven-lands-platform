import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile viewport: iPhone 14
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  
  console.log("Loading https://7-lands.com/ar ...");
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });

  // Accept cookies to dismiss the banner
  const acceptBtn = page.locator('button:has-text("قبول الكل")');
  if (await acceptBtn.isVisible()) {
    console.log("Dismissing cookie consent banner...");
    await acceptBtn.click();
    await page.waitForTimeout(500);
  }

  // Screenshot 1: Mobile Hero with Dock
  await page.screenshot({ path: "scripts/browser-actions/mobile-home-dock.png", fullPage: false });
  console.log("Saved mobile-home-dock.png");

  // Screenshot 2: Scroll to Trust & Photo
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-trust-photo.png", fullPage: false });
  console.log("Saved mobile-trust-photo.png");

  // Screenshot 3: Scroll to Lands System cards
  await page.evaluate(() => window.scrollTo(0, 1550));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-lands-cards.png", fullPage: false });
  console.log("Saved mobile-lands-cards.png");

  // Screenshot 4: Scroll to Craft cards (Multidisciplinary Craft)
  await page.evaluate(() => window.scrollTo(0, 3100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-craft-cards.png", fullPage: false });
  console.log("Saved mobile-craft-cards.png");

  // Screenshot 5: Scroll to Why Section (Workshop photo)
  await page.evaluate(() => window.scrollTo(0, 4100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-why-workshop.png", fullPage: false });
  console.log("Saved mobile-why-workshop.png");

  await browser.close();
}

main().catch(console.error);
