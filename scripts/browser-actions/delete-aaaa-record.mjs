import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page found');
    return;
  }

  console.log('Navigating to DNS settings for 7-lands.com...');
  await page.goto('https://my.ionos.com/domain-dns-settings/7-lands.com');
  await page.waitForTimeout(4000);

  // Find AAAA row
  const aaaaRow = page.locator('tr').filter({ hasText: 'AAAA' }).first();
  if (await aaaaRow.isVisible()) {
    console.log('Found AAAA row:', await aaaaRow.innerText());
    
    // Check the actions inside this row
    const editOrAction = aaaaRow.locator('button, a, [role="button"]').all();
    const actions = await editOrAction;
    console.log(`AAAA row has ${actions.length} action elements`);
    for (let i = 0; i < actions.length; i++) {
      console.log(`Action ${i}: text="${await actions[i].innerText().catch(() => '')}", title="${await actions[i].getAttribute('title').catch(() => '')}", aria="${await actions[i].getAttribute('aria-label').catch(() => '')}"`);
    }

    // Try checking the checkbox
    const checkbox = aaaaRow.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      console.log('Checking checkbox for AAAA...');
      await checkbox.check();
      await page.waitForTimeout(1000);

      // Look for delete button on the page
      const deleteBtn = page.locator('button:has-text("Delete records"), a:has-text("Delete records"), button:has-text("Delete")').first();
      console.log('Delete button visible:', await deleteBtn.isVisible().catch(() => false));
      if (await deleteBtn.isVisible()) {
        console.log('Clicking Delete button...');
        await deleteBtn.click();
        await page.waitForTimeout(2000);

        // Check for modal dialog
        const modal = page.locator('.modal, [role="dialog"], .dialog');
        console.log('Modal visible:', await modal.isVisible().catch(() => false));
        if (await modal.isVisible()) {
          console.log('Modal text:', await modal.innerText());
          const confirmBtn = modal.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")').first();
          if (await confirmBtn.isVisible()) {
            console.log('Clicking confirm delete button...');
            await confirmBtn.click();
            await page.waitForTimeout(4000);
            console.log('✓ AAAA record deleted!');
          }
        }
      }
    }
  } else {
    console.log('AAAA record not found (may already be deleted)');
  }

  // Dump remaining records
  await page.goto('https://my.ionos.com/domain-dns-settings/7-lands.com');
  await page.waitForTimeout(3000);
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 0);
  });
  console.log('\nRemaining DNS records:');
  for (const r of rows) {
    console.log(' ->', r);
  }
}

main().catch(console.error);
