import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (!page) {
    console.log('No bucket page found');
    return;
  }

  // Find the section for Public Development URL
  const devUrlSection = page.locator('div').filter({ hasText: 'Public Development URL' }).first();
  const enableBtn = devUrlSection.locator('button').filter({ hasText: 'Enable' }).first();
  if (await enableBtn.count() > 0) {
    console.log('Clicking Enable for Public Development URL...');
    await enableBtn.click();
    await page.waitForTimeout(2000);

    // If there's a modal confirmation
    const confirmBtn = page.locator('button').filter({ hasText: /Allow|Enable/i }).last();
    if (await confirmBtn.count() > 0) {
      console.log('Confirming Enable modal...');
      await confirmBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  const textAfter = await page.locator('main').innerText();
  console.log('After snippet:\n', textAfter.substring(textAfter.indexOf('Public Development URL'), textAfter.indexOf('Public Development URL') + 300));
}

main().catch(console.error);
