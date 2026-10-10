import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://7-lands.com/admin/login');
  await page.fill('input[type="email"], input[name="email"]', 'admin@7-lands.com');
  await page.fill('input[type="password"], input[name="password"]', 'SevenLands#2026!SecureRootAdmin');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      outerHTML: img.outerHTML.slice(0, 150)
    }));
  });
  console.log('Images found:', images);
  
  // Open the sidebar / nav drawer to see how the sidebar looks!
  const navToggle = page.locator('button.nav-toggler, button[aria-label*="menu"], button[aria-label*="قائمة"]').first();
  if (await navToggle.isVisible()) {
    console.log("Clicking nav toggle...");
    await navToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/browser-actions/admin-sidebar-open.png' });
    console.log("Saved admin-sidebar-open.png");
  }

  await browser.close();
}

main().catch(console.error);
