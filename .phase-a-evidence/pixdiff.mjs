import sharp from "sharp";
const A = ".phase-a-evidence/after-shots";
const B = "qa/final";
const pairs = [
  ["home-390x844-ar.png", `${A}/home-390-ar.png`],
  ["home-1440x900-ar.png", `${A}/home-1440-ar.png`],
  ["home-1440-en.png", `${A}/home-1440-en.png`],
  ["service-1440-ar.png", `${A}/service-1440-ar.png`],
  ["service-768-ar.png", `${A}/service-768-ar.png`],
  ["work-1440-ar.png", `${A}/work-1440-ar.png`],
  ["404-390-ar.png", `${A}/404-390-ar.png`],
];
for (const [before, after] of pairs) {
  const b = sharp(`${B}/${before}`).ensureAlpha(), a = sharp(after).ensureAlpha();
  const [bm, am] = await Promise.all([b.metadata(), a.metadata()]);
  const tag = before.padEnd(24);
  if (bm.width !== am.width || bm.height !== am.height) {
    console.log(`${tag} DIMENSION DIFFERS ${bm.width}x${bm.height} → ${am.width}x${am.height}`);
    continue;
  }
  const [bd, ad] = await Promise.all([b.raw().toBuffer(), a.raw().toBuffer()]);
  let diff = 0, big = 0;
  for (let i = 0; i < bd.length; i += 4) {
    const d = Math.abs(bd[i]-ad[i]) + Math.abs(bd[i+1]-ad[i+1]) + Math.abs(bd[i+2]-ad[i+2]);
    if (d > 0) diff++;
    if (d > 24) big++;
  }
  const n = bd.length / 4;
  console.log(`${tag} ${bm.width}x${bm.height}  differing: ${(diff/n*100).toFixed(4)}%  visible(>8/255): ${(big/n*100).toFixed(4)}%`);
}
