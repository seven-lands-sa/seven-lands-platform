import { chromium } from "playwright";

async function main() {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0];
  const gmailPage = context.pages().find(p => p.url().includes("mail.google.com"));

  if (!gmailPage) {
    console.error("Gmail page not found among open tabs!");
    return;
  }

  console.log("Bringing Gmail tab to front...");
  await gmailPage.bringToFront();
  await gmailPage.waitForTimeout(2000);

  const emails = await gmailPage.evaluate(() => {
    // Collect thread rows
    const rows = Array.from(document.querySelectorAll("tr[role='row']"));
    return rows.map(r => ({
      sender: r.querySelector("[email], .yP, .zF")?.innerText || "",
      subject: r.querySelector(".bog, .bqe")?.innerText || "",
      snippet: r.querySelector(".y2")?.innerText || "",
      date: r.querySelector(".xW")?.innerText || ""
    })).filter(e => e.sender || e.subject);
  });

  console.log("Found emails in inbox:");
  console.log(JSON.stringify(emails.slice(0, 10), null, 2));
}

main().catch(err => console.error(err));
