import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  console.log("Navigating to https://github.com/settings/ssh/new...");
  await page.goto("https://github.com/settings/ssh/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const titleInput = page.locator("#public_key_title, input[name='public_key[title]']");
  const keyInput = page.locator("#public_key_key, textarea[name='public_key[key]']");
  const submitBtn = page.locator("button[type='submit']:has-text('Add SSH key')");

  console.log("Filling SSH key details...");
  await titleInput.fill("Seven Lands Local Dev - 7-lands.com");
  await keyInput.fill("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIENJWauERzUXqzYWiX8JvdSGk+vX/49rymKAVOSfqVEV sevenlands.sa@gmail.com");

  console.log("Clicking Add SSH key button...");
  await submitBtn.click();
  await page.waitForTimeout(4000);

  console.log("Current URL after submission:", page.url());
  const errorText = await page.evaluate(() => document.querySelector(".flash-error, [role='alert']")?.innerText || "");
  if (errorText) {
    console.log("Notice on page:", errorText);
  }
}

main().catch(err => console.error(err));
