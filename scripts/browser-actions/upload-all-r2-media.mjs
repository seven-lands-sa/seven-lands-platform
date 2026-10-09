import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('seven-lands-media'));
  if (!page) {
    console.log('No page found');
    return;
  }

  const mediaDir = path.resolve('public/media');
  const getAllFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results = results.concat(getAllFiles(full));
      else results.push(full);
    }
    return results;
  };

  const files = getAllFiles(mediaDir);
  console.log(`Found ${files.length} files to upload:`, files.map(f => path.basename(f)));

  const fileInput = page.locator('input[type="file"]');
  console.log('File input count:', await fileInput.count());
  if (await fileInput.count() > 0) {
    await fileInput.first().setInputFiles(files);
    console.log('Set input files. Waiting for upload...');
    await page.waitForTimeout(5000);

    // Check if an upload button appears
    const uploadBtn = page.locator('button').filter({ hasText: /Upload/i });
    if (await uploadBtn.count() > 0) {
      console.log('Clicking upload confirmation...');
      await uploadBtn.last().click();
      await page.waitForTimeout(8000);
    }

    const mainText = await page.locator('main').innerText();
    console.log('After upload main snippet:\n', mainText.substring(0, 1000));
  }
}

main().catch(console.error);
