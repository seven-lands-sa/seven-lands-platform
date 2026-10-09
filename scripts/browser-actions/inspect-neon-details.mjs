import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("neon.tech")) || context.pages()[0];

  console.log("Navigating to Neon Seven Lands project...");
  await page.bringToFront();
  await page.goto("https://console.neon.tech/app/org-icy-heart-03425746/projects", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Click on 'Seven Lands' project
  const projectLink = page.locator("a:has-text('Seven Lands')").first();
  if (await projectLink.count() > 0) {
    console.log("Clicking Seven Lands project link...");
    await projectLink.click();
    await page.waitForTimeout(4000);
  }

  console.log("Project page URL:", page.url());
  console.log("Project page Title:", await page.title());

  // Check connection details
  const text = await page.evaluate(() => document.body.innerText.slice(0, 2500));
  console.log("Neon Project Content Snippet:\n", text);
}

main().catch(err => console.error(err));
