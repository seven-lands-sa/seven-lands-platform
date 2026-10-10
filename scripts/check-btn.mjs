import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://7-lands.com/ar', { waitUntil: 'networkidle' });
  const btn = await page.$('button[aria-label="فتح محادثة مستشار سفن لاند"]');
  console.log('Button found on desktop:', Boolean(btn));
  if (btn) {
    const text = await btn.innerText();
    console.log('Button inner text:', text.trim());
  }
  await browser.close();
}

check().catch(console.error);
