import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  await page.goto('https://my.ionos.com/domain/details/7-lands.com');
  await page.waitForTimeout(3000);

  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="tab"]')).map(el => ({
      text: el.innerText.trim(),
      href: el.getAttribute('href')
    })).filter(el => el.text.length > 0 && el.text.length < 35);
  });
  console.log('Tabs on domain details page:\n', JSON.stringify(tabs.slice(0, 25), null, 2));
}

main().catch(console.error);
