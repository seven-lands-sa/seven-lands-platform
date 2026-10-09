import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  await page.goto('https://vercel.com/account/settings/tokens');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click "Create Token"
  const createBtn = page.locator('button:has-text("Create Token"), button:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Find modal dialog
  const modal = page.locator('[role="dialog"]');
  console.log('Dialog visible:', await modal.isVisible());

  // Fill token name inside modal
  const nameInput = modal.locator('input[type="text"]').first();
  await nameInput.fill('seven-lands-production-cli');
  console.log('Filled token name');

  // Find submit button in dialog
  const submitBtn = modal.locator('button[type="submit"]:has-text("Create"), button:has-text("Create")').last();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  // After creation, Vercel shows the token in the modal with a copy button or text
  const tokenInputs = await modal.locator('input[readonly], code, span[data-testid*="token"]').all();
  let foundToken = '';
  for (const el of tokenInputs) {
    const val = await el.getAttribute('value').catch(() => '');
    const txt = await el.innerText().catch(() => '');
    if (val && val.length > 20) foundToken = val;
    if (txt && txt.length > 20) foundToken = txt;
  }

  // If not found inside modal inputs, search whole modal text
  if (!foundToken) {
    const modalText = await modal.innerText().catch(() => '');
    console.log('Modal text after creation:', modalText);
    const match = modalText.match(/[a-zA-Z0-9_-]{24,}/);
    if (match) foundToken = match[0];
  }

  console.log('Found token:', foundToken ? (foundToken.substring(0, 10) + '...') : 'NONE');
  if (foundToken) {
    fs.writeFileSync('scripts/browser-actions/.vercel-token.tmp', foundToken.trim());
  }

  await page.close();
}

main().catch(console.error);
