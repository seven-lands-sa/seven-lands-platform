import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true
  });
  
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });
  
  // Accept cookies
  const acceptBtn = page.locator('button:has-text("قبول الكل")');
  if (await acceptBtn.isVisible()) {
    await acceptBtn.click();
    await page.waitForTimeout(400);
  }

  // Scroll to WorkTeaser heading
  const workHeading = page.locator('#work-heading');
  await workHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-craft-reel.png", fullPage: false });
  console.log("Saved mobile-craft-reel.png");

  // Scroll to WhySection heading
  const whyHeading = page.locator('#why-heading');
  await whyHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/browser-actions/mobile-why-section.png", fullPage: false });
  console.log("Saved mobile-why-section.png");

  // Test tapping Concierge Chat trigger from Dock!
  console.log("Testing tap on Concierge Dock button...");
  const conciergeBtn = page.locator('button[aria-label="محادثة المساعد"]');
  await conciergeBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "scripts/browser-actions/mobile-chat-open.png", fullPage: false });
  console.log("Saved mobile-chat-open.png");

  await browser.close();
}

main().catch(console.error);
