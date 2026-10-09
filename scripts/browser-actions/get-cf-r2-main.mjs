import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("cloudflare.com"));

  const mainContent = await page.evaluate(() => {
    const main = document.querySelector("main, [role='main']");
    if (main) return main.innerText;
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, button, a")).map(el => el.innerText.trim()).filter(Boolean);
    return headings.join("\n");
  });

  console.log("Main Area:\n", mainContent);
}

main().catch(err => console.error(err));
