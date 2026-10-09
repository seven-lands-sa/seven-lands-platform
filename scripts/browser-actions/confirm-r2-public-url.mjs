import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('seven-lands-media/settings'));
  if (page) {
    const dialog = page.locator('div[role="dialog"]');
    if (await dialog.count() > 0) {
      console.log('Dialog is visible');
      const input = dialog.locator('input').first();
      await input.fill('allow');
      console.log('Filled allow');
      await page.waitForTimeout(1000);
      const allowBtn = dialog.locator('button').filter({ hasText: 'Allow' }).first();
      console.log('Allow btn disabled:', await allowBtn.isDisabled());
      if (!(await allowBtn.isDisabled())) {
        await allowBtn.click();
        console.log('Clicked Allow button!');
        await page.waitForTimeout(5000);
      }
    }

    const currentUrlInfo = await page.evaluate(() => {
      const match = document.body.innerText.match(/https:\/\/[a-zA-Z0-9-]+\.r2\.dev/);
      return match ? match[0] : null;
    });
    console.log('Detected R2 Dev URL:', currentUrlInfo);
  }
}

main().catch(console.error);
