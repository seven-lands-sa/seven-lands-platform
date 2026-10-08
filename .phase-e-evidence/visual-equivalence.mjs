/**
 * PHASE E §42/§44 — visual equivalence for the migrated pages.
 *
 * Captures each URL twice with the real browser: once with the CMS page published, once after
 * unpublishing that locale (which serves the shipped static composition), then diffs the PNGs with
 * the project's own pixel-diff tool. Always restores the published state.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
const OUT = ".phase-e-evidence/visual";
mkdirSync(OUT, { recursive: true });

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };

const pages = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "start-a-project", path: "/start-a-project" },
  { key: "privacy", path: "/privacy" },
];
const locales = ["ar", "en"];

const toggle = async (systemKey, locale, mode) => {
  const list = await (await fetch(`${BASE}/api/pages?where[systemKey][equals]=${systemKey}&limit=1&draft=true&locale=ar`, { headers: auth })).json();
  const id = list.docs[0].id;
  const res = await fetch(`${BASE}/api/pages/${id}/${mode === "static" ? "unpublish" : "publish"}`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ locales: [locale] }),
  });
  if (!res.ok) throw new Error(`${mode} failed for ${systemKey}/${locale}: ${res.status}`);
};

const browser = await chromium.launch();
const shot = async (file, url) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    /* freeze animations/transitions so the two captures differ only in content */
    for (let y = 0; y < document.body.scrollHeight; y += 400) window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 30));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
};

for (const { key, path } of pages) {
  for (const locale of locales) {
    const url = `/${locale}${path}`;
    const cmsFile = `${OUT}/${key}-${locale}-cms.png`;
    const staticFile = `${OUT}/${key}-${locale}-static.png`;
    await shot(cmsFile, url);
    await toggle(key, locale, "static");
    await shot(staticFile, url);
    await toggle(key, locale, "cms");
    console.log(`captured ${key} ${locale}`);
  }
}
await browser.close();

for (const { key } of pages) {
  for (const locale of locales) {
    const a = `${OUT}/${key}-${locale}-cms.png`;
    const b = `${OUT}/${key}-${locale}-static.png`;
    try {
      const out = execFileSync("node", ["scripts/pixel-diff.mjs", a, b], { encoding: "utf8" });
      console.log(`${key} ${locale}: ${out.trim().split("\n").slice(-3).join(" | ")}`);
    } catch (error) {
      console.log(`${key} ${locale}: pixel-diff exit ${error.status}\n${(error.stdout ?? "").toString().slice(0, 400)}`);
    }
  }
}
