/**
 * Refresh the public render of the Site Settings global through the LIVE server.
 *
 * Why this exists: `payload run` scripts talk to the database directly, so their writes never reach
 * the running `next start` process's cache tags (documented Payload/Next limitation). After the
 * fixture teardown unlinked the OG image that way, the already-rendered pages kept serving the old
 * `og:image` — a URL that no longer exists. Writing the same document through the live REST API
 * triggers the collection's `revalidateTag` hooks, which is the product's own invalidation path.
 *
 * Both calls carry an explicit `?locale=` (see AGENTS.md — a locale-less read returns nulls and a
 * locale-less write destroys the default locale's row).
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

for (const locale of ["ar", "en"]) {
  const doc = await (await fetch(`${BASE}/api/globals/site-settings?depth=0&locale=${locale}`, { headers: auth })).json();
  const res = await fetch(`${BASE}/api/globals/site-settings?locale=${locale}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  console.log(`  ${locale}: re-published unchanged (HTTP ${res.status}) · og=${JSON.stringify(doc?.brand?.defaultOgImage ?? null)}`);
}
