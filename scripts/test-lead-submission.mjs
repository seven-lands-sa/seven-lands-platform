const DEPLOYMENT_URL = "https://seven-lands-platform-pbnj9g8sf-seven-lands.vercel.app";
const BYPASS_TOKEN = "0REIi3CPfsvjDqJWaT87vhtcWjcBxdIm";

const headers = {
  "x-vercel-protection-bypass": BYPASS_TOKEN,
  "Content-Type": "application/json"
};

async function main() {
  console.log('Submitting valid lead to /api/brief on Vercel deployment...');
  const leadBody = {
    mode: "brief",
    lands: ["strategy-business-growth"],
    goal: "بناء هوية بصرية واستراتيجية نمو متكاملة لتوسع الشركة محلياً.",
    timeline: "now",
    name: "سلمان العتيبي",
    company: "شركة الأفق للاستشارات",
    phone: "0501234567",
    email: "salman@alofuq-sa.com",
    channel: "whatsapp",
    notes: "اختبار التحقق الآلي للربط السحابي وقاعدة البيانات.",
    consent: true,
    locale: "ar"
  };

  const res = await fetch(`${DEPLOYMENT_URL}/api/brief`, {
    method: 'POST',
    headers,
    body: JSON.stringify(leadBody)
  });

  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log(`Response JSON:`, JSON.stringify(json, null, 2));
}

main().catch(console.error);
