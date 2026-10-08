/** Phase D §32 — find the exact element chain behind the admin table overflow at ≤1024px. */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (key) => env.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

for (const [name, path] of [
  ["users", "/admin/collections/users"],
  ["roles", "/admin/collections/roles"],
  ["audit", "/admin/collections/audit-events"],
  ["media", "/admin/collections/media"],
]) {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const found = await page.evaluate(() => {
    const doc = document.documentElement;
    const report = {
      viewport: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      chain: [],
    };
    const offenders = [...document.querySelectorAll("body *")].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.right > doc.clientWidth + 2;
    });
    report.count = offenders.length;
    report.samples = offenders.slice(0, 12).map((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")} w=${Math.round(rect.width)} right=${Math.round(rect.right)} overflowX=${style.overflowX} minW=${style.minWidth}`;
    });
    const table = document.querySelector(".table");
    if (table) {
      let node = table;
      const chain = [];
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        chain.push({
          tag: node.tagName.toLowerCase(),
          cls: String(node.className).split(" ").slice(0, 3).join("."),
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          overflowX: style.overflowX,
          minWidth: style.minWidth,
          display: style.display,
        });
        node = node.parentElement;
      }
      report.tableChain = chain;
    }
    return report;
  });
  console.log(`\n=== ${name} @1024 ===`);
  console.log(JSON.stringify(found, null, 1));
}

await browser.close();
