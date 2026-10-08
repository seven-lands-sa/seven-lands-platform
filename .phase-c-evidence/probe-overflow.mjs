import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const v = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 900 } })).newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', v("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', v("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
await page.goto(`${BASE}/admin/collections/users`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 50), sw: el.scrollWidth, cw: el.clientWidth, ox: cs.overflowX });
    }
  }
  const th = [...document.querySelectorAll("th")].map((x) => `${x.textContent?.slice(0, 14)}:${Math.round(x.getBoundingClientRect().width)}`);
  return { columns: th };
}), null, 1));
await browser.close();
