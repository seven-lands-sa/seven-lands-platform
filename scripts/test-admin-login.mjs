import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log("Navigating to https://7-lands.com/admin/login ...");
  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log("Current page title:", await page.title());
  await page.screenshot({ path: "scripts/browser-actions/admin-login-screen.png" });
  console.log("Saved admin-login-screen.png");

  // Fill login
  console.log("Submitting login credentials...");
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  
  if (await emailInput.isVisible()) {
    await emailInput.fill("admin@7-lands.com");
    await passwordInput.fill("SevenLands#2026!SecureRootAdmin");
    
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(5000);

    console.log("Post-login URL:", page.url());
    console.log("Post-login title:", await page.title());
    await page.screenshot({ path: "scripts/browser-actions/admin-dashboard.png" });
    console.log("Saved admin-dashboard.png");
  } else {
    console.log("Email input not visible; may already be authenticated or on another view.");
  }

  await browser.close();
}

main().catch(console.error);
