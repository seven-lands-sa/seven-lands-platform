import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (page) {
    const text = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('*')).filter(e => e.innerText?.trim() === 'Public Development URL' && e.children.length === 0);
      if (headers.length > 0) {
        return headers[0].parentElement?.parentElement?.innerText || headers[0].parentElement?.innerText;
      }
      return 'Not found';
    });
    console.log('Result:\n', text);
  }
}

main().catch(console.error);
