/**
 * PHASE D §47 — PUBLIC BUNDLE ISOLATION.
 *
 * Measures what the browser actually downloads, per route, on the build that is running:
 *   • PUBLIC  — 12 public routes (both locales)
 *   • ADMIN   — the admin surfaces Phase D built
 *   • OVERLAP — assets loaded by both (the shared Next runtime, and nothing else, is the goal)
 *   • ADMIN_CODE_LEAK — does any asset loaded by a PUBLIC route carry admin code?
 *
 * Content is fetched for every unique asset so the leak check looks at bytes, not file names.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.MEASURE_BASE ?? "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const PUBLIC_ROUTES = [
  "/ar", "/en",
  "/ar/about", "/en/about",
  "/ar/services", "/en/services",
  "/ar/work", "/en/work",
  "/ar/insights", "/en/insights",
  "/ar/contact", "/en/contact",
];
const ADMIN_ROUTES = ["/admin/collections/media", "/admin/media-picker", "/admin/collections/users"];

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

/** Collect every script/stylesheet the page loads, with its byte length. */
const collect = async (route) => {
  const assets = new Map();
  const listener = async (response) => {
    const type = response.request().resourceType();
    if (type !== "script" && type !== "stylesheet") return;
    const url = response.url();
    if (!url.startsWith(BASE)) return;
    if (assets.has(url)) return;
    let bytes = 0;
    try {
      bytes = (await response.body()).length;
    } catch {
      bytes = 0;
    }
    assets.set(url, { bytes, type });
  };
  page.on("response", listener);
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  page.off("response", listener);
  return assets;
};

const publicAssets = new Map();
for (const route of PUBLIC_ROUTES) {
  const found = await collect(route);
  for (const [url, meta] of found) publicAssets.set(url, meta);
  console.log(`  public ${route.padEnd(16)} ${found.size} assets`);
}

/* log in once, then measure the admin surfaces */
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', value("SEED_SUPER_ADMIN_EMAIL"));
await page.fill('input[name="password"]', value("SEED_SUPER_ADMIN_PASSWORD"));
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 });

const adminAssets = new Map();
for (const route of ADMIN_ROUTES) {
  const found = await collect(route);
  for (const [url, meta] of found) adminAssets.set(url, meta);
  console.log(`  admin  ${route.padEnd(28)} ${found.size} assets`);
}

const sum = (map) => [...map.values()].reduce((total, meta) => total + meta.bytes, 0);
const overlap = [...publicAssets.keys()].filter((url) => adminAssets.has(url));
const publicOnly = [...publicAssets.keys()].filter((url) => !adminAssets.has(url));

/* ADMIN_CODE_LEAK — search the bytes of every asset a PUBLIC route loads. */
const markers = ["payloadcms", "@payloadcms", "payload/config", "MediaLibraryView", "pk_test"];
const leaks = [];
const request = context.request;
for (const url of publicAssets.keys()) {
  let text = "";
  try {
    const response = await request.get(url);
    text = await response.text();
  } catch {
    continue;
  }
  for (const marker of markers) {
    if (text.includes(marker)) leaks.push({ url, marker });
  }
}

const publicBytes = sum(publicAssets);
const adminBytes = sum(adminAssets);
const overlapBytes = overlap.reduce((total, url) => total + (publicAssets.get(url)?.bytes ?? 0), 0);

const report = {
  at: new Date().toISOString(),
  public: { files: publicAssets.size, bytes: publicBytes },
  admin: { files: adminAssets.size, bytes: adminBytes },
  overlap: { files: overlap.length, bytes: overlapBytes, urls: overlap.map((url) => url.replace(BASE, "")) },
  publicOnly: publicOnly.length,
  adminCodeLeak: leaks,
};

console.log(`\nPUBLIC_BUNDLE ............ ${report.public.files} files / ${publicBytes.toLocaleString("en-US")} B`);
console.log(`ADMIN_BUNDLE ............. ${report.admin.files} files / ${adminBytes.toLocaleString("en-US")} B`);
console.log(`OVERLAP .................. ${report.overlap.files} files / ${overlapBytes.toLocaleString("en-US")} B (${overlap.map((u) => u.replace(BASE, "")).join(", ") || "none"})`);
console.log(`ADMIN_CODE_LEAK .......... ${leaks.length === 0 ? "NO" : JSON.stringify(leaks)}`);

writeFileSync(".phase-d-evidence/bundle-isolation.json", JSON.stringify(report, null, 2));
await browser.close();
