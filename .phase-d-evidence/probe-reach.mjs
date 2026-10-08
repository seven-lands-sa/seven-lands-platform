import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const CSS = `.collection-list__tables, .table-wrap { overflow-x: auto; } .collection-list .table, .table-wrap .table { left: auto; right: auto; padding-inline: 0; }`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
await page.setViewportSize({ width: 1024, height: 900 });
await page.goto(`${BASE}/admin/collections/users`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: CSS });
await page.waitForTimeout(800);
const report = await page.evaluate(async () => {
  const wrap = document.querySelector(".collection-list__tables");
  const table = document.querySelector(".table");
  const firstCell = document.querySelector(".table table tbody tr td, .table table tbody tr th");
  const before = {
    wrapScrollWidth: wrap.scrollWidth, wrapClientWidth: wrap.clientWidth,
    tableScrollWidth: table.scrollWidth, tableClientWidth: table.clientWidth,
    firstCellRect: firstCell ? Math.round(firstCell.getBoundingClientRect().left) : null,
    cellText: firstCell?.textContent?.slice(0, 30),
  };
  wrap.scrollLeft = -99999; // RTL: scroll to the logical end
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  const after = { scrollLeft: wrap.scrollLeft, firstCellRect: firstCell ? Math.round(firstCell.getBoundingClientRect().left) : null };
  return { before, after, docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
