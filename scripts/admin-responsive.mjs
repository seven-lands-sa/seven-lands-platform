/**
 * §16 — ADMIN RESPONSIVE INSPECTION at 390 / 768 / 1024 / 1440.
 *
 * Automated signal: horizontal overflow, elements wider than the viewport, and the admin's own
 * error overlay. Screenshots are kept for the surfaces the brief names so the owner can see them.
 * This is an inspection pass, not a redesign.
 */
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";

const BASE = process.env.ADMIN_BASE ?? "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (key) => env.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const SURFACES = [
  ["site-settings", "/admin/globals/site-settings"],
  ["contact", "/admin/globals/contact-settings"],
  ["business-hours", "/admin/globals/business-hours"],
  ["social", "/admin/globals/social-accounts"],
  ["navigation", "/admin/globals/navigation"],
  ["footer", "/admin/globals/footer"],
  ["media-list", "/admin/collections/media"],
  ["media-picker", "/admin/media-picker"],
  ["users", "/admin/collections/users"],
];
const WIDTHS = [390, 768, 1024, 1440];
const OUT = process.env.ADMIN_SHOT_DIR ?? ".phase-c-evidence/admin";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });
console.log("logged in as", value("SEED_SUPER_ADMIN_EMAIL"));

const findings = [];
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  for (const [name, path] of SURFACES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflowing = [...document.querySelectorAll("body *")].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > doc.clientWidth + 2;
      });
      return {
        viewport: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
        overflow: doc.scrollWidth > doc.clientWidth + 2,
        offenders: overflowing.slice(0, 4).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`),
        errorOverlay: Boolean(document.querySelector("nextjs-portal, .payload__error")),
        heading: document.querySelector("h1")?.textContent?.slice(0, 40) ?? null,
      };
    });
    await page.screenshot({ path: `${OUT}/${width}-${name}.png`, fullPage: false });
    const row = { width, surface: name, ...state };
    findings.push(row);
    const flag = state.overflow ? `  ⟵ OVERFLOW (${state.offenders.join(", ")})` : "";
    console.log(`  ${String(width).padEnd(5)} ${name.padEnd(15)} h1=${String(state.heading).slice(0, 28).padEnd(30)} scroll=${state.scrollWidth}/${state.viewport}${flag}`);
  }
}
const problems = findings.filter((f) => f.overflow || f.errorOverlay);
console.log(`\n  surfaces checked: ${findings.length} · overflow/error findings: ${problems.length}`);
for (const p of problems) console.log(`    ${p.width}px ${p.surface}: ${p.overflow ? "overflow" : ""}${p.errorOverlay ? " error-overlay" : ""} ${p.offenders.join(", ")}`);
await browser.close();
process.exit(problems.length ? 1 : 0);
