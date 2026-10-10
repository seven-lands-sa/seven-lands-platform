import { chromium } from 'playwright';

async function testSuperAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log("Navigating to https://7-lands.com/admin/login ...");
  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const email = page.locator('input[type="email"], input[name="email"]').first();
  const password = page.locator('input[type="password"], input[name="password"]').first();
  const submit = page.locator('button[type="submit"]').first();

  await email.fill("admin@7-lands.com");
  await password.fill("SevenLands#2026!SecureRootAdmin");
  await submit.click();
  await page.waitForTimeout(4000);

  console.log("URL after login:", page.url());

  console.log("Navigating to https://7-lands.com/admin/globals/site-settings ...");
  await page.goto("https://7-lands.com/admin/globals/site-settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  console.log("URL at site settings:", page.url());
  console.log("Page title:", await page.title());

  await page.screenshot({ path: "scripts/browser-actions/live-site-settings-verified.png" });
  console.log("Saved screenshot: scripts/browser-actions/live-site-settings-verified.png");

  console.log("\nConsole errors encountered:", errors.length);
  errors.forEach(e => console.log("  [Error]", e));

  await browser.close();
}

testSuperAdmin().catch(console.error);
