import { chromium } from 'playwright';

async function addRecord(page, { type, host, value, priority }) {
  console.log(`\n========================================`);
  console.log(`Adding ${type} record: Host="${host}", Value="${value}"${priority ? ` (Prio ${priority})` : ''}`);
  console.log(`========================================`);

  await page.goto('https://my.ionos.com/choose-dns-record-type/7-lands.com');
  await page.waitForTimeout(2000);

  const li = page.locator('li').filter({ has: page.locator('strong', { hasText: new RegExp(`^${type}$`, 'i') }) }).first();
  await li.click();
  await page.waitForTimeout(2000);

  // Fill host
  const hostInput = page.locator('#hostName, input[name="record.prefix"]').first();
  if (await hostInput.isVisible()) {
    await hostInput.fill(host === '@' ? '' : host);
    console.log(`Filled host: "${host === '@' ? '' : host}"`);
  }

  // Fill value / destination
  const valInput = page.locator('#pointsTo, input[name="record.destination"], textarea[name="record.destination"]').first();
  if (await valInput.isVisible()) {
    await valInput.fill(value);
    console.log(`Filled value: "${value.substring(0, 30)}..."`);
  }

  // If priority
  if (priority !== undefined) {
    const prioInput = page.locator('#priority, input[name="record.priority"], select[name="record.priority"]').first();
    if (await prioInput.isVisible()) {
      await prioInput.fill(String(priority));
      console.log(`Filled priority: ${priority}`);
    }
  }

  // Click Save
  const saveBtn = page.locator('#btn\\.save\\.dns-record, button:has-text("Save")').first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(3000);
    console.log('✓ Saved successfully. Current URL:', page.url());
    return true;
  } else {
    console.log('✗ Save button not found!');
    return false;
  }
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('ionos.com'));
  if (!page) {
    console.error('No IONOS page found');
    return;
  }

  // 1. Add CNAME www -> cname.vercel-dns.com
  try {
    await addRecord(page, {
      type: 'CNAME',
      host: 'www',
      value: 'cname.vercel-dns.com'
    });
  } catch (err) {
    console.error('Error adding CNAME www:', err.message);
  }

  // 2. Add Resend DKIM TXT
  try {
    await addRecord(page, {
      type: 'TXT',
      host: 'resend._domainkey',
      value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDSZUsICdZ+wGArEZF7bH/u8KY+mYfFWwrTsifBE/48PtRCvmP4Y1AdYIm6DX9DSp7Ldq9sBtXXd97voPEXIa/vaK+z5hBwK23FCd5e6SjykmOU3aGNUfshC/LRsypt4wV75jr5v+Wub4yKQBLfsk6Xfq0lLR/Tgb0GBi6l+DX/+QIDAQAB'
    });
  } catch (err) {
    console.error('Error adding Resend DKIM:', err.message);
  }

  // 3. Add Resend MX send.7-lands.com
  try {
    await addRecord(page, {
      type: 'MX',
      host: 'send',
      value: 'feedback-smtp.ap-northeast-1.amazonses.com',
      priority: 10
    });
  } catch (err) {
    console.error('Error adding Resend MX:', err.message);
  }

  // 4. Add Resend SPF TXT send.7-lands.com
  try {
    await addRecord(page, {
      type: 'TXT',
      host: 'send',
      value: 'v=spf1 include:amazonses.com ~all'
    });
  } catch (err) {
    console.error('Error adding Resend SPF:', err.message);
  }

  console.log('\n========================================');
  console.log('✓ All DNS records submitted!');
  console.log('========================================');
}

main().catch(console.error);
