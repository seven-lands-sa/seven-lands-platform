import sharp from 'sharp';

const inputPath = 'C:\\Users\\Eman Gaber\\.gemini\\antigravity\\brain\\cd89b718-a306-468e-8c12-5f2f40483eb0\\saudi_sales_advisor_1791605575151.jpg';

async function processAdvisorFloodFill() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const isBg = new Uint8Array(width * height);
  const queue = [];

  // Helper to get pixel index
  const getIdx = (x, y) => (y * width + x);
  const getByteIdx = (x, y) => (y * width + x) * channels;

  // Check if pixel is white background (R>230, G>230, B>230, low color variation)
  const isWhitePixel = (x, y) => {
    const bi = getByteIdx(x, y);
    const r = data[bi];
    const g = data[bi + 1];
    const b = data[bi + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return (r > 225 && g > 225 && b > 225 && maxDiff < 18);
  };

  // Seed flood fill from the 4 borders
  for (let x = 0; x < width; x++) {
    if (isWhitePixel(x, 0)) { isBg[getIdx(x, 0)] = 1; queue.push(x, 0); }
    if (isWhitePixel(x, height - 1)) { isBg[getIdx(x, height - 1)] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isWhitePixel(0, y)) { isBg[getIdx(0, y)] = 1; queue.push(0, y); }
    if (isWhitePixel(width - 1, y)) { isBg[getIdx(width - 1, y)] = 1; queue.push(width - 1, y); }
  }

  // BFS Flood fill
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    // 4-neighborhood
    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = getIdx(nx, ny);
        if (isBg[nidx] === 0 && isWhitePixel(nx, ny)) {
          isBg[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Apply alpha mask to output buffer
  const outputBuffer = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIdx(x, y);
      const bi = getByteIdx(x, y);
      if (isBg[idx] === 1) {
        outputBuffer[bi + 3] = 0; // completely transparent
      }
    }
  }

  // Crop to bust (focus on head, chest, welcoming hand)
  // Save high-resolution transparent WebP and PNG
  await sharp(outputBuffer, { raw: { width, height, channels } })
    .webp({ quality: 92, alphaQuality: 95 })
    .toFile('public/brand/advisor-bust.webp');

  await sharp(outputBuffer, { raw: { width, height, channels } })
    .resize(500, 500)
    .png()
    .toFile('public/brand/advisor-bust.png');

  console.log(`✓ Flood-fill background extraction complete. Background pixels: ${queue.length / 2}`);
}

processAdvisorFloodFill().catch(console.error);
