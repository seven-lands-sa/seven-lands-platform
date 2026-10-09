import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  console.log('Navigating to Vercel tokens page...');
  await page.goto('https://vercel.com/account/tokens');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  const title = await page.title();
  console.log('Page title:', title);

  // Check if we need to click "Create Token" or if input exists
  const createBtn = page.locator('button:has-text("Create"), button:has-text("Create Token")').first();
  if (await createBtn.isVisible()) {
    console.log('Found Create Token button, clicking...');
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Find input for token name
    const tokenInput = page.locator('input[placeholder*="token" i], input[name*="name" i], input[type="text"]').first();
    if (await tokenInput.isVisible()) {
      await tokenInput.fill('seven-lands-ops-cli');
      console.log('Filled token name');
      
      const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Token")').last();
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // Now grab the generated token
      const tokenValueEl = page.locator('code, input[readonly], [data-testid*="token"]');
      const count = await tokenValueEl.count();
      for (let i = 0; i < count; i++) {
        const text = await tokenValueEl.nth(i).innerText().catch(() => '');
        const val = await tokenValueEl.nth(i).getAttribute('value').catch(() => '');
        console.log(`Token candidate ${i}: text="${text}", value="${val}"`);
      }
    }
  }

  // Also extract cookies or check localStorage/session
  const cookies = await context.cookies('https://vercel.com');
  console.log('Found Vercel cookies count:', cookies.length);
  const tokenCookie = cookies.find(c => c.name.includes('token') || c.name.includes('auth'));
  if (tokenCookie) {
    console.log('Found auth cookie:', tokenCookie.name);
  }

  await page.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
