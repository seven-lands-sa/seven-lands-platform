import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:\\Users\\Eman Gaber\\Downloads\\Seven Lands Digital Growth Skyline.png';

async function main() {
  console.log('Reading image:', inputPath);
  const metadata = await sharp(inputPath).metadata();
  console.log(`Dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // 1. Process 1200x630 standard OG cover with cover fit (focal center)
  // Sharp high-quality resize and compression
  const ogPngBuffer = await sharp(inputPath)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'center'
    })
    .flatten({ background: '#061428' })
    .png({
      compressionLevel: 9,
      effort: 10
    })
    .toBuffer();

  console.log(`Generated 1200x630 PNG size: ${(ogPngBuffer.length / 1024).toFixed(1)} KB`);

  fs.writeFileSync('public/og/og-ar.png', ogPngBuffer);
  fs.writeFileSync('public/og/og-en.png', ogPngBuffer);
  fs.writeFileSync('public/brand/seven-lands-skyline-og.png', ogPngBuffer);

  const ogJpgBuffer = await sharp(inputPath)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 86, progressive: true })
    .toBuffer();
  console.log(`Generated 1200x630 JPEG size: ${(ogJpgBuffer.length / 1024).toFixed(1)} KB`);
  fs.writeFileSync('public/og/og-ar.jpg', ogJpgBuffer);
  fs.writeFileSync('public/og/og-en.jpg', ogJpgBuffer);
  fs.writeFileSync('public/brand/seven-lands-skyline-og.jpg', ogJpgBuffer);

  // Also create WebP version for web pages
  const webpBuffer = await sharp(inputPath)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  fs.writeFileSync('public/brand/seven-lands-skyline-og.webp', webpBuffer);
  console.log(`Generated WebP size: ${(webpBuffer.length / 1024).toFixed(1)} KB`);

  // Also create high-res web banner (1920px wide) for hero/story sections
  const heroWebp = await sharp(inputPath)
    .resize(1920, 1080, { fit: 'cover', position: 'center' })
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  fs.writeFileSync('public/brand/seven-lands-skyline-hero.webp', heroWebp);
  console.log(`Generated 1920x1080 WebP size: ${(heroWebp.length / 1024).toFixed(1)} KB`);

  console.log('✓ Successfully processed and saved official social share image!');
}

main().catch(console.error);
