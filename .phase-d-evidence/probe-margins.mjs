import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/admin/collections/users`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        sel,
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        margin: `${s.marginLeft} / ${s.marginRight}`,
        padding: `${s.paddingLeft} / ${s.paddingRight}`,
        overflowX: s.overflowX, position: s.position, inset: `${s.left} / ${s.right}`,
      };
    };
    const cssVars = ["--gutter-h", "--nav-width", "--base"];
    const root = getComputedStyle(document.documentElement);
    return {
      doc: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
      navOpen: document.querySelector(".nav")?.getBoundingClientRect().width ?? null,
      elements: [
        pick(".gutter"),
        pick(".collection-list__tables"),
        pick(".table-wrap"),
        pick(".table"),
        pick(".table table"),
      ],
      vars: Object.fromEntries(cssVars.map((v) => [v, root.getPropertyValue(v).trim()])),
    };
  });
  console.log(`\n=== width ${width} ===`);
  console.log(JSON.stringify(out, null, 1));
}
await browser.close();
