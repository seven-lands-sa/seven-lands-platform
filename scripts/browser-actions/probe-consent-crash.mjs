import { chromium } from 'playwright';

// Reproduces the consent-cookie crash: sets sl_consent, then loads each URL and captures page errors.
const urls = process.argv.slice(2);

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const value = encodeURIComponent(JSON.stringify({ necessary: true, analytics: false, marketing: false, updatedAt: '2026-10-09T00:00:00.000Z' }));
  for (const url of urls) {
    const { hostname } = new URL(url);
    await context.addCookies([{ name: 'sl_consent', value, domain: hostname, path: '/', secure: true, sameSite: 'Lax' }]);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
    try {
      const res = await page.goto(url, { timeout: 30000 });
      await page.waitForTimeout(4000);
      const body = (await page.locator('body').innerText()).slice(0, 120).replace(/\s+/g, ' ');
      console.log(`=== [cookie set] ${url} -> ${res?.status()}\nBODY: ${body}\nERRORS: ${errors.length ? errors.join(' | ') : 'none'}\n`);
    } catch (e) {
      console.log(`=== ${url} FAILED: ${e.message.split('\n')[0]}`);
    }
    await page.close();
    await context.clearCookies({ name: 'sl_consent', domain: hostname });
  }
  process.exit(0);
}
main();
