import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page');
    return;
  }

  console.log('Navigating to DNS settings for 7-lands.com...');
  await page.goto('https://my.ionos.com/dns-settings/7-lands.com');
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 0);
  });

  console.log(`\nFound ${rows.length} DNS rows:`);
  for (const r of rows) {
    console.log(' ->', r);
  }
}

main().catch(console.error);
