import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const CSS = `
@media (max-width: 1279px) {
  .collection-list__tables { overflow-x: auto; }
  .template-default .collection-list .table { width: 100%; max-width: 100%; left: auto; padding-left: 0; }
  .template-default .collection-list .table::after { padding-right: 0; }
}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

for (const width of [390, 768, 1024, 1440]) {
  for (const [name, path] of [
    ["users", "/admin/collections/users"],
    ["roles", "/admin/collections/roles"],
    ["audit", "/admin/collections/audit-events"],
    ["media", "/admin/collections/media"],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: CSS });
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      const doc = document.documentElement;
      const table = document.querySelector(".table");
      const inner = document.querySelector(".table table");
      const cells = [...document.querySelectorAll(".table table th, .table table td")];
      const rects = cells.map((cell) => cell.getBoundingClientRect());
      const outside = rects.filter((r) => r.right > doc.clientWidth + 2 || r.left < -2).length;
      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        tableBox: table ? [Math.round(table.getBoundingClientRect().left), Math.round(table.getBoundingClientRect().right)] : null,
        tableScroll: table ? table.scrollWidth - table.clientWidth : null,
        innerWidth: inner ? Math.round(inner.getBoundingClientRect().width) : null,
        cellsOutside: outside,
        cellCount: cells.length,
      };
    });
    console.log(`${width}-${name}: overflow=${state.overflow} tableScroll=${state.tableScroll} box=${JSON.stringify(state.tableBox)} cellsOutside=${state.cellsOutside}/${state.cellCount}`);
  }
}
await browser.close();
