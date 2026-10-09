import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (page) {
    await page.goto('https://dash.cloudflare.com/3f4115369739d3fd0f4b54ce5015964a/r2/default/buckets/seven-lands-media/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const publicSectionHtml = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h1, h2, h3, h4, span, div')).find(e => e.innerText?.trim() === 'Public Development URL' && e.children.length === 0);
      let parent = heading;
      for (let i = 0; i < 5; i++) {
        if (parent?.parentElement) parent = parent.parentElement;
      }
      return parent ? parent.innerHTML : 'none';
    });
    console.log('Public section HTML length:', publicSectionHtml.length);
    console.log('Snippet:\n', publicSectionHtml.substring(0, 1000));
  }
}

main().catch(console.error);
