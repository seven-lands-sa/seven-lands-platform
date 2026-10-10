import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  console.log("Logging into admin...");
  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', "admin@7-lands.com");
  await page.fill('input[type="password"], input[name="password"]', "SevenLands#2026!SecureRootAdmin");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  // 1. Pages list
  console.log("Navigating to Pages collection...");
  await page.goto("https://7-lands.com/admin/collections/pages", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "scripts/browser-actions/tour-pages-list.png" });

  // 2. Services (The 7 Lands)
  console.log("Navigating to Services collection...");
  await page.goto("https://7-lands.com/admin/collections/services", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "scripts/browser-actions/tour-services-list.png" });

  // 3. Global Site Settings
  console.log("Navigating to Global Site Settings...");
  await page.goto("https://7-lands.com/admin/globals/site-settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "scripts/browser-actions/tour-site-settings.png" });

  // 4. Tracking & Analytics
  console.log("Navigating to Tracking Settings...");
  await page.goto("https://7-lands.com/admin/globals/tracking-settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "scripts/browser-actions/tour-tracking-settings.png" });

  // 5. Leads
  console.log("Navigating to Leads collection...");
  await page.goto("https://7-lands.com/admin/collections/leads", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "scripts/browser-actions/tour-leads-list.png" });

  console.log("All tour screenshots captured successfully!");
  await browser.close();
}

main().catch(console.error);
