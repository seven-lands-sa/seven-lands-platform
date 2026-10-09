import { chromium } from 'playwright';

const urls = process.argv.slice(2);

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  for (const url of urls) {
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 400)); });
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 400)));
    try {
      const res = await page.goto(url, { timeout: 30000, waitUntil: 'load' });
      await page.waitForTimeout(4000);
      const body = (await page.locator('body').innerText()).slice(0, 200).replace(/\s+/g, ' ');
      console.log(`\n=== ${url} -> ${res?.status()} | ${page.url()}`);
      console.log('BODY:', body);
      console.log('ERRORS:', errors.length ? errors : 'none');
    } catch (e) {
      console.log(`\n=== ${url} FAILED: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
  process.exit(0);
}
main();
