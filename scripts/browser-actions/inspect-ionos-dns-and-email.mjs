import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("ionos.com")) || context.pages()[0];

  console.log("Navigating to IONOS DNS settings...");
  // Click on the DNS tab
  const dnsTab = page.locator("a:has-text('DNS'), button:has-text('DNS'), [role='tab']:has-text('DNS')").first();
  if (await dnsTab.count() > 0) {
    await dnsTab.click();
  } else {
    await page.goto("https://my.ionos.com/domain/dns/7-lands.com", { waitUntil: "domcontentloaded" });
  }

  await page.waitForTimeout(4000);
  console.log("DNS page URL:", page.url());

  // Extract DNS table
  const dnsRecords = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr, [role='row']"));
    return rows.map(r => {
      const cells = Array.from(r.querySelectorAll("td, [role='cell']")).map(c => c.innerText.trim());
      return cells;
    }).filter(c => c.length > 0);
  });

  console.log("DNS records captured (rows count:", dnsRecords.length, "):");
  console.log(JSON.stringify(dnsRecords, null, 2));

  // Now inspect Email option
  console.log("Navigating to Email section / checking email creation...");
  await page.goto("https://my.ionos.com/domain/details/7-lands.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const emailCreateBtn = page.locator("a:has-text('Create'), button:has-text('Create')").filter({ hasText: /create/i }).first();
  if (await emailCreateBtn.count() > 0) {
    await emailCreateBtn.click();
    await page.waitForTimeout(4000);
    console.log("Email page URL after click:", page.url());
    const emailPageText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    console.log("Email page text snippet:", emailPageText);
  }
}

main().catch(err => console.error(err));
