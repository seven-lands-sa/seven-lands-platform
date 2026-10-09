import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('choose-dns-record-type'));
  if (!page) return;

  const liA = page.locator('li').filter({ has: page.locator('strong', { hasText: /^A$/ }) }).first();
  console.log('Found A item, clicking...');
  await liA.click();
  await page.waitForTimeout(3000);

  console.log('URL after click:', page.url());
  console.log('Title:', await page.title());

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
      tag: el.tagName,
      id: el.id,
      name: el.name,
      type: el.type,
      placeholder: el.placeholder,
      value: el.value,
      text: el.innerText?.trim()
    }));
  });
  console.log('Form elements:\n', JSON.stringify(inputs, null, 2));
}

main().catch(console.error);
