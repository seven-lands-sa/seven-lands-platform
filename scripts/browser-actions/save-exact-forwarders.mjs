import { chromium } from 'playwright';

async function createForwarder(page, prefix, target) {
  console.log(`\n========================================`);
  console.log(`Creating Forwarder: ${prefix}@7-lands.com -> ${target}`);
  console.log(`========================================`);

  await page.goto('https://my.ionos.com/email-package-selection?domain=7-lands.com');
  await page.waitForTimeout(2500);

  // Click Create button for forwarding
  const btn = page.locator('button.PfxInputSubmit').first();
  await btn.click();
  await page.waitForTimeout(2500);

  // Fill email prefix
  const usernameInput = page.locator('#username');
  await usernameInput.fill(prefix);
  console.log(`Filled #username: ${prefix}`);

  // Select domain if dropdown exists
  const domainSelect = page.locator('#autocomplete-domains');
  if (await domainSelect.isVisible()) {
    await domainSelect.selectOption({ label: '7-lands.com' }).catch(async () => {
      await domainSelect.selectOption('7-lands.com');
    });
    console.log('Selected domain: 7-lands.com');
  }

  // Fill target email
  const targetInput = page.locator('#create-forward-0');
  await targetInput.fill(target);
  console.log(`Filled #create-forward-0: ${target}`);

  // Click Save link/button
  const saveBtn = page.locator('a.submit-form-button, a:has-text("Save"), button:has-text("Save")').first();
  await saveBtn.click();
  console.log('Clicked Save button!');

  await page.waitForTimeout(5000);
  console.log(`Resulting URL: ${page.url()}`);
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page found');
    return;
  }

  // 1. info@7-lands.com -> sevenlands.sa@gmail.com
  await createForwarder(page, 'info', 'sevenlands.sa@gmail.com');

  // 2. admin@7-lands.com -> sevenlands.sa@gmail.com
  await createForwarder(page, 'admin', 'sevenlands.sa@gmail.com');

  console.log('\n========================================');
  console.log('✓ Both IONOS forwarders submitted successfully!');
  console.log('========================================');
}

main().catch(console.error);
