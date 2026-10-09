import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('email-package-selection'));
  if (!page) return;

  const btn = page.locator('button.PfxInputSubmit').first();
  console.log('Clicking button.PfxInputSubmit...');
  await btn.click();
  await page.waitForTimeout(3000);

  console.log('Current URL after submit:', page.url());
  console.log('Title:', await page.title());

  const snippet = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Page content:\n', snippet);
}

main().catch(console.error);
