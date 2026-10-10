import { chromium } from 'playwright';

async function main() {
  console.log('=== VERIFYING LIVE DEPLOYMENT ON 7-LANDS.COM ===');

  // 1. Check HTTP Permissions-Policy Header
  const res = await fetch('https://7-lands.com');
  const permPolicy = res.headers.get('permissions-policy');
  console.log('Live Permissions-Policy header:', permPolicy);

  // 2. Browser check
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('\nLogging into admin without any manual action...');
  await page.goto('https://7-lands.com/admin/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill('admin@7-lands.com');
  await page.locator('input[type="password"]').first().fill('SevenLands#2026!SecureRootAdmin');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
  await page.waitForTimeout(4000);

  const adminState = await page.evaluate(() => {
    const nav = document.querySelector('.nav');
    const wrap = document.querySelector('.template-default__wrap');
    return {
      nav: nav?.getBoundingClientRect(),
      wrap: wrap?.getBoundingClientRect(),
      navOpacity: nav ? window.getComputedStyle(nav).opacity : null,
      navVisibility: nav ? window.getComputedStyle(nav).visibility : null,
      navDisplay: nav ? window.getComputedStyle(nav).display : null,
    };
  });

  console.log('LIVE ADMIN STATE:', JSON.stringify(adminState, null, 2));
  await page.screenshot({ path: 'scripts/browser-actions/live-admin-verified-rtl.png' });
  console.log('✓ Saved live-admin-verified-rtl.png');

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

main().catch(console.error);
