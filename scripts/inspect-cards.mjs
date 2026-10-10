import { chromium } from 'playwright';

async function inspectDashboardCards() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const cardDetails = await page.evaluate(() => {
    // Look for dashboard cards/links
    const groups = Array.from(document.querySelectorAll('.dashboard__group, [class*="dashboard"]')).map(g => ({
      class: g.className,
      text: g.innerText.slice(0, 100)
    }));

    const cardLinks = Array.from(document.querySelectorAll('.card, a[class*="card"]')).map(c => ({
      class: c.className,
      inner: c.innerHTML.slice(0, 200)
    }));

    return { groups, cardLinks };
  });

  console.log("Dashboard Details:\n", JSON.stringify(cardDetails, null, 2));
  await browser.close();
}

inspectDashboardCards().catch(console.error);
