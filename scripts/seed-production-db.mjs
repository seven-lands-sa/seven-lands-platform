import { execSync } from 'child_process';

const PROD_DB = "postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-polished-surf-b4sk4z7d-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const env = {
  ...process.env,
  DATABASE_URI: PROD_DB,
  PAYLOAD_SECRET: 'd8f8a8461f681a97d19da0e90924976a165b4c40562e245a4918e7e10df3a1b3',
  ALLOW_PRODUCTION_SEED: 'true',
  SEED_SUPER_ADMIN_EMAIL: 'admin@7-lands.com',
  SEED_SUPER_ADMIN_PASSWORD: 'SevenLands#2026!SecureRootAdmin',
  SITE_CANONICAL_URL: 'https://7-lands.com'
};

const scripts = [
  'src/scripts/seed-auth-foundation.ts',
  'src/scripts/seed-content-globals.ts',
  'src/scripts/seed-services.ts',
  'src/scripts/seed-pages.ts'
];

for (const script of scripts) {
  console.log(`\n========================================`);
  console.log(`Running: ${script}`);
  console.log(`========================================`);
  try {
    const out = execSync(`npx payload run ${script}`, {
      env,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(out);
    console.log(`✓ ${script} finished successfully.`);
  } catch (err) {
    console.error(`✗ Failed ${script}:`, err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n========================================');
console.log('✓ All Production seeds applied successfully!');
console.log('========================================');
