import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const OUT = ".phase-a-evidence/after-shots";
await mkdir(OUT, { recursive: true });

const shots = [
  { path: "/ar", w: 390, h: 844, name: "home-390-ar" },
  { path: "/ar", w: 1440, h: 900, name: "home-1440-ar" },
  { path: "/en", w: 1440, h: 900, name: "home-1440-en" },
  { path: "/ar/services/web-commerce-experiences", w: 1440, h: 900, name: "service-1440-ar" },
  { path: "/ar/services/strategy-business-growth", w: 768, h: 1024, name: "service-768-ar" },
  { path: "/ar/work", w: 1440, h: 900, name: "work-1440-ar" },
  { path: "/ar/this-page-does-not-exist", w: 390, h: 844, name: "404-390-ar" },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1, locale: "ar-SA" });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:3000${s.path}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "[data-reveal]{opacity:1 !important;transform:none !important}" });
  await page.evaluate(async () => {
    await new Promise((r) => { let y = 0; const step = () => { y += innerHeight; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(step, 40); else r(); }; step(); });
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${s.name}.png` });   // viewport crop, same as qa/final
  console.log(`captured ${s.name} (${s.w}x${s.h})`);
  await ctx.close();
}
await browser.close();
