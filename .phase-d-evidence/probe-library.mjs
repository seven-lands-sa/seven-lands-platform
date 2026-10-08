/** Phase D — media library admin UI smoke: grid renders, no console errors, no page overflow. */
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const OUT = ".phase-d-evidence/admin";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text().slice(0, 200));
});
page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url().slice(0, 120)}`));

await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/admin/collections/media`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      overflow: doc.scrollWidth - doc.clientWidth,
      library: Boolean(document.querySelector(".sl-library")),
      empty: Boolean(document.querySelector(".sl-library__empty")),
      grid: Boolean(document.querySelector(".sl-grid")),
      uploadButton: [...document.querySelectorAll("button")].some((b) => b.textContent?.includes("رفع صورة")),
      cards: document.querySelectorAll(".sl-card").length,
      title: document.querySelector(".sl-library__title")?.textContent ?? null,
    };
  });
  console.log(`media@${width}:`, JSON.stringify(state));
  await page.screenshot({ path: `${OUT}/phase-d-${width}-media-library.png`, fullPage: false });
}

/* Picker preview route */
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/admin/media-picker`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const pickerState = await page.evaluate(() => ({
  heading: document.querySelector("h1")?.textContent ?? null,
  chooseButton: [...document.querySelectorAll("button")].some((b) => b.textContent?.includes("اختر صورة")),
}));
console.log("picker route:", JSON.stringify(pickerState));
await page.screenshot({ path: `${OUT}/phase-d-1440-media-picker.png`, fullPage: false });

console.log("consoleErrors:", consoleErrors.length ? consoleErrors : "none");
console.log("failedRequests:", failedRequests.length ? failedRequests : "none");
await browser.close();
