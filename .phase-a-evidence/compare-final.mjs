/**
 * Phase A — definitive public-site comparison.
 *
 * Left  side: the PRE-PAYLOAD app, rebuilt from backups/phase-a-baseline-20261007-1412.tar.gz
 *             and served on :3200 (identical source, no Payload in the dependency tree).
 * Right side: the CURRENT Phase A build served on :3000.
 *
 * Two independent tests:
 *   1. CONTENT  — visible text and DOM skeleton of every public route.
 *   2. PIXELS   — full-page screenshots at 390 and 1440, compared with sharp.
 *
 * Usage: node .phase-a-evidence/compare-final.mjs
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BEFORE = "http://127.0.0.1:3200";
const AFTER = "http://127.0.0.1:3000";

const routes = [
  "/ar",
  "/en",
  "/ar/services",
  "/en/services",
  "/ar/services/branding-creative",
  "/ar/work",
  "/ar/insights",
  "/ar/about",
  "/ar/start-a-project",
  "/en/start-a-project",
  "/ar/contact",
  "/ar/privacy",
  "/ar/this-page-does-not-exist",
];

const viewports = [
  { label: "390", width: 390, height: 900 },
  { label: "1440", width: 1440, height: 1000 },
];

const outDir = ".phase-a-evidence/compare";
await mkdir(outDir, { recursive: true });

// ── helpers ───────────────────────────────────────────────────────────────────
const stripToText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** DOM skeleton: tag names and their class attributes, in document order. */
const skeleton = (html) =>
  [...html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)]
    .map(([, tag, attrs]) => {
      const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? "";
      return cls ? `${tag.toLowerCase()}[${cls}]` : tag.toLowerCase();
    })
    .join(" ");

const normaliseNoise = (s) =>
  s
    .replace(/\/_next\/static\/[^"'\s<>]+/g, "/_next/static/X")
    .replace(/\\"static\/[^"\\]+\\"/g, '\\"static\\"')
    .replace(/"[bB]":"[A-Za-z0-9_-]{8,}"/g, '"b":"X"')
    .replace(/\b[0-9a-f]{16,}\b/g, "X");

// ── 1. CONTENT ────────────────────────────────────────────────────────────────
console.log("═".repeat(78));
console.log("1. CONTENT COMPARISON — visible text + DOM skeleton");
console.log("═".repeat(78));
console.log(
  "route".padEnd(40) + "status".padEnd(12) + "text identical".padEnd(16) + "skeleton identical",
);

const contentResults = [];
for (const route of routes) {
  const [bRes, aRes] = await Promise.all([fetch(BEFORE + route), fetch(AFTER + route)]);
  const [bHtml, aHtml] = await Promise.all([bRes.text(), aRes.text()]);

  const bText = stripToText(bHtml);
  const aText = stripToText(aHtml);
  const bSkel = skeleton(bHtml);
  const aSkel = skeleton(aHtml);

  const textSame = bText === aText;
  const skelSame = bSkel === aSkel;

  contentResults.push({ route, statusBefore: bRes.status, statusAfter: aRes.status, textSame, skelSame });

  console.log(
    route.padEnd(40) +
      `${bRes.status}/${aRes.status}`.padEnd(12) +
      (textSame ? "YES ✅" : `NO (${aText.length} vs ${bText.length} chars)`).padEnd(16) +
      (skelSame ? "YES ✅" : "NO"),
  );

  if (!textSame) {
    // Show the first divergence so it is diagnosable, not just a red flag.
    let i = 0;
    while (i < Math.min(bText.length, aText.length) && bText[i] === aText[i]) i += 1;
    console.log(`      first difference at char ${i}:`);
    console.log(`        before: …${bText.slice(Math.max(0, i - 60), i + 90)}…`);
    console.log(`        after : …${aText.slice(Math.max(0, i - 60), i + 90)}…`);
  }

  // Raw byte-level view, noise removed — kept for the record.
  const bNorm = normaliseNoise(bHtml);
  const aNorm = normaliseNoise(aHtml);
  if (bNorm !== aNorm) {
    let i = 0;
    while (i < Math.min(bNorm.length, aNorm.length) && bNorm[i] === aNorm[i]) i += 1;
    console.log(`      (normalised HTML differs at ${i} of ${bNorm.length}/${aNorm.length} chars)`);
    console.log(`        before: …${JSON.stringify(bNorm.slice(Math.max(0, i - 50), i + 70))}…`);
    console.log(`        after : …${JSON.stringify(aNorm.slice(Math.max(0, i - 50), i + 70))}…`);
  }
}

// ── 2. PIXELS ─────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(78));
console.log("2. PIXEL COMPARISON — full-page screenshots, same browser, same code path");
console.log("═".repeat(78));
console.log("route".padEnd(38) + "viewport".padEnd(12) + "differing pixels".padEnd(20) + "verdict");

const browser = await chromium.launch();

for (const route of routes) {
  for (const vp of viewports) {
    const shot = async (origin, file) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(origin + route, { waitUntil: "networkidle", timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      // Freeze reveal animations so the comparison is deterministic.
      await page.addStyleTag({
        content: "[data-reveal]{opacity:1 !important;transform:none !important}",
      });
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += window.innerHeight;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 40);
            else resolve();
          };
          step();
        });
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      const path = `${outDir}/${file}.png`;
      await page.screenshot({ path, fullPage: true });
      await context.close();
      return path;
    };

    const name = route.replace(/^\//, "").replaceAll("/", "_") || "root";
    const [bPath, aPath] = await Promise.all([
      shot(BEFORE, `before-${name}-${vp.label}`),
      shot(AFTER, `after-${name}-${vp.label}`),
    ]);

    const [bMeta, aMeta] = await Promise.all([sharp(bPath).metadata(), sharp(aPath).metadata()]);
    if (bMeta.width !== aMeta.width || bMeta.height !== aMeta.height) {
      console.log(
        route.padEnd(38) +
          vp.label.padEnd(12) +
          "—".padEnd(20) +
          `DIMENSIONS DIFFER ${bMeta.width}x${bMeta.height} vs ${aMeta.width}x${aMeta.height}`,
      );
      continue;
    }

    const [bRaw, aRaw] = await Promise.all([
      sharp(bPath).ensureAlpha().raw().toBuffer(),
      sharp(aPath).ensureAlpha().raw().toBuffer(),
    ]);
    let diff = 0;
    let significant = 0;
    for (let i = 0; i < bRaw.length; i += 4) {
      const d =
        Math.abs(bRaw[i] - aRaw[i]) + Math.abs(bRaw[i + 1] - aRaw[i + 1]) + Math.abs(bRaw[i + 2] - aRaw[i + 2]);
      if (d > 0) diff += 1;
      if (d > 30) significant += 1;
    }
    const total = bRaw.length / 4;
    const pct = (diff / total) * 100;
    const sigPct = (significant / total) * 100;
    console.log(
      route.padEnd(38) +
        vp.label.padEnd(12) +
        `${pct.toFixed(4)}% (>10/255: ${sigPct.toFixed(4)}%)`.padEnd(20) +
        (pct === 0 ? "IDENTICAL ✅" : sigPct > 0.5 ? "REVIEW ⚠" : "sub-pixel noise"),
    );
  }
}

await browser.close();

const textFailures = contentResults.filter((r) => !r.textSame).length;
const skelFailures = contentResults.filter((r) => !r.skelSame).length;
const statusFailures = contentResults.filter((r) => r.statusBefore !== r.statusAfter).length;
console.log("\nSUMMARY — routes compared:", routes.length);
console.log("  status mismatches      :", statusFailures);
console.log("  visible-text mismatches:", textFailures);
console.log("  DOM-skeleton mismatches:", skelFailures);
