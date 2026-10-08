/**
 * PHASE E — publish/unpublish driver for the migrated system pages.
 *
 *   node .phase-e-evidence/publish-pages.mjs publish   [home privacy terms]
 *   node .phase-e-evidence/publish-pages.mjs unpublish [home ...]
 *
 * Uses the real REST endpoints with an admin session (never the Local API), so the evidence shows
 * what an administrator's click actually does: validation gate, per-locale publish, cache tags.
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const mode = process.argv[2] ?? "publish";
const keys = process.argv.slice(3);
const targets = keys.length ? keys : ["home", "privacy", "terms"];

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");

const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
const json = async (response) => ({ status: response.status, body: await response.json().catch(() => null) });

for (const key of targets) {
  const list = await json(await fetch(`${BASE}/api/pages?where[systemKey][equals]=${key}&limit=1&draft=true&locale=ar`, { headers: auth }));
  const id = list.body?.docs?.[0]?.id;
  if (!id) {
    console.log(`${key}: NOT FOUND`);
    continue;
  }
  const status = await json(await fetch(`${BASE}/api/pages/${id}/publish-status`, { headers: auth }));
  const per = status.body?.perLocale ?? {};
  console.log(`${key} (page ${id}) status: ar=${per.ar?.ok ? "ok" : "blocked:" + per.ar?.count} en=${per.en?.ok ? "ok" : "blocked:" + per.en?.count} requiresBoth=${status.body?.requiresBothLocales}`);

  const endpoint = mode === "unpublish" ? "unpublish" : "publish";
  const body = mode === "unpublish" ? { locales: ["ar", "en"] } : { locales: ["ar", "en"] };
  const res = await json(await fetch(`${BASE}/api/pages/${id}/${endpoint}`, { method: "POST", headers: auth, body: JSON.stringify(body) }));
  console.log(`  ${endpoint} → HTTP ${res.status} ${JSON.stringify(res.body).slice(0, 220)}`);
}
