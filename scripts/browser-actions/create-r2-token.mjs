import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('api-tokens'));
  if (!page) {
    console.log('No token page');
    return;
  }

  // Name input
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill('Seven Lands Media Production');
  console.log('Filled token name');

  // Permission: Object Read & Write (value: object-write)
  const permRadio = page.locator('input[type="radio"][value="object-write"]');
  if (await permRadio.count() > 0) {
    await permRadio.click();
    console.log('Clicked object-write radio');
  }

  // Scope: all buckets (value: all)
  const scopeRadio = page.locator('input[type="radio"][value="all"]');
  if (await scopeRadio.count() > 0) {
    await scopeRadio.click();
    console.log('Clicked all buckets radio');
  }

  await page.waitForTimeout(1000);

  // Submit button
  const submitBtn = page.locator('button').filter({ hasText: /Create (API )?token|Create Account API token/i }).last();
  console.log('Submit button text:', await submitBtn.innerText(), 'disabled:', await submitBtn.isDisabled());
  if (!(await submitBtn.isDisabled())) {
    await submitBtn.click();
    console.log('Clicked submit token button');
    await page.waitForTimeout(5000);
    console.log('URL after submit:', page.url());

    // Extract secrets
    const bodyText = await page.locator('main').innerText().catch(() => page.locator('body').innerText());
    console.log('Page content after token creation:\n', bodyText.substring(0, 1500));

    // Try to get token inputs/code elements
    const tokenInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, code, pre')).map(el => ({
        tag: el.tagName,
        val: el.value || el.innerText,
        label: el.closest('div')?.innerText?.substring(0, 50)
      }));
      return inputs;
    });

    fs.writeFileSync('scripts/browser-actions/.r2-token.json', JSON.stringify(tokenInfo, null, 2));
    console.log('Saved token info to .r2-token.json');
  }
}

main().catch(console.error);
