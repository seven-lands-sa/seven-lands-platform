import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (page) {
    const tabs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).filter(el => {
        const text = el.innerText?.trim();
        return ['Settings', 'Objects', 'Metrics'].includes(text);
      }).map(el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }));
    });
    console.log('Bucket navigation:', tabs);
  }
}

main().catch(console.error);
