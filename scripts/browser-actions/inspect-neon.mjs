import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("neon.tech")) || context.pages()[0];

  console.log("Bringing Neon page to front...");
  await page.bringToFront();
  await page.goto("https://console.neon.tech/app/org-icy-heart-03425746/projects", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("Neon URL:", page.url());
  console.log("Neon Title:", await page.title());

  const neonData = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText.slice(0, 2000),
      buttons: Array.from(document.querySelectorAll("button, a")).map(b => b.innerText.trim()).filter(Boolean)
    };
  });

  console.log("Neon Snippet:\n", neonData.bodyText.slice(0, 1000));
}

main().catch(err => console.error(err));
