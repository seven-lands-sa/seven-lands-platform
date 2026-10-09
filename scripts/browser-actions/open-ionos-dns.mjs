import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('IONOS page not found in browser');
    return;
  }

  console.log('Current page URL:', page.url());
  const dnsLink = page.locator('a:has-text("DNS")').first();
  if (await dnsLink.isVisible()) {
    console.log('Clicking DNS link...');
    await dnsLink.click();
    await page.waitForTimeout(4000);
  }

  console.log('New URL:', page.url());
  console.log('Page Title:', await page.title());

  const addRecord = page.locator('button:has-text("Add record"), a:has-text("Add record"), button:has-text("Add")').first();
  console.log('Add record button visible:', await addRecord.isVisible().catch(() => false));

  // Screenshot DNS page
  await page.screenshot({ path: 'scripts/browser-actions/ionos-dns-page.png' });
  console.log('Screenshot saved to scripts/browser-actions/ionos-dns-page.png');
}

main().catch(console.error);
