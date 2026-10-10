import { execSync } from 'child_process';

const key = 'gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g';

try {
  try {
    execSync('npx vercel env rm GHOSTMIND_API_KEY production preview development --yes', { stdio: 'ignore' });
  } catch {}
  
  const out = execSync(`npx vercel env add GHOSTMIND_API_KEY production,preview,development --value "${key}" --yes`, {
    encoding: 'utf8'
  });
  console.log('Vercel Output:', out);
  console.log('✓ Successfully configured GHOSTMIND_API_KEY on Vercel!');
} catch (err) {
  console.error('Failed to configure Vercel env:', err.stdout || err.message);
}
