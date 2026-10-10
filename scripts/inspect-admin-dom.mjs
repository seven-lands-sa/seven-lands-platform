import { chromium } from 'playwright';

async function inspectAdminDOM() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("https://7-lands.com/admin/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').first().fill("admin@7-lands.com");
  await page.locator('input[type="password"]').first().fill("SevenLands#2026!SecureRootAdmin");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  const domAnalysis = await page.evaluate(() => {
    const htmlDir = document.documentElement.getAttribute('dir');
    const htmlLang = document.documentElement.getAttribute('lang');
    
    // Find layout containers
    const appHeader = document.querySelector('.app-header');
    const nav = document.querySelector('.nav');
    const templateDefault = document.querySelector('.template-default');
    const templateWrap = document.querySelector('.template-default__wrap');
    
    // Dashboard cards
    const cards = Array.from(document.querySelectorAll('.card, [class*="card"]')).slice(0, 3).map(c => ({
      className: c.className,
      innerHTML: c.innerHTML.slice(0, 150)
    }));

    return {
      htmlDir,
      htmlLang,
      appHeaderClasses: appHeader?.className,
      navClasses: nav?.className,
      templateDefaultClasses: templateDefault?.className,
      templateWrapClasses: templateWrap?.className,
      templateDefaultParentTag: templateDefault?.parentElement?.tagName,
      templateDefaultDisplay: templateDefault ? window.getComputedStyle(templateDefault).display : null,
      templateWrapDisplay: templateWrap ? window.getComputedStyle(templateWrap).display : null,
      navDisplay: nav ? window.getComputedStyle(nav).position : null,
      cards
    };
  });

  console.log("DOM Analysis:\n", JSON.stringify(domAnalysis, null, 2));
  await browser.close();
}

inspectAdminDOM().catch(console.error);
