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
console.log("Payload's OWN lists at 390px (audit-events, roles have no collection config of mine):");
for (const path of ["/admin/collections/audit-events", "/admin/collections/roles", "/admin/collections/users", "/admin/collections/media"]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({ cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }));
  const tables = await page.evaluate(() => document.querySelectorAll("table").length);
  console.log(`  ${path.padEnd(34)} table=${tables}  scrollWidth ${r.sw} / client ${r.cw}  ${r.sw > r.cw + 2 ? "OVERFLOW" : "fits"}`);
}
await browser.close();
