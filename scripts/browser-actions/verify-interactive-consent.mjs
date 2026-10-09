import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  console.log('1. Navigating to https://www.7-lands.com/ar ...');
  await page.goto('https://www.7-lands.com/ar', { waitUntil: 'networkidle', timeout: 30000 });
  
  const acceptBtn = page.locator('button:has-text("قبول الكل")').first();
  if (await acceptBtn.isVisible()) {
    console.log('2. Clicking "قبول الكل" ...');
    await acceptBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('3. Reloading page with saved consent cookie ...');
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const title = await page.title();
  console.log('4. Page Title:', title);
  console.log('5. Console/Page Errors:', errors.length ? errors : 'NONE (0 errors!)');

  await page.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
