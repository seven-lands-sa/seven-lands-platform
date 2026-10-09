import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('edit-dns-record'));
  if (!page) {
    console.error('Edit page not found');
    return;
  }

  console.log('Editing A record on:', page.url());

  // Input for IP address / Points to
  const valInput = page.locator('#pointsTo, input[name="record.destination"]').first();
  if (await valInput.isVisible()) {
    console.log('Current value in input:', await valInput.inputValue());
    await valInput.fill('76.76.21.21');
    console.log('Filled new value: 76.76.21.21 (Vercel Anycast IP)');
  }

  // Click Save
  const saveBtn = page.locator('#btn\\.save\\.dns-record, button:has-text("Save")').first();
  if (await saveBtn.isVisible()) {
    console.log('Clicking Save button...');
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log('Saved! URL after save:', page.url());
  }
}

main().catch(console.error);
