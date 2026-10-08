import { readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const v = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const login = await fetch(`${BASE}/api/users/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify({ email: v("SEED_SUPER_ADMIN_EMAIL"), password: v("SEED_SUPER_ADMIN_PASSWORD") }) });
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" };
for (const path of ["/api/media/capabilities", "/api/media/library-meta?ids=1"]) {
  const r = await fetch(`${BASE}${path}`, { headers: auth });
  console.log(path, r.status, (await r.text()).slice(0, 300));
}
