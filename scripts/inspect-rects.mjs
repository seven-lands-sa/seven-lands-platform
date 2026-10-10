import { chromium } from 'playwright';

async function inspectNavCSS() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const navBox = await page.evaluate(() => {
    const nav = document.querySelector('.nav');
    const wrap = document.querySelector('.template-default__wrap');
    const toggler = document.querySelector('.template-default__nav-toggler-wrapper');
    const header = document.querySelector('.app-header');

    const rect = (el) => el ? el.getBoundingClientRect() : null;

    return {
      navRect: rect(nav),
      wrapRect: rect(wrap),
      togglerRect: rect(toggler),
      headerRect: rect(header)
    };
  });

  console.log("Bounding Rects:\n", JSON.stringify(navBox, null, 2));
  await browser.close();
}

inspectNavCSS().catch(console.error);
