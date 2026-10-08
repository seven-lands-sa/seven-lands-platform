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
await page.setViewportSize({ width: 1024, height: 900 });
await page.goto(`${BASE}/admin/collections/users`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const report = await page.evaluate(() => {
  const doc = document.documentElement;
  const describe = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className).slice(0, 80),
      rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) },
      position: s.position, transform: s.transform, inset: `${s.left}/${s.right}/${s.top}`,
      overflowX: s.overflowX, display: s.display, width: s.width, maxWidth: s.maxWidth,
    };
  };
  const leftOffenders = [...document.querySelectorAll("body *")]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left < -2; })
    .slice(0, 10)
    .map(describe);
  const wide = [...document.querySelectorAll("body *")]
    .filter((el) => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 200)
    .slice(0, 10)
    .map((el) => ({ ...describe(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  return {
    doc: { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, dir: doc.dir },
    nav: describe(document.querySelector(".nav")),
    navContainer: describe(document.querySelector(".nav__wrap, .template-default__nav, .nav")),
    template: describe(document.querySelector(".template-default")),
    hamburger: describe(document.querySelector(".nav-toggler, .hamburger, .nav__header")),
    leftOffenders, wide,
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
