import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Logging in to live admin...');
  await page.goto('https://7-lands.com/admin/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill('admin@7-lands.com');
  await page.locator('input[type="password"]').first().fill('SevenLands#2026!SecureRootAdmin');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
  await page.waitForTimeout(4000);

  // If nav toggler exists and nav is closed, open it to capture full view
  const isNavOpen = await page.evaluate(() => document.querySelector('.nav')?.classList.contains('nav--nav-open'));
  if (!isNavOpen) {
    const toggler = await page.$('.nav-toggler');
    if (toggler) await toggler.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'scripts/browser-actions/live-admin-final-rtl.png' });
  console.log('✓ Successfully saved final live screenshot to scripts/browser-actions/live-admin-final-rtl.png');

  await browser.close();
}

main().catch(console.error);
