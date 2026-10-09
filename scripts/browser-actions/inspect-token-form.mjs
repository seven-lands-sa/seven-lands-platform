import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('api-tokens'));
  if (page) {
    const btn = page.locator('button').filter({ hasText: 'Create Account API token' }).first();
    await btn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('Token creation URL:', page.url());
    
    // Check permissions options
    const radios = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[type="radio"], input[type="text"]')).map(el => ({
        type: el.type,
        name: el.name,
        value: el.value,
        id: el.id,
        label: el.closest('label')?.innerText?.trim() || el.parentElement?.innerText?.trim()
      }));
    });
    console.log('Inputs on token form:', JSON.stringify(radios, null, 2));
  }
}

main().catch(console.error);
