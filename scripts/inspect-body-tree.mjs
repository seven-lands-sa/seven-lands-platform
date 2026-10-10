import { chromium } from 'playwright';

async function inspectBody() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const tree = await page.evaluate(() => {
    function getSummary(el, depth = 0) {
      if (depth > 4) return null;
      return {
        tag: el.tagName,
        class: el.className,
        id: el.id,
        children: Array.from(el.children).map(c => getSummary(c, depth + 1)).filter(Boolean)
      };
    }
    return getSummary(document.body);
  });

  console.log("DOM Tree:\n", JSON.stringify(tree, null, 2));
  await browser.close();
}

inspectBody().catch(console.error);
