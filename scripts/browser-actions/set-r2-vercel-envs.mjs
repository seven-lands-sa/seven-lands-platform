import { execSync } from 'child_process';

const envVars = [
  { key: 'R2_ACCOUNT_ID', value: '3f4115369739d3fd0f4b54ce5015964a' },
  { key: 'R2_ACCESS_KEY_ID', value: '6527c264ec323637bc0ba18d90caa5e1' },
  { key: 'R2_SECRET_ACCESS_KEY', value: 'd16f0d1ff5bbc818dc24f3031361f3f2083892c98f207304fd71d773633986f3' },
  { key: 'R2_BUCKET_NAME', value: 'seven-lands-media' },
  { key: 'R2_PUBLIC_DOMAIN', value: 'pub-964959ba9f6f4e8784fd7dfd10e9cd1c.r2.dev' },
  { key: 'R2_ENDPOINT', value: 'https://3f4115369739d3fd0f4b54ce5015964a.r2.cloudflarestorage.com' }
];

for (const { key, value } of envVars) {
  try {
    console.log(`Setting ${key}...`);
    try {
      execSync(`npx vercel env rm ${key} production preview development --yes`, { stdio: 'ignore' });
    } catch {}
    execSync(`npx vercel env add ${key} production,preview,development --value "${value}" --yes`, { stdio: 'inherit' });
    console.log(`Successfully added ${key}`);
  } catch (err) {
    console.error(`Failed to set ${key}:`, err.message);
  }
}
