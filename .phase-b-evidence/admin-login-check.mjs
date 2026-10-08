/**
 * Drives the real admin UI in a browser: load /admin, log in with the seeded Super Admin,
 * and confirm the dashboard renders in Arabic RTL. This is the flow the owner will perform.
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-SA" });
const page = await context.newPage();

await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 60000 });
const dir = await page.getAttribute("html", "dir");
const lang = await page.getAttribute("html", "lang");
console.log(`  /admin loaded — <html dir="${dir}" lang="${lang}">`);

await page.waitForSelector('input[name="email"]', { timeout: 30000 });
await page.fill('input[name="email"]', env.SEED_SUPER_ADMIN_EMAIL);
await page.fill('input[name="password"]', env.SEED_SUPER_ADMIN_PASSWORD);
await page.click('button[type="submit"]');

await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(3000);

const body = await page.innerText("body");
const signedIn = !page.url().endsWith("/login");
const arabic = /المستخدمون|لوحة التحكم|الأدوار|الوسائط|سجل/.test(body);
const errorText = /غير صحيح|خطأ|invalid|مرفوض/i.test(body);

console.log(`  after submit — url ${new URL(page.url()).pathname} · signedIn=${signedIn} · arabicNav=${arabic} · errorShown=${errorText}`);
await page.screenshot({ path: ".phase-b-evidence/admin-after-login.png", fullPage: false });

// navigate to Users and Roles to prove the collections render with data
for (const [path, expect] of [["/admin/collections/users", /owner@sevenlands\.test/], ["/admin/collections/roles", /مدير النظام/]]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const text = await page.innerText("body");
  console.log(`  ${path} → ${expect.test(text) ? "✅ renders with data" : "⚠️ content not found"}`);
  await page.screenshot({ path: `.phase-b-evidence/admin-${path.split("/").pop()}.png`, fullPage: false });
}

await browser.close();
