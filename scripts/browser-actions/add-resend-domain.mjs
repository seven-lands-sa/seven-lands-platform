import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("resend.com"));

  console.log("On page:", page.url());
  const domainInput = page.locator("#domain");
  await domainInput.fill("7-lands.com");
  console.log("Filled #domain with 7-lands.com");

  const submitBtn = page.locator("button[type='submit']:has-text('Add domain')");
  await submitBtn.click();
  console.log("Clicked submit button");

  await page.waitForTimeout(5000);
  console.log("Current page URL:", page.url());

  const records = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr, [role='row']"));
    return rows.map(r => Array.from(r.querySelectorAll("td, [role='cell']")).map(c => c.innerText.trim())).filter(r => r.length > 0);
  });
  console.log("Captured Resend DNS records:", JSON.stringify(records, null, 2));
}

main().catch(err => console.error(err));
