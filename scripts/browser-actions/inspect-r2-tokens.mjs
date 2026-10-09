import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('r2'));
  if (page) {
    await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/api-tokens');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('API Tokens URL:', page.url());
    const btns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a')).map(b => ({
        text: b.innerText.trim(),
        href: b.getAttribute('href')
      })).filter(b => b.text.length > 0 && b.text.length < 50);
    });
    console.log('Buttons on tokens page:', JSON.stringify(btns.filter(b => b.text.toLowerCase().includes('token') || b.text.toLowerCase().includes('create')), null, 2));
  }
}

main().catch(console.error);
