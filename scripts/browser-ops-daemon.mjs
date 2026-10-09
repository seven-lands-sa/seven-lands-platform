import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const PROFILE_DIR = "D:\\seven-lands\\browser-ops-profile";
const CONTROL_PORT = 9223;

console.log("[BrowserOps] Starting persistent operations browser...");
console.log(`[BrowserOps] Profile directory: ${PROFILE_DIR}`);

// Launch persistent visible browser
const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: null, // use native window sizing
  args: [
    "--start-maximized",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-blink-features=AutomationControlled", // avoid anti-bot detection during manual login
  ],
});

// Ensure initial test tab is open
const initialPage = context.pages()[0] || (await context.newPage());
await initialPage.goto("https://github.com/seven-lands-sa", { waitUntil: "domcontentloaded" });
await initialPage.bringToFront();

console.log(`[BrowserOps] Test tab opened: https://github.com/seven-lands-sa`);
console.log(`[BrowserOps] Page Title: ${await initialPage.title()}`);

// Lightweight HTTP Control Server for agent inspection and navigation
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  try {
    const url = new URL(req.url, `http://127.0.0.1:${CONTROL_PORT}`);

    if (req.method === "GET" && url.pathname === "/status") {
      const pages = context.pages();
      const pageList = await Promise.all(
        pages.map(async (p, idx) => ({
          index: idx,
          url: p.url(),
          title: await p.title().catch(() => ""),
        }))
      );
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, activePages: pageList }));
    }

    if (req.method === "POST" && url.pathname === "/open") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { targetUrl } = JSON.parse(body || "{}");
      if (!targetUrl) {
        res.writeHead(400);
        return res.end(JSON.stringify({ ok: false, error: "targetUrl required" }));
      }
      const page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, url: page.url(), title: await page.title() }));
    }

    if (req.method === "GET" && url.pathname === "/inspect") {
      const index = parseInt(url.searchParams.get("index") || "0", 10);
      const page = context.pages()[index];
      if (!page) {
        res.writeHead(404);
        return res.end(JSON.stringify({ ok: false, error: "Page index not found" }));
      }
      const title = await page.title();
      const currentUrl = page.url();
      const text = await page.evaluate(() => document.body?.innerText?.slice(0, 5000) || "");
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, index, url: currentUrl, title, text }));
    }

    if (req.method === "POST" && url.pathname === "/focus") {
      const index = parseInt(url.searchParams.get("index") || "0", 10);
      const page = context.pages()[index];
      if (page) await page.bringToFront();
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
});

server.listen(CONTROL_PORT, "127.0.0.1", () => {
  console.log(`[BrowserOps] Control API listening on http://127.0.0.1:${CONTROL_PORT}`);
  console.log(`[BrowserOps] BROWSER READY FOR OWNER INTERACTION.`);
});
