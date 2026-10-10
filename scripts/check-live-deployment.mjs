import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Mobile viewport (iPhone 14 / modern smartphone)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  
  console.log("Loading mobile page https://7-lands.com/ar ...");
  const response = await mobilePage.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  console.log("Response status:", response?.status());
  console.log("Vercel deployment header (x-vercel-id):", response?.headers()["x-vercel-id"]);
  
  // Check if MobileAppDock is present
  const dock = await mobilePage.$('nav[aria-label="التنقل السريع للجوال"]');
  console.log("MobileAppDock found in live DOM:", Boolean(dock));
  
  // Check if craft cards are present
  const craftCards = await mobilePage.$$('img[src*="/media/craft/"]');
  console.log("Craft photography cards count in live DOM:", craftCards.length);
  
  // Take mobile screenshot
  await mobilePage.screenshot({ path: "scripts/browser-actions/mobile-home.png", fullPage: false });
  console.log("Saved mobile screenshot to scripts/browser-actions/mobile-home.png");
  
  // Scroll down and screenshot the lands section and craft section
  await mobilePage.evaluate(() => window.scrollBy(0, 1000));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: "scripts/browser-actions/mobile-lands.png", fullPage: false });
  console.log("Saved mobile lands screenshot to scripts/browser-actions/mobile-lands.png");
  
  await mobilePage.evaluate(() => window.scrollBy(0, 1400));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: "scripts/browser-actions/mobile-craft.png", fullPage: false });
  console.log("Saved mobile craft screenshot to scripts/browser-actions/mobile-craft.png");

  // Also check /ar/services
  await mobilePage.goto("https://7-lands.com/ar/services", { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: "scripts/browser-actions/mobile-services.png", fullPage: false });
  console.log("Saved mobile services screenshot to scripts/browser-actions/mobile-services.png");

  await browser.close();
}

main().catch(console.error);
