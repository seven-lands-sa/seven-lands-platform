import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.log('No IONOS page found');
    return;
  }
  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      text: el.innerText ? el.innerText.trim().replace(/\n+/g, ' ') : '',
      value: el.value || '',
      id: el.id,
      className: el.className
    })).filter(el => el.text.length > 0 || el.value.length > 0);
  });
  
  console.log('Clickable elements:');
  console.log(JSON.stringify(elements.filter(e => 
    e.text.toLowerCase().includes('save') || 
    e.text.toLowerCase().includes('create') || 
    e.text.toLowerCase().includes('submit') ||
    e.text.toLowerCase().includes('next') ||
    e.value.toLowerCase().includes('save')
  ), null, 2));

  await page.screenshot({ path: 'scripts/browser-actions/forwarder-page-state.png' });
  console.log('Saved screenshot scripts/browser-actions/forwarder-page-state.png');
}

main().catch(console.error);
