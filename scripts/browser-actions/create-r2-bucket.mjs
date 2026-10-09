import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('r2/new'));
  if (!page) {
    page = browser.contexts()[0].pages().find(p => p.url().includes('r2'));
    if (page) {
      await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/new');
      await page.waitForLoadState('networkidle');
    }
  }
  if (!page) {
    console.log('No R2 page found');
    return;
  }

  console.log('Current URL:', page.url());
  const input = page.locator('input[name="name"]');
  await input.waitFor({ timeout: 10000 });
  await input.fill('seven-lands-media');
  console.log('Filled bucket name: seven-lands-media');
  await page.waitForTimeout(1000);

  const btn = page.locator('button').filter({ hasText: 'Create bucket' }).last();
  console.log('Is disabled:', await btn.isDisabled());
  if (!(await btn.isDisabled())) {
    await btn.click();
    console.log('Clicked Create bucket button');
    await page.waitForTimeout(5000);
    console.log('Resulting URL:', page.url());
  }
}

main().catch(console.error);
