import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  await page.goto('https://my.ionos.com/domain-dns-settings/7-lands.com');
  await page.waitForTimeout(3000);

  // Find row containing "74.208.236.250"
  const row = page.locator('tr, [role="row"]').filter({ hasText: '74.208.236.250' }).first();
  console.log('Row found:', await row.isVisible());

  // Inspect buttons/links in this row
  const rowActions = await row.locator('button, a, svg, [role="button"]').all();
  console.log('Row action elements count:', rowActions.length);
  for (let i = 0; i < rowActions.length; i++) {
    const text = await rowActions[i].innerText().catch(() => '');
    const title = await rowActions[i].getAttribute('title').catch(() => '');
    const aria = await rowActions[i].getAttribute('aria-label').catch(() => '');
    console.log(`Action ${i}: text="${text}", title="${title}", aria="${aria}"`);
  }

  // If there's an action menu or edit button, click it
  const editEl = row.locator('button[title*="Edit" i], a[title*="Edit" i], [aria-label*="Edit" i], button:has-text("Edit"), button[class*="action" i]').first();
  if (await editEl.isVisible()) {
    console.log('Clicking edit on A record row...');
    await editEl.click();
    await page.waitForTimeout(2000);
    console.log('Current URL after click:', page.url());
  }
}

main().catch(console.error);
