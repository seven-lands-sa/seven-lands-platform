import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  let page = browser.contexts()[0].pages().find(p => p.url().includes('dash.cloudflare.com') && p.url().includes('seven-lands-media'));
  if (page) {
    const info = await page.evaluate(() => {
      const allText = document.body.innerText;
      const match = allText.match(/https:\/\/[a-zA-Z0-9-]+\.r2\.dev/);
      return {
        r2DevUrl: match ? match[0] : null,
        fullTextSnippet: allText.substring(allText.indexOf('Public Development URL'), allText.indexOf('Public Development URL') + 300)
      };
    });
    console.log('Result:', JSON.stringify(info, null, 2));
  }
}

main().catch(console.error);
