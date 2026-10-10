import { execSync } from 'child_process';

const url = 'https://7-lands.com';

try {
  try {
    execSync('npx vercel env rm NEXT_PUBLIC_SERVER_URL production preview development --yes', { stdio: 'ignore' });
  } catch {}

  const out = execSync(`npx vercel env add NEXT_PUBLIC_SERVER_URL production,preview,development --value "${url}" --yes`, {
    encoding: 'utf8'
  });
  console.log('Vercel Output:\n', out);
  console.log('✓ Successfully added NEXT_PUBLIC_SERVER_URL to Vercel!');
} catch (err) {
  console.error('Error adding env var:', err.stdout || err.message);
}
