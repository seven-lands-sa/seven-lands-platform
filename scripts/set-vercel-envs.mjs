import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';

const PROD_DB = "postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-polished-surf-b4sk4z7d-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const STAGING_DB = "postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-restless-sound-b4u5mw07-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

let resendKey = '';
if (fs.existsSync('scripts/browser-actions/.resend-key.tmp')) {
  resendKey = fs.readFileSync('scripts/browser-actions/.resend-key.tmp', 'utf8').trim();
}

const payloadSecret = crypto.randomBytes(32).toString('hex');

const envs = [
  // Database URIs
  { name: 'DATABASE_URI', target: 'production', value: PROD_DB },
  { name: 'DATABASE_URI', target: 'preview', value: STAGING_DB },
  { name: 'DATABASE_URI', target: 'development', value: STAGING_DB },
  
  // Payload Secret
  { name: 'PAYLOAD_SECRET', target: 'production,preview,development', value: payloadSecret },
  
  // Canonical URLs
  { name: 'SITE_CANONICAL_URL', target: 'production,preview,development', value: 'https://7-lands.com' },
  
  // Email settings
  { name: 'RESEND_API_KEY', target: 'production,preview,development', value: resendKey },
  { name: 'RESEND_FROM_EMAIL', target: 'production,preview,development', value: 'Seven Lands <notifications@7-lands.com>' },
  { name: 'LEAD_NOTIFICATION_RECIPIENT', target: 'production,preview,development', value: 'info@7-lands.com' },
  
  // Production Seed Authorization
  { name: 'ALLOW_PRODUCTION_SEED', target: 'production,preview,development', value: 'true' }
];

console.log('Adding environment variables to Vercel project...');
for (const env of envs) {
  try {
    console.log(`Setting ${env.name} for ${env.target}...`);
    // Escape double quotes if any
    const val = env.value.replace(/"/g, '\\"');
    execSync(`npx vercel env add ${env.name} ${env.target} --value "${val}" --force --yes`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(`✓ ${env.name} (${env.target}) set successfully.`);
  } catch (err) {
    console.error(`✗ Error setting ${env.name}:`, err.message);
  }
}

console.log('\nAll Vercel environment variables configured!');
