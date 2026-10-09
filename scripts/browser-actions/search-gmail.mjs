import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes("mail.google.com"));

  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("tr[role='row']")).map(r => ({
      sender: r.querySelector(".yP, .zF")?.innerText || "",
      subject: r.querySelector(".bog, .bqe")?.innerText || "",
      snippet: r.querySelector(".y2")?.innerText || ""
    })).filter(r => r.subject);
  });

  console.log("Emails found:");
  for (const r of rows) {
    console.log(`[${r.sender}] ${r.subject} | ${r.snippet.slice(0, 80)}`);
  }
}

main().catch(err => console.error(err));
