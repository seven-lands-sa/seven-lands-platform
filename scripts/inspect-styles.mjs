import { chromium } from 'playwright';

async function inspectLayoutStyles() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const styles = await page.evaluate(() => {
    const td = document.querySelector('.template-default');
    const nav = document.querySelector('.nav');
    const wrap = document.querySelector('.template-default__wrap');
    const header = document.querySelector('.app-header');
    const toggler = document.querySelector('.template-default__nav-toggler-wrapper');

    const get = (el) => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        display: s.display,
        flexDirection: s.flexDirection,
        position: s.position,
        left: s.left,
        right: s.right,
        width: s.width,
        order: s.order
      };
    };

    return {
      templateDefault: get(td),
      nav: get(nav),
      wrap: get(wrap),
      header: get(header),
      toggler: get(toggler)
    };
  });

  console.log("Styles:\n", JSON.stringify(styles, null, 2));
  await browser.close();
}

inspectLayoutStyles().catch(console.error);
