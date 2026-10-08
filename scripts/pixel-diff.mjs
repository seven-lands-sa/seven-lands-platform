import sharp from "sharp";

const [a, b] = process.argv.slice(2);
const A = await sharp(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const B = await sharp(b).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (A.info.width !== B.info.width || A.info.height !== B.info.height) {
  console.log(`size differs: ${A.info.width}x${A.info.height} vs ${B.info.width}x${B.info.height}`);
  process.exit(0);
}
const hits = [];
for (let i = 0; i < A.data.length; i += 4) {
  if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) {
    const px = (i / 4) % A.info.width;
    const py = Math.floor(i / 4 / A.info.width);
    hits.push({ x: px, y: py, from: [A.data[i], A.data[i + 1], A.data[i + 2]], to: [B.data[i], B.data[i + 1], B.data[i + 2]] });
  }
}
console.log(`${hits.length} differing pixels of ${A.info.width * A.info.height}`);
for (const h of hits.slice(0, 10)) {
  console.log(`  (${h.x},${h.y})  baseline rgb(${h.from.join(",")})  →  current rgb(${h.to.join(",")})`);
}
