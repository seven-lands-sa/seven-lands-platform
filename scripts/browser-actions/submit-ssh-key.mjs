import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  const key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIENJWauERzUXqzYWiX8JvdSGk+vX/49rymKAVOSfqVEV sevenlands.sa@gmail.com";

  await page.evaluate((k) => {
    const titleInput = document.querySelector("#public_key_title, input[name='public_key[title]']");
    const keyInput = document.querySelector("#public_key_key, textarea[name='public_key[key]']");
    if (titleInput) titleInput.value = "Seven Lands Workstation";
    if (keyInput) keyInput.value = k;
  }, key);

  console.log("Values set via DOM. Submitting form...");
  const btn = page.locator("button:has-text('Add SSH key')");
  await btn.click();

  await page.waitForTimeout(4000);
  console.log("Current page URL:", page.url());
}

main().catch(err => console.error(err));
