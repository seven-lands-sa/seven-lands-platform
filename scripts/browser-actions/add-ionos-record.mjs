import { chromium } from 'playwright';

async function addRecord({ type, host, value, priority, ttl = 'Do not adjust' }) {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page found');
    return false;
  }

  console.log(`\n========================================`);
  console.log(`Adding DNS record: Type=${type}, Host=${host}, Value=${value}`);
  console.log(`========================================`);

  // Navigate to choose type page
  await page.goto('https://my.ionos.com/choose-dns-record-type/7-lands.com');
  await page.waitForTimeout(3000);

  // Click on the specific record type card/link
  const typeCard = page.locator(`a:has-text("${type}"), button:has-text("${type}"), div:has-text("${type}")`).filter({
    hasText: new RegExp(`^${type}\\b`, 'i')
  }).first();

  console.log('Clicking record type card for', type);
  await typeCard.click();
  await page.waitForTimeout(3000);

  console.log('Current form URL:', page.url());

  // Inspect form inputs
  const inputs = await page.locator('input, select, textarea').all();
  console.log('Form inputs count:', inputs.length);

  // Fill Host Name (usually input 0 or named host/prefix)
  const hostInput = page.locator('input[name*="host" i], input[name*="prefix" i], input[id*="host" i]').first();
  if (await hostInput.isVisible()) {
    console.log('Filling host input with:', host);
    await hostInput.fill(host);
  }

  // Fill Value / Destination
  const valInput = page.locator('input[name*="value" i], input[name*="target" i], input[name*="destination" i], input[name*="ip" i], textarea[name*="value" i]').first();
  if (await valInput.isVisible()) {
    console.log('Filling value input with:', value);
    await valInput.fill(value);
  }

  // If priority is given (e.g. MX)
  if (priority !== undefined) {
    const prioInput = page.locator('input[name*="priority" i], select[name*="priority" i]').first();
    if (await prioInput.isVisible()) {
      console.log('Setting priority to:', priority);
      await prioInput.fill(String(priority));
    }
  }

  // Save button
  const saveBtn = page.locator('button:has-text("Save"), button[type="submit"]:has-text("Save")').first();
  if (await saveBtn.isVisible()) {
    console.log('Clicking Save...');
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log('Saved! URL after save:', page.url());
    return true;
  } else {
    console.log('Save button not visible!');
    return false;
  }
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  
  // Test clicking "A" to inspect exact form inputs
  await page.goto('https://my.ionos.com/choose-dns-record-type/7-lands.com');
  await page.waitForTimeout(2000);
  
  const aLink = page.locator('a, div, [role="button"]').filter({ hasText: /^A\s*$/i }).first();
  // Or look for tile with heading A
  const allTiles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, [role="link"]')).map(el => ({
      text: el.innerText.trim().replace(/\n+/g, ' '),
      href: el.getAttribute('href')
    })).filter(el => el.text.match(/^(A|CNAME|TXT|MX)\b/));
  });
  console.log('Target tiles:', allTiles);
}

main().catch(console.error);
