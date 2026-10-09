import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('vercel.com'));
  if (!page) {
    console.error('No Vercel page found');
    return;
  }

  await page.goto('https://vercel.com/seven-lands/seven-lands-platform/settings/domains');
  await page.waitForTimeout(5000);

  console.log('Domains settings URL:', page.url());
  console.log('Page Title:', await page.title());

  const pageText = await page.evaluate(() => {
    return document.body.innerText;
  });

  console.log('\nPage text snippet related to domains:\n');
  const lines = pageText.split('\n').filter(l => l.trim().length > 0);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('7-lands.com') || lines[i].includes('Nameservers') || lines[i].includes('DNS') || lines[i].includes('Invalid Configuration') || lines[i].includes('Valid Configuration')) {
      console.log(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5)).join(' | '));
      i += 4;
    }
  }

  await page.screenshot({ path: 'scripts/browser-actions/vercel-domains-settings.png', fullPage: true });
  console.log('\nFull page screenshot saved to scripts/browser-actions/vercel-domains-settings.png');
}

main().catch(console.error);
