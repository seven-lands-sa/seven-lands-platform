import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const artifactsDir = 'C:\\Users\\Eman Gaber\\.gemini\\antigravity\\brain\\cd89b718-a306-468e-8c12-5f2f40483eb0';
const targetPublic = path.resolve('public/media');

const dirs = [
  path.join(targetPublic, 'editorial'),
  path.join(targetPublic, 'services'),
  path.join(targetPublic, 'craft'),
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const mappings = [
  {
    pattern: /riyadh_kafd_skyline_.*\.jpg$/,
    dest: path.join(targetPublic, 'editorial/riyadh-kafd-skyline.webp'),
    width: 1920,
    height: 1080,
  },
  {
    pattern: /studio_discovery_.*\.jpg$/,
    dest: path.join(targetPublic, 'editorial/studio-discovery-workshop.webp'),
    width: 1920,
    height: 1080,
  },
  {
    pattern: /riyadh_consultation_.*\.jpg$/,
    dest: path.join(targetPublic, 'editorial/riyadh-consultation-space.webp'),
    width: 1920,
    height: 1080,
  },
  {
    pattern: /strategy_growth_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/01-strategy-growth.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /branding_creative_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/02-branding-creative.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /content_production_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/03-content-production.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /social_presence_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/04-social-presence.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /performance_acquisition_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/05-performance-acquisition.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /web_experiences_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/06-web-experiences.webp'),
    width: 1600,
    height: 900,
  },
  {
    pattern: /technology_automation_.*\.jpg$/,
    dest: path.join(targetPublic, 'services/07-technology-automation.webp'),
    width: 1600,
    height: 900,
  },
];

const craftMappings = [
  {
    pattern: /branding_creative_.*\.jpg$/,
    dest: path.join(targetPublic, 'craft/craft-identity-system.webp'),
    width: 1200,
    height: 800,
  },
  {
    pattern: /web_experiences_.*\.jpg$/,
    dest: path.join(targetPublic, 'craft/craft-digital-flagship.webp'),
    width: 1200,
    height: 800,
  },
  {
    pattern: /content_production_.*\.jpg$/,
    dest: path.join(targetPublic, 'craft/craft-commercial-film.webp'),
    width: 1200,
    height: 800,
  },
  {
    pattern: /performance_acquisition_.*\.jpg$/,
    dest: path.join(targetPublic, 'craft/craft-growth-engine.webp'),
    width: 1200,
    height: 800,
  },
];

async function run() {
  const artifactFiles = fs.readdirSync(artifactsDir);
  console.log(`Found ${artifactFiles.length} files in artifacts dir.`);

  for (const m of mappings) {
    const file = artifactFiles.find((f) => m.pattern.test(f));
    if (file) {
      const srcPath = path.join(artifactsDir, file);
      console.log(`Processing ${file} -> ${path.relative(process.cwd(), m.dest)}...`);
      await sharp(srcPath)
        .resize(m.width, m.height, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(m.dest);
      const stat = fs.statSync(m.dest);
      console.log(`✓ Saved ${m.dest} (${Math.round(stat.size / 1024)} KB)`);
    } else {
      console.warn(`! No matching artifact for ${m.dest}`);
    }
  }

  for (const m of craftMappings) {
    const file = artifactFiles.find((f) => m.pattern.test(f));
    if (file) {
      const srcPath = path.join(artifactsDir, file);
      console.log(`Processing craft ${file} -> ${path.relative(process.cwd(), m.dest)}...`);
      await sharp(srcPath)
        .resize(m.width, m.height, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(m.dest);
      const stat = fs.statSync(m.dest);
      console.log(`✓ Saved ${m.dest} (${Math.round(stat.size / 1024)} KB)`);
    }
  }

  console.log('All media processing complete.');
}

run().catch(console.error);
