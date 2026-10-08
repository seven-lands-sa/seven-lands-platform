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

for (const path of ["/admin/collections/users", "/admin/collections/media"]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const doc = document.documentElement;
    const wide = [...document.querySelectorAll("body *")]
      .map((el) => ({ el, r: el.getBoundingClientRect(), cls: String(el.className).slice(0, 44), tag: el.tagName.toLowerCase() }))
      .filter((x) => x.r.right > doc.clientWidth + 2)
      .sort((a, b) => b.r.width - a.r.width);
    const table = document.querySelector("table");
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      tableWidth: table ? Math.round(table.getBoundingClientRect().width) : null,
      tableParent: table ? `${table.parentElement?.tagName.toLowerCase()}.${String(table.parentElement?.className).slice(0, 40)}` : null,
      widest: wide.slice(0, 6).map((x) => ({ tag: x.tag, cls: x.cls, w: Math.round(x.r.width), right: Math.round(x.r.right), pos: getComputedStyle(x.el).position })),
    };
  });
  console.log(path, JSON.stringify(info, null, 1));
}
await browser.close();
