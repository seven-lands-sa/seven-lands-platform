/** Bounding box + magnitude distribution of the pixels that differ between two captures. */
import sharp from "sharp";
const [a, b] = process.argv.slice(2);
const A = await sharp(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const B = await sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0, maxDelta = 0;
const hist = {};
for (let i = 0; i < A.data.length; i += 4) {
  const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
  if (d) {
    const px = (i / 4) % A.info.width, py = Math.floor(i / 4 / A.info.width);
    n++; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py;
    if (d > maxDelta) maxDelta = d;
    const bucket = d <= 2 ? "≤2" : d <= 8 ? "3–8" : d <= 32 ? "9–32" : ">32";
    hist[bucket] = (hist[bucket] ?? 0) + 1;
  }
}
console.log(`${n} px · box x[${minX}..${maxX}] y[${minY}..${maxY}] · maxΔ=${maxDelta} · buckets ${JSON.stringify(hist)}`);
