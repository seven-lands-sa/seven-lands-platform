import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page found');
    return;
  }

  await page.goto('https://my.ionos.com/domain-dns-settings/7-lands.com');
  await page.waitForTimeout(4000);

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const pagination = document.querySelector('[class*="pagination"], [class*="pager"]')?.innerText || 'None';
    return { rows, pagination };
  });

  console.log('Pagination:', data.pagination);
  console.log('Rows count:', data.rows.length);
  for (const r of data.rows) {
    console.log(' ->', r);
  }

  await page.screenshot({ path: 'scripts/browser-actions/ionos-full-dns-table.png', fullPage: true });
}

main().catch(console.error);
