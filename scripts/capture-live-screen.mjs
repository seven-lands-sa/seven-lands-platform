import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("Navigating to https://7-lands.com/ar ...");
  await page.goto("https://7-lands.com/ar", { waitUntil: "networkidle" });

  // Evaluate computed styles
  const styles = await page.evaluate(() => {
    const body = window.getComputedStyle(document.body);
    const heroTitle = document.querySelector("h1");
    const h1Style = heroTitle ? window.getComputedStyle(heroTitle) : null;
    const nav = document.querySelector("nav");
    const navStyle = nav ? window.getComputedStyle(nav) : null;

    // Check link rel="stylesheet"
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);

    return {
      bodyBg: body.backgroundColor,
      bodyFont: body.fontFamily,
      h1FontSize: h1Style ? h1Style.fontSize : null,
      h1Color: h1Style ? h1Style.color : null,
      navDisplay: navStyle ? navStyle.display : null,
      cssLinksCount: cssLinks.length,
      cssLinks
    };
  });

  console.log("Computed styles report:", JSON.stringify(styles, null, 2));

  await page.screenshot({ path: "scripts/browser-actions/live-restored.png", fullPage: false });
  console.log("Saved screenshot to scripts/browser-actions/live-restored.png");

  await browser.close();
}

main().catch(console.error);
