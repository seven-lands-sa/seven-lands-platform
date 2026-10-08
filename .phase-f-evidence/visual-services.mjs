/**
 * PHASE F — VISUAL EQUIVALENCE between the shipped pages and the CMS-published pages.
 *
 * The same URLs are photographed twice through a real browser: first with every capability back on
 * its SHIPPED content (nothing published), then with all seven published from the CMS. Both sets are
 * compared pixel by pixel. Zero differing pixels means the migration changed nothing a visitor can
 * see — not a font weight, not a spacing, not an image.
 *
 * Usage: node .phase-f-evidence/visual-services.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const SUPER = { email: process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com", password: process.env.SEED_SUPER_ADMIN_PASSWORD };
if (!SUPER.password) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const TARGETS = [
  { name: "services-hub-ar", path: "/ar/services" },
  { name: "services-hub-en", path: "/en/services" },
  { name: "service-detail-ar", path: "/ar/services/branding-creative" },
  { name: "service-detail-en", path: "/en/services/branding-creative" },
  { name: "home-ar", path: "/ar" },
  { name: "home-en", path: "/en" },
  { name: "work-ar", path: "/ar/work" },
  { name: "insights-en", path: "/en/insights" },
];
const WIDTHS = [1440, 390];
const OUT = new URL("./visual/", import.meta.url);

const login = async () => {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(SUPER),
  });
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  return { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
};

const auth = await login();
const docs = async () => {
  const res = await fetch(`${BASE}/api/services?limit=20&draft=true&locale=ar&depth=0`, { headers: auth });
  return (await res.json()).docs ?? [];
};
const setState = async (publish) => {
  for (const doc of await docs()) {
    await fetch(`${BASE}/api/services/${doc.id}/${publish ? "publish" : "unpublish"}`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ locales: ["ar", "en"] }),
    });
  }
};

const shoot = async (page, label, dirName) => {
  const dir = new URL(`${dirName}/`, OUT);
  mkdirSync(dir, { recursive: true });
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const target of TARGETS) {
      /* Same settling discipline as the accepted QA captures: wait for real network quiet, force
         reveal animations to their end state, then let the document height stay stable. */
      await page.goto(`${BASE}${target.path}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: "[data-reveal]{opacity:1 !important;transform:none !important}" });
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += window.innerHeight;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 40);
            else {
              window.scrollTo(0, 0);
              setTimeout(resolve, 250);
            }
          };
          step();
        });
      });
      await page.evaluate(() => new Promise((resolve) => {
        let last = -1;
        let stable = 0;
        const tick = () => {
          const height = document.body.scrollHeight;
          stable = height === last ? stable + 1 : 0;
          last = height;
          if (stable >= 3) resolve();
          else setTimeout(tick, 150);
        };
        tick();
      }));
      await page.waitForTimeout(300);
      const file = new URL(`${label}-${target.name}-${width}.png`, dir);
      await page.screenshot({ path: file.pathname, fullPage: true });
    }
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1, colorScheme: "light" });

/* 1 · shipped content only */
await setState(false);
await shoot(page, "static", "static");

/* 2 · all seven published from the CMS */
await setState(true);
await shoot(page, "published", "published");

await browser.close();

/* 3 · pixel comparison */
let identical = 0;
const differing = [];
for (const width of WIDTHS) {
  for (const target of TARGETS) {
    const name = `static-${target.name}-${width}.png`;
    const a = new URL(name, new URL("static/", OUT));
    const b = new URL(name.replace(/^static-/, "published-"), new URL("published/", OUT));
    if (!existsSync(a.pathname) || !existsSync(b.pathname)) {
      differing.push(`${name} (missing)`);
      continue;
    }
    const A = await sharp(readFileSync(a.pathname)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const B = await sharp(readFileSync(b.pathname)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (A.info.width !== B.info.width || A.info.height !== B.info.height) {
      differing.push(`${name} (size ${A.info.width}x${A.info.height} vs ${B.info.width}x${B.info.height})`);
      continue;
    }
    let hits = 0;
    for (let i = 0; i < A.data.length; i += 4) {
      if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) hits += 1;
    }
    if (hits === 0) identical += 1;
    else differing.push(`${name} — ${hits} differing pixels`);
  }
}

const total = WIDTHS.length * TARGETS.length;
const report = [
  `PHASE F VISUAL EQUIVALENCE (shipped vs CMS-published)`,
  `${identical}/${total} screenshots pixel-identical`,
  ...differing.map((line) => `  differs: ${line}`),
].join("\n");
writeFileSync(new URL("visual-equivalence.log", OUT).pathname, report, "utf8");
console.log(report);
process.exitCode = differing.length ? 1 : 0;
