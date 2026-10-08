import sharp from "sharp";
import { readFileSync } from "node:fs";
const dir = "/home/user/seven-lands-website/.phase-f-evidence/visual/";
const name = "home-ar-1440.png";
const A = await sharp(readFileSync(dir + "static/" + "static-" + name)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const B = await sharp(readFileSync(dir + "published/" + "published-" + name)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
console.log("size", A.info.width, A.info.height);
const hits = [];
for (let i = 0; i < A.data.length; i += 4) {
  if (A.data[i] !== B.data[i] || A.data[i+1] !== B.data[i+1] || A.data[i+2] !== B.data[i+2]) {
    const px = (i / 4) % A.info.width, py = Math.floor(i / 4 / A.info.width);
    hits.push({ x: px, y: py, a: [A.data[i],A.data[i+1],A.data[i+2]], b: [B.data[i],B.data[i+1],B.data[i+2]] });
  }
}
console.log("hits:", hits.length);
const ys = hits.map(h=>h.y), xs = hits.map(h=>h.x);
console.log("y range", Math.min(...ys), Math.max(...ys), "x range", Math.min(...xs), Math.max(...xs));
for (const h of hits.slice(0, 8)) console.log(JSON.stringify(h));
