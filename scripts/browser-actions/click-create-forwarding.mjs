import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('email-package-selection'));
  if (!page) {
    console.error('Email package selection page not found');
    return;
  }

  // Find the tile or card for Email Forwarding
  const fwdCard = page.locator('div, section, article, li').filter({ hasText: 'Email Forwarding' }).filter({ hasText: 'Create' }).last();
  const createBtn = fwdCard.locator('a, button').filter({ hasText: /^Create$/i }).first();

  console.log('Clicking Create button under Email Forwarding...');
  await createBtn.click();
  await page.waitForTimeout(3000);

  console.log('Current URL after click:', page.url());
  console.log('Title:', await page.title());

  const formText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Page content:\n', formText);
}

main().catch(console.error);
