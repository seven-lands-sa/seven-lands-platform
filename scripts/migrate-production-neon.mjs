import { execSync } from 'child_process';

const PROD_DB = "postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-polished-surf-b4sk4z7d-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

console.log('Running Payload migrations on Production Neon branch...');
try {
  const output = execSync('npx payload migrate', {
    env: {
      ...process.env,
      DATABASE_URI: PROD_DB,
      PAYLOAD_SECRET: 'd8f8a8461f681a97d19da0e90924976a165b4c40562e245a4918e7e10df3a1b3',
      SITE_CANONICAL_URL: 'https://7-lands.com'
    },
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(output);
  console.log('✓ Production migrations completed successfully!');
} catch (err) {
  console.error('Migration error:', err.stdout || err.message);
  process.exit(1);
}
