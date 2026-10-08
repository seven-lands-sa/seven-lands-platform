const BASE = "http://127.0.0.1:3000";
const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: process.env.SEED_SUPER_ADMIN_EMAIL, password: process.env.SEED_SUPER_ADMIN_PASSWORD }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
for (const url of ["/ar/preview", "/ar/preview?path=/not-a-real-page", "/en/preview"]) {
  const html = await (await fetch(`${BASE}${url}`, { headers: { cookie } })).text();
  console.log(`\n── ${url}\n${text(html).slice(0, 320)}`);
}
