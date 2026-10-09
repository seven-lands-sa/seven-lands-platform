import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  await page.goto('https://my.ionos.com/');
  await page.waitForTimeout(3000);

  console.log('Dashboard URL:', page.url());
  console.log('Dashboard Title:', await page.title());

  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="link"]')).map(el => ({
      text: el.innerText.trim().replace(/\n+/g, ' '),
      href: el.getAttribute('href')
    })).filter(el => el.text.length > 0 && el.text.length < 40);
  });

  const emailLinks = navLinks.filter(l => l.text.toLowerCase().includes('email') || l.text.toLowerCase().includes('mail') || l.text.toLowerCase().includes('domain'));
  console.log('Relevant nav links:', JSON.stringify(emailLinks, null, 2));
}

main().catch(console.error);
