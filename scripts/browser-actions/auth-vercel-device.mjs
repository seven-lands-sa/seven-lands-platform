import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  const code = process.argv[2] || 'NBMG-FSFG';
  const url = `https://vercel.com/oauth/device?user_code=${code}`;
  console.log('Navigating to', url);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Page title:', await page.title());
  const bodyText = await page.locator('body').innerText();
  console.log('Body snippet:', bodyText.substring(0, 300));

  const btn = page.locator('button:has-text("Allow Access"), button:has-text("Authorize"), button:has-text("Confirm")').first();
  if (await btn.isVisible()) {
    console.log('Found button:', await btn.innerText());
    await btn.click();
    await page.waitForTimeout(3000);
    console.log('Clicked authorize successfully!');
  } else {
    // If not button, look for any element with text Allow Access
    const anyEl = page.getByText('Allow Access', { exact: true }).first();
    if (await anyEl.isVisible()) {
      console.log('Clicking Allow Access element...');
      await anyEl.click();
      await page.waitForTimeout(3000);
      console.log('Clicked Allow Access!');
    } else {
      console.log('Button not visible, current URL:', page.url());
    }
  }

  await page.close();
}

main().catch(console.error);
