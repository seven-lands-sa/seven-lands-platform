import sharp from 'sharp';
import fs from 'fs';

const generatedImages = [
  {
    src: 'C:/Users/Eman Gaber/.gemini/antigravity/brain/cd89b718-a306-468e-8c12-5f2f40483eb0/riyadh_executive_growth_1791603816333.jpg',
    dest: 'public/media/editorial/riyadh-executive-growth.webp',
  },
  {
    src: 'C:/Users/Eman Gaber/.gemini/antigravity/brain/cd89b718-a306-468e-8c12-5f2f40483eb0/creative_branding_studio_1791603845026.jpg',
    dest: 'public/media/editorial/creative-branding-studio.webp',
  },
  {
    src: 'C:/Users/Eman Gaber/.gemini/antigravity/brain/cd89b718-a306-468e-8c12-5f2f40483eb0/tech_performance_hub_1791603878928.jpg',
    dest: 'public/media/editorial/tech-performance-hub.webp',
  },
  {
    src: 'C:/Users/Eman Gaber/.gemini/antigravity/brain/cd89b718-a306-468e-8c12-5f2f40483eb0/riyadh_client_consultation_1791603916359.jpg',
    dest: 'public/media/editorial/riyadh-client-consultation.webp',
  },
];

async function main() {
  for (const { src, dest } of generatedImages) {
    console.log(`Processing ${src} -> ${dest}...`);
    const buffer = await sharp(src)
      .resize(1600, 900, { fit: 'cover', position: 'center' })
      .webp({ quality: 84, effort: 6 })
      .toBuffer();
    
    fs.writeFileSync(dest, buffer);
    console.log(`✓ Saved ${dest}: ${(buffer.length / 1024).toFixed(1)} KB`);
  }
}

main().catch(console.error);
