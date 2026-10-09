import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  await page.goto('https://my.ionos.com/domain-dns-settings/7-lands.com');
  await page.waitForTimeout(3000);

  // Find AAAA row
  const aaaaRow = page.locator('tr, [role="row"]').filter({ hasText: 'AAAA' }).first();
  if (await aaaaRow.isVisible()) {
    console.log('Found AAAA row, looking for delete/actions...');
    // Look for checkbox to select it
    const checkbox = aaaaRow.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      console.log('Checking AAAA checkbox...');
      await checkbox.check();
      await page.waitForTimeout(1000);

      // Look for "Delete records" button
      const delBtn = page.locator('button:has-text("Delete records"), a:has-text("Delete records"), button:has-text("Delete")').first();
      if (await delBtn.isVisible()) {
        console.log('Clicking Delete records button...');
        await delBtn.click();
        await page.waitForTimeout(2000);

        // Confirm delete modal if any
        const confirmBtn = page.locator('button:has-text("Delete"), button:has-text("Confirm")').last();
        if (await confirmBtn.isVisible()) {
          console.log('Confirming delete...');
          await confirmBtn.click();
          await page.waitForTimeout(3000);
          console.log('AAAA record deleted successfully!');
        }
      }
    }
  }
}

main().catch(console.error);
