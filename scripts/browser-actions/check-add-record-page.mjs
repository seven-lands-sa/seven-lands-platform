import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  console.log('Current URL:', page.url());
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="button"], h2, h3, h4')).map(el => ({
      tag: el.tagName,
      text: el.innerText.trim(),
      href: el.getAttribute('href')
    })).filter(el => el.text.length > 0 && el.text.length < 50);
  });
  console.log('Elements on page:', JSON.stringify(elements.slice(0, 30), null, 2));
}

main().catch(console.error);
