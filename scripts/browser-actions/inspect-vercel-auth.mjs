import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const cookies = await context.cookies('https://vercel.com');
  
  const authCookie = cookies.find(c => c.name === 'authorization');
  console.log('Auth cookie found:', !!authCookie);
  if (authCookie) {
    console.log('Auth cookie value prefix:', authCookie.value.substring(0, 15) + '...');
    fs.writeFileSync('scripts/browser-actions/.vercel-cookie.tmp', authCookie.value.trim());
  }

  // Let's also check if we can inspect the active page
  const page = context.pages().find(p => p.url().includes('tokens')) || context.pages()[0];
  if (page) {
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, button')).map(el => ({
        tag: el.tagName,
        type: el.type,
        name: el.name,
        value: el.value,
        text: el.innerText
      }));
    });
    console.log('Active elements on page:', JSON.stringify(inputs.slice(0, 15), null, 2));
  }
}

main().catch(console.error);
