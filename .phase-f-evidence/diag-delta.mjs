import sharp from "sharp";
import { readFileSync } from "node:fs";
const dir = "/home/user/seven-lands-website/.phase-f-evidence/visual/";
const A = await sharp(readFileSync(dir + "static/static-home-ar-1440.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const B = await sharp(readFileSync(dir + "published/published-home-ar-1440.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let hits = 0, maxDelta = 0, deltas = {};
for (let i = 0; i < A.data.length; i += 4) {
  const d = Math.max(Math.abs(A.data[i]-B.data[i]), Math.abs(A.data[i+1]-B.data[i+1]), Math.abs(A.data[i+2]-B.data[i+2]));
  if (d > 0) { hits += 1; maxDelta = Math.max(maxDelta, d); deltas[d] = (deltas[d] ?? 0) + 1; }
}
console.log(`static vs published (home-ar-1440): ${hits} pixels differ, max per-channel delta = ${maxDelta}`);
console.log("delta histogram:", JSON.stringify(deltas));
