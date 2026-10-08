/**
 * Publish the migrated home page through the LIVE server's gated endpoint.
 *
 * Proves, in order:
 *   1. the publish-status endpoint reports the real per-locale verdict (+ any blockers);
 *   2. a partial publish of a CORE page is refused (both locales required, §16);
 *   3. a full publish succeeds and marks both locales published;
 *   4. the public page then serves CMS content (checked by the caller with curl/pixel diff).
 */
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const env = readFileSync(".env", "utf8");
const value = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: BASE },
  body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { Cookie: cookie, Origin: BASE, "Sec-Fetch-Site": "same-origin" };

const list = await (
  await fetch(`${BASE}/api/pages?where[systemKey][equals]=home&limit=1&draft=true&locale=all`, { headers: auth })
).json();
const pageId = list?.docs?.[0]?.id;
if (!pageId) throw new Error("home page not found — run the seeder first");
console.log(`home page id: ${pageId}`);

const status = await (await fetch(`${BASE}/api/pages/${pageId}/publish-status`, { headers: auth })).json();
console.log("publish-status:");
console.log(`  perLocale: ${JSON.stringify(status.perLocale)}`);
console.log(`  requiresBothLocales: ${status.requiresBothLocales}`);
console.log(`  canPublish: ${status.canPublish}`);
console.log(`  blockers: ${status.blockers?.length ?? 0}`);
for (const blocker of status.blockers ?? []) console.log(`    · [${blocker.locale}] ${blocker.message}`);

const partial = await fetch(`${BASE}/api/pages/${pageId}/publish`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ locales: ["ar"] }),
});
const partialBody = await partial.json().catch(() => ({}));
console.log(`\npartial publish (ar only): HTTP ${partial.status} · blocked=${JSON.stringify(partialBody.blocked ?? null)}`);
if (partialBody.errors) console.log(`  ${partialBody.errors.map((e) => e.message).join(" / ")}`);

const full = await fetch(`${BASE}/api/pages/${pageId}/publish`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ locales: ["ar", "en"] }),
});
const fullBody = await full.json().catch(() => ({}));
console.log(`\nfull publish (ar+en): HTTP ${full.status} · ${JSON.stringify(fullBody)}`);

const after = await (await fetch(`${BASE}/api/pages/${pageId}/publish-status`, { headers: auth })).json();
console.log(`\nlocale state after publish: ${JSON.stringify(after.localeState)}`);
