import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page');
    return;
  }

  // Extract table rows of DNS records
  const records = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
    return rows.map(r => r.innerText.replace(/\n+/g, ' | '));
  });

  console.log('Current DNS records count:', records.length);
  console.log('Sample DNS records:');
  for (const r of records.slice(0, 10)) {
    console.log(' -', r);
  }

  // Click "Add record"
  const addBtn = page.locator('button:has-text("Add record"), a:has-text("Add record")').first();
  if (await addBtn.isVisible()) {
    console.log('\nClicking "Add record"...');
    await addBtn.click();
    await page.waitForTimeout(2000);

    const recordTypes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, li')).map(el => el.innerText.trim()).filter(t => ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SPF', 'NS', 'SRV', 'CAA'].includes(t));
    });
    console.log('Available record types to add:', recordTypes);
  }
}

main().catch(console.error);
