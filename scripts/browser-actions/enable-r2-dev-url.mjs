import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('seven-lands-media/settings'));
  if (page) {
    const section = page.locator('div').filter({ hasText: 'Public Development URL' }).first();
    const enableBtn = section.locator('button').filter({ hasText: 'Enable' }).first();
    console.log('Found enable btn:', await enableBtn.count());
    await enableBtn.click();
    await page.waitForTimeout(2000);

    // Look for modal
    const modalText = await page.locator('div[role="dialog"]').innerText().catch(() => 'no dialog');
    console.log('Modal text:\n', modalText);

    // Look for confirmation button in modal
    const confirmBtn = page.locator('div[role="dialog"] button').filter({ hasText: /Enable|Allow/i }).last();
    if (await confirmBtn.count() > 0) {
      console.log('Clicking confirm button in dialog...');
      await confirmBtn.click();
      await page.waitForTimeout(4000);
    }

    const currentUrlInfo = await page.evaluate(() => {
      const match = document.body.innerText.match(/https:\/\/[a-zA-Z0-9-]+\.r2\.dev/);
      return match ? match[0] : null;
    });
    console.log('Detected R2 Dev URL:', currentUrlInfo);
  }
}

main().catch(console.error);
