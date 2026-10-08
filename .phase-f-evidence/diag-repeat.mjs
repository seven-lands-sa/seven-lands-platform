/** Is the 38-pixel difference real, or text antialiasing noise? Capture the SAME state twice. */
import { chromium } from "playwright";
import sharp from "sharp";
const BASE = "http://127.0.0.1:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: "light" });
const shots = [];
for (const _round of [1, 2]) {
  await page.goto(`${BASE}/ar`, { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "[data-reveal]{opacity:1 !important;transform:none !important}" });
  await page.waitForTimeout(600);
  shots.push(await page.screenshot({ fullPage: true }));
}
await browser.close();
const A = await sharp(shots[0]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const B = await sharp(shots[1]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let hits = 0; const sample = [];
for (let i = 0; i < A.data.length; i += 4) {
  if (A.data[i] !== B.data[i] || A.data[i+1] !== B.data[i+1] || A.data[i+2] !== B.data[i+2]) {
    hits += 1;
    if (sample.length < 5) sample.push({ x: (i/4) % A.info.width, y: Math.floor(i/4/A.info.width), a: [A.data[i],A.data[i+1],A.data[i+2]], b: [B.data[i],B.data[i+1],B.data[i+2]] });
  }
}
console.log(`same-state repeat: ${hits} differing pixels of ${A.info.width * A.info.height}`);
console.log(sample.map((s) => JSON.stringify(s)).join("\n"));
