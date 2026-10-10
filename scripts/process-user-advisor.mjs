import sharp from 'sharp';

const inputPath = 'C:\\Users\\Eman Gaber\\Downloads\\2a95d82e-441a-466f-ab00-a51e17531788.png';

async function processUserAdvisor() {
  console.log('Processing user advisor image from Downloads...');
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Input dimensions: ${width}x${height}, channels: ${channels}`);

  const isBg = new Uint8Array(width * height);
  const queue = [];

  const getIdx = (x, y) => (y * width + x);
  const getByteIdx = (x, y) => (y * width + x) * channels;

  const isWhitePixel = (x, y) => {
    const bi = getByteIdx(x, y);
    const r = data[bi];
    const g = data[bi + 1];
    const b = data[bi + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return (r > 240 && g > 240 && b > 240 && maxDiff < 12);
  };

  // Seed flood fill from the borders
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

  // Apply alpha mask
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

  // Save full transparent image
  const fullTransparent = sharp(outputBuffer, { raw: { width, height, channels } });

  // 1. Advisor Bust (WebP & PNG)
  await fullTransparent
    .clone()
    .resize(600, null, { withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 95 })
    .toFile('public/brand/advisor-bust.webp');

  await fullTransparent
    .clone()
    .resize(600, null, { withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile('public/brand/advisor-bust.png');

  // 2. Head / Avatar (Square crop focusing on face and shemagh)
  // The face is in the upper part of the image
  const cropSize = Math.round(width * 0.75);
  const left = Math.round((width - cropSize) / 2);
  const top = Math.round(height * 0.05);

  await sharp(inputPath)
    .extract({ left, top, width: cropSize, height: cropSize })
    .resize(256, 256)
    .webp({ quality: 90 })
    .toFile('public/brand/advisor-avatar.webp');

  console.log('✓ Successfully processed and replaced advisor assets with user-provided image!');
}

processUserAdvisor().catch(console.error);
