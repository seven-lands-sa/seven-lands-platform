import { chromium } from 'playwright';

async function inspectGrid() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);

  const res = await page.evaluate(() => {
    const td = document.querySelector('.template-default');
    const s = window.getComputedStyle(td);
    const nav = document.querySelector('.nav');
    const navS = window.getComputedStyle(nav);
    const wrap = document.querySelector('.template-default__wrap');
    const wrapS = window.getComputedStyle(wrap);

    return {
      tdGridColumns: s.gridTemplateColumns,
      navGridColumn: navS.gridColumn,
      wrapGridColumn: wrapS.gridColumn,
      navLeft: navS.left,
      navRight: navS.right,
      navBorderRight: navS.borderRight,
      navBorderLeft: navS.borderLeft
    };
  });

  console.log("Grid Info:\n", JSON.stringify(res, null, 2));
  await browser.close();
}

inspectGrid().catch(console.error);
