import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('vercel.com'));
  if (!page) return;

  const viewBtns = page.locator('button:has-text("View DNS configuration")');
  const count = await viewBtns.count();
  console.log(`Found ${count} View DNS configuration buttons`);
  for (let i = 0; i < count; i++) {
    await viewBtns.nth(i).click();
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(2000);
  const text = await page.evaluate(() => document.body.innerText);
  const relevant = text.split('\n').filter(l => l.includes('Type') || l.includes('Name') || l.includes('Value') || l.includes('Record') || l.includes('76.76.21.21') || l.includes('cname.vercel-dns.com') || l.includes('_vercel'));
  console.log('DNS requirements from Vercel:', relevant);

  await page.screenshot({ path: 'scripts/browser-actions/vercel-dns-expanded.png', fullPage: true });
}

main().catch(console.error);
