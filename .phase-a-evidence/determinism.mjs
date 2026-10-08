import { chromium } from "@playwright/test";
import sharp from "sharp";
const browser = await chromium.launch();
const shots = [];
for (const run of [1, 2]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: "ar-SA" });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:3000/ar", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "[data-reveal]{opacity:1 !important;transform:none !important}" });
  await page.evaluate(async () => { await new Promise(r => { let y=0; const s=()=>{y+=innerHeight;scrollTo(0,y); y<document.body.scrollHeight?setTimeout(s,40):r();}; s(); }); scrollTo(0,0); });
  await page.waitForTimeout(400);
  const p = `.phase-a-evidence/after-shots/home-390-ar-run${run}.png`;
  await page.screenshot({ path: p }); shots.push(p);
  await ctx.close();
}
await browser.close();
const [b, a] = await Promise.all([sharp(shots[0]).raw().toBuffer(), sharp(shots[1]).raw().toBuffer()]);
let diff = 0; for (let i = 0; i < b.length; i += 4) if (b[i] !== a[i]) diff++;
console.log(`run1 vs run2 (same code, same server): ${diff} differing channel samples (${(diff/(b.length/4)*100).toFixed(4)}% of pixels)`);
