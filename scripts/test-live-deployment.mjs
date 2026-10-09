const DEPLOYMENT_URL = "https://seven-lands-platform-pbnj9g8sf-seven-lands.vercel.app";
const BYPASS_TOKEN = "0REIi3CPfsvjDqJWaT87vhtcWjcBxdIm";

const headers = {
  "x-vercel-protection-bypass": BYPASS_TOKEN,
  "Content-Type": "application/json"
};

async function main() {
  console.log(`====================================================`);
  console.log(`TESTING LIVE DEPLOYMENT VIA NATIVE FETCH`);
  console.log(`URL: ${DEPLOYMENT_URL}`);
  console.log(`====================================================\n`);

  // 1. GET /ar
  console.log('1. Testing GET /ar...');
  const resAr = await fetch(`${DEPLOYMENT_URL}/ar`, { headers: { "x-vercel-protection-bypass": BYPASS_TOKEN } });
  console.log(`   Status: ${resAr.status} ${resAr.statusText}`);
  const textAr = await resAr.text();
  console.log(`   HTML Length: ${textAr.length} bytes`);
  console.log(`   Contains title/brand: ${textAr.includes('سفن لاند') || textAr.includes('Seven Lands')}`);

  // 2. GET /en
  console.log('\n2. Testing GET /en...');
  const resEn = await fetch(`${DEPLOYMENT_URL}/en`, { headers: { "x-vercel-protection-bypass": BYPASS_TOKEN } });
  console.log(`   Status: ${resEn.status} ${resEn.statusText}`);
  const textEn = await resEn.text();
  console.log(`   HTML Length: ${textEn.length} bytes`);

  // 3. GET /admin
  console.log('\n3. Testing GET /admin...');
  const resAdmin = await fetch(`${DEPLOYMENT_URL}/admin`, { headers: { "x-vercel-protection-bypass": BYPASS_TOKEN } });
  console.log(`   Status: ${resAdmin.status} ${resAdmin.statusText}`);
  const textAdmin = await resAdmin.text();
  console.log(`   Admin HTML Length: ${textAdmin.length} bytes`);

  // 4. POST /api/brief
  console.log('\n4. Testing POST /api/brief (Lead ingestion)...');
  const leadBody = {
    locale: "ar",
    name: "مؤسسة اختبار النشر",
    email: "staging-verification@7-lands.com",
    phone: "0501234567",
    services: ["strategy-business-growth", "branding-creative"],
    timeline: "within_1_month",
    budget: "50k_to_100k",
    message: "رسالة تجريبية للتحقق من تكامل نموذج التواصل المباشر مع قاعدة البيانات والبريد."
  };

  const resBrief = await fetch(`${DEPLOYMENT_URL}/api/brief`, {
    method: 'POST',
    headers,
    body: JSON.stringify(leadBody)
  });
  console.log(`   Status: ${resBrief.status} ${resBrief.statusText}`);
  const jsonBrief = await resBrief.json().catch(() => null);
  console.log(`   Response JSON:`, JSON.stringify(jsonBrief, null, 2));

  console.log('\n====================================================');
  console.log('✓ VERIFICATION BATTERY FINISHED');
  console.log('====================================================');
}

main().catch(console.error);
