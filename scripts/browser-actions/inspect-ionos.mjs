import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("ionos.com")) || context.pages()[0];

  console.log("Bringing IONOS page to front...");
  await page.bringToFront();
  await page.goto("https://my.ionos.com/domain/details/7-lands.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  console.log("IONOS URL:", page.url());
  console.log("IONOS Title:", await page.title());

  const pageData = await page.evaluate(() => {
    // Check for DNS tab or link
    const links = Array.from(document.querySelectorAll("a, button, [role='tab']")).map(el => ({
      text: el.innerText?.trim(),
      href: el.getAttribute("href")
    })).filter(l => l.text);

    return {
      title: document.title,
      url: window.location.href,
      bodyText: document.body.innerText.slice(0, 3000),
      links: links.filter(l => l.text.toLowerCase().includes("dns") || l.text.toLowerCase().includes("email") || l.text.toLowerCase().includes("mail") || l.text.toLowerCase().includes("record"))
    };
  });

  console.log("IONOS Domain Overview:");
  console.log("URL:", pageData.url);
  console.log("Relevant navigation links:", JSON.stringify(pageData.links, null, 2));
  console.log("Snippet:", pageData.bodyText.slice(0, 1000));
}

main().catch(err => console.error(err));
