import { chromium } from 'playwright';

async function inspectDirection() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const res = await page.evaluate(() => {
    const els = {
      html: document.documentElement,
      body: document.body,
      td: document.querySelector('.template-default'),
      wrap: document.querySelector('.template-default__wrap'),
      nav: document.querySelector('.nav'),
      header: document.querySelector('.app-header')
    };

    const out = {};
    for (const [k, el] of Object.entries(els)) {
      if (el) {
        const s = window.getComputedStyle(el);
        out[k] = {
          dirAttr: el.getAttribute('dir'),
          computedDirection: s.direction,
          textAlign: s.textAlign
        };
      }
    }
    return out;
  });

  console.log("Directions:\n", JSON.stringify(res, null, 2));
  await browser.close();
}

inspectDirection().catch(console.error);
