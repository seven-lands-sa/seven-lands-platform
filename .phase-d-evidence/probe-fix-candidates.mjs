import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const CANDIDATES = {
  A: `.collection-list .table, .table-wrap .table { left: auto; right: auto; padding-inline: 0; }`,
  B: `.collection-list .table, .table-wrap .table { left: 0; right: 0; padding-inline: 0; }`,
  C: `.collection-list__tables, .table-wrap { overflow-x: auto; } .collection-list .table, .table-wrap .table { left: auto; right: auto; }`,
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

for (const [key, css] of Object.entries(CANDIDATES)) {
  const results = [];
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, path] of [
      ["users", "/admin/collections/users"],
      ["roles", "/admin/collections/roles"],
      ["audit", "/admin/collections/audit-events"],
    ]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: css });
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => {
        const doc = document.documentElement;
        const table = document.querySelector(".table");
        return {
          overflowPx: doc.scrollWidth - doc.clientWidth,
          tableScrollable: table ? table.scrollWidth > table.clientWidth : null,
          tableLeft: table ? Math.round(table.getBoundingClientRect().left) : null,
          tableRight: table ? Math.round(table.getBoundingClientRect().right) : null,
        };
      });
      results.push(`${width}-${name}: overflow=${state.overflowPx}px tableScrollable=${state.tableScrollable} box=[${state.tableLeft},${state.tableRight}]`);
    }
  }
  console.log(`\n### candidate ${key}`);
  results.forEach((line) => console.log(" ", line));
}
await browser.close();
