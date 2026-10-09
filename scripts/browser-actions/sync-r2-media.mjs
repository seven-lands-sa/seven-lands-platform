import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (!page) {
    page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com'));
    if (page) {
      await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/default/buckets/seven-lands-media');
    }
  }

  if (page) {
    if (!page.url().endsWith('seven-lands-media')) {
      await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/default/buckets/seven-lands-media');
      await page.waitForTimeout(3000);
    }

    console.log('R2 Objects page URL:', page.url());
    const uploadBtn = page.locator('button, a').filter({ hasText: /Upload|Add object/i }).first();
    console.log('Upload button count:', await uploadBtn.count());
    
    // Find all files in public/media to upload
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
    console.log(`Found ${files.length} media files to sync to R2.`);
  }
}

main().catch(console.error);
