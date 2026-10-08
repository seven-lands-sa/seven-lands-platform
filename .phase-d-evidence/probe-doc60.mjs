import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const v = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify({ email: v("SEED_SUPER_ADMIN_EMAIL"), password: v("SEED_SUPER_ADMIN_PASSWORD") }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
for (const locale of ["ar", "en"]) {
  const r = await fetch(`${BASE}/api/media/60?depth=0&locale=${locale}`, { headers: { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" } });
  const b = await r.json();
  console.log(locale, "→ alt:", JSON.stringify(b.alt), "| caption:", JSON.stringify(b.caption), "| filename:", b.filename);
}
