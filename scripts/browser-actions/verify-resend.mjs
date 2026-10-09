import fs from 'fs';

async function checkResend() {
  const apiKey = fs.readFileSync('scripts/browser-actions/.resend-key.tmp', 'utf8').trim();
  console.log('Using Resend API Key:', apiKey.substring(0, 10) + '...');

  // 1. List domains
  const res = await fetch('https://api.resend.com/domains', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  const domains = await res.json();
  console.log('Domains list:', JSON.stringify(domains, null, 2));

  if (domains.data && domains.data.length > 0) {
    for (const d of domains.data) {
      console.log(`\nChecking domain ${d.name} (${d.id})... Status: ${d.status}`);
      
      // Request verification
      const verifyRes = await fetch(`https://api.resend.com/domains/${d.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const verifyJson = await verifyRes.json();
      console.log(`Verification trigger response:`, verifyJson);

      // Fetch domain details
      const detailRes = await fetch(`https://api.resend.com/domains/${d.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const detailJson = await detailRes.json();
      console.log(`Domain details:`, JSON.stringify(detailJson, null, 2));
    }
  }
}

checkResend().catch(console.error);
