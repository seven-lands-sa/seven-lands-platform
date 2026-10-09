import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('choose-dns-record-type'));
  if (page) {
    const text = await page.locator('body').innerText();
    console.log('Page content:\n', text.substring(0, 1500));
  }
}

main().catch(console.error);
