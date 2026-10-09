import { chromium } from 'playwright';

async function createForwarder(page, prefix, target) {
  console.log(`\n========================================`);
  console.log(`Setting up forwarder: ${prefix}@7-lands.com -> ${target}`);
  console.log(`========================================`);

  await page.goto('https://my.ionos.com/email-package-selection?domain=7-lands.com');
  await page.waitForTimeout(2000);

  const btn = page.locator('button.PfxInputSubmit').first();
  await btn.click();
  await page.waitForTimeout(2000);

  // Fill email prefix
  const prefixInput = page.locator('input[name*="mail" i], input[name*="prefix" i], input[type="text"]').first();
  await prefixInput.fill(prefix);
  console.log(`Filled prefix: ${prefix}`);

  // Select domain 7-lands.com
  const domainSelect = page.locator('select').first();
  if (await domainSelect.isVisible()) {
    await domainSelect.selectOption({ label: '7-lands.com' }).catch(async () => {
      await domainSelect.selectOption('7-lands.com');
    });
    console.log('Selected domain: 7-lands.com');
  }

  // Fill target email
  const targetInput = page.locator('input[placeholder*="e-mail" i], input[name*="target" i], input[name*="destination" i]').last();
  await targetInput.fill(target);
  console.log(`Filled target: ${target}`);

  // Click Save
  const saveBtn = page.locator('button:has-text("Save"), button[type="submit"]:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);

  console.log('✓ Forwarder saved! Current URL:', page.url());
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) return;

  // 1. info@7-lands.com -> sevenlands.sa@gmail.com
  await createForwarder(page, 'info', 'sevenlands.sa@gmail.com');

  // 2. admin@7-lands.com -> sevenlands.sa@gmail.com
  await createForwarder(page, 'admin', 'sevenlands.sa@gmail.com');

  console.log('\n========================================');
  console.log('✓ Both email forwarders created successfully!');
  console.log('========================================');
}

main().catch(console.error);
