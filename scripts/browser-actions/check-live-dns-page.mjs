import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('IONOS page not found');
    return;
  }

  console.log('Navigating to domain details...');
  await page.goto('https://my.ionos.com/domain/details/7-lands.com');
  await page.waitForTimeout(4000);

  console.log('Domain details URL:', page.url());
  const dnsTab = page.locator('a:has-text("DNS")').first();
  if (await dnsTab.isVisible()) {
    console.log('Clicking DNS tab...');
    await dnsTab.click();
    await page.waitForTimeout(4000);
  }

  console.log('DNS Page URL:', page.url());
  console.log('Title:', await page.title());

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 0);
  });

  console.log(`\nFound ${rows.length} DNS rows:`);
  for (const r of rows) {
    console.log(' ->', r);
  }

  await page.screenshot({ path: 'scripts/browser-actions/current-dns-page.png' });
  console.log('Screenshot saved to scripts/browser-actions/current-dns-page.png');
}

main().catch(console.error);
