import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("github.com")) || context.pages()[0];

  await page.goto("https://github.com/seven-lands-sa", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    const isOrg = !!document.querySelector("[itemtype*='Organization'], .org-name, .Header-old");
    const isUser = !!document.querySelector("[itemscope][itemtype*='Person'], .vcard-names");
    const repos = Array.from(document.querySelectorAll("[itemprop='name codeRepository'], a[data-hovercard-type='repository']"))
      .map(el => el.innerText.trim());

    return {
      title: document.title,
      currentUrl: window.location.href,
      isOrg,
      isUser,
      repos,
      rawTextSummary: document.body.innerText.slice(0, 1500)
    };
  });

  console.log(JSON.stringify(res, null, 2));
}

main().catch(err => {
  console.error("Error inspecting GitHub:", err);
  process.exit(1);
});
