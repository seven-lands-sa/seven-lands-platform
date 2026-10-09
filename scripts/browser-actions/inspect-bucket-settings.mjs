import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('r2'));
  if (page) {
    await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/default/buckets/seven-lands-media/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('Bucket settings URL:', page.url());
    const text = await page.locator('main').innerText().catch(() => page.locator('body').innerText());
    console.log('Settings text snippet:\n', text.substring(0, 1500));
  }
}

main().catch(console.error);
