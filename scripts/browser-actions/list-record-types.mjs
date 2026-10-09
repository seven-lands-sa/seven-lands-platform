import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  console.log('Page URL:', page.url());
  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="link"], [role="button"]')).map(el => ({
      text: el.innerText.trim().replace(/\n+/g, ' '),
      href: el.getAttribute('href')
    })).filter(el => el.text.length > 0 && el.text.length < 80);
  });

  console.log('Cards found:', JSON.stringify(cards.filter(c => c.text.includes('A') || c.text.includes('CNAME') || c.text.includes('TXT') || c.text.includes('MX')), null, 2));
}

main().catch(console.error);
