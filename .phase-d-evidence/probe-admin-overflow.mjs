/**
 * §32 — measure the admin list container before touching any CSS.
 * Reports documentElement overflow, the widest offenders, and the exact box metrics of the table
 * wrappers so the fix targets the real element instead of guessing from a screenshot.
 */
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

const surfaces = [
  ["users", "/admin/collections/users"],
  ["roles", "/admin/collections/roles"],
  ["audit-events", "/admin/collections/audit-events"],
  ["media", "/admin/collections/media"],
];

const candidates = {
  "A · overflow container on the table wrapper + inner min-width": `
    @media (max-width: 1200px) {
      .collection-list__tables, .table-wrap { overflow-x: auto; overscroll-behavior-x: contain; }
      .table { min-width: 100%; }
    }`,
  "B · cancel the gutter bleed, keep the inner scroll": `
    @media (max-width: 1200px) {
      .collection-list__tables, .table-wrap { overflow-x: auto; }
      .collection-list .table, .table-wrap .table { left: auto; right: auto; padding-inline: 0; width: 100%; }
    }`,
  "C · neutralise relative offsets only": `
    @media (max-width: 1200px) {
      .collection-list .table, .table-wrap .table { left: auto; right: auto; }
    }`,
};

const measure = async (name) =>
  page.evaluate(
    ({ surface }) => {
      const doc = document.documentElement;
      const boxes = [...document.querySelectorAll(".table, .table-wrap, .collection-list__tables, table")].map((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          sel: `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}`,
          box: [Math.round(rect.left), Math.round(rect.right)],
          width: Math.round(rect.width),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          padding: `${style.paddingLeft} / ${style.paddingRight}`,
          position: style.position,
          left: style.left,
          right: style.right,
          minWidth: style.minWidth,
          overflowX: style.overflowX,
          display: style.display,
        };
      });
      const offenders = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && (rect.right > doc.clientWidth + 2 || rect.left < -2);
        })
        .slice(0, 6)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`);
      return { surface, client: doc.clientWidth, scroll: doc.scrollWidth, boxes, offenders };
    },
    { surface: name },
  );

for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const [name, path] of surfaces) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const before = await measure(name);
    console.log(`\n── ${name} @ ${width} ── scroll ${before.scroll} vs ${before.client}${before.scroll > before.client ? "  ⚠ OVERFLOW" : ""}`);
    for (const box of before.boxes) console.log("   ", JSON.stringify(box));
    if (before.offenders.length) console.log("    offenders:", before.offenders.join(" | "));

    for (const [label, css] of Object.entries(candidates)) {
      await page.addStyleTag({ content: css });
      await page.waitForTimeout(150);
      const after = await measure(name);
      const ok = after.scroll <= after.client + 2;
      console.log(`    ${ok ? "✓" : "✗"} ${label} → scroll ${after.scroll}/${after.client} ; boxes ${after.boxes.map((b) => `${b.sel}[${b.box.join(",")}]`).join(" ")}`);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(500);
    }
  }
}
await browser.close();
