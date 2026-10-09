import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('seven-lands-media'));
  if (page) {
    if (!page.url().includes('/settings')) {
      await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/default/buckets/seven-lands-media/settings');
    }
    await page.waitForTimeout(4000);
    const btns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        disabled: b.disabled
      })).filter(b => b.text.length > 0);
    });
    console.log('Buttons:', JSON.stringify(btns, null, 2));
  }
}

main().catch(console.error);
