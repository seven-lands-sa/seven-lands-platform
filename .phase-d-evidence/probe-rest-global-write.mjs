/**
 * Probe: does the REST global write shape used by `make-fixtures.mjs` damage the OTHER locale?
 *
 * Shape 1 = what the fixture script does: GET the global with no `locale`, POST the whole body back
 *           with no `locale`.
 * Shape 2 = the same, but with `?locale=ar` on both calls.
 *
 * Prints the localized fields as the API returns them (so the shape of the response is visible) and
 * the row state is inspected from SQL afterwards.
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

const show = (tag, doc) =>
  console.log(
    `${tag}\n   location.display = ${JSON.stringify(doc?.location?.display ?? null)}` +
      `\n   brand.shortDescription = ${JSON.stringify(String(doc?.brand?.shortDescription ?? "").slice(0, 30))}` +
      `\n   general.businessCategory = ${JSON.stringify(doc?.general?.businessCategory ?? null)}` +
      `\n   brand.defaultOgImage = ${JSON.stringify(doc?.brand?.defaultOgImage ?? null)}`,
  );

/* ── Shape 1: no locale on either call (what make-fixtures.mjs does today) ───────────────────── */
const s1 = await (await fetch(`${BASE}/api/globals/site-settings?depth=0`, { headers: auth })).json();
show("GET (no locale) returned:", s1);
const w1 = await fetch(`${BASE}/api/globals/site-settings`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ ...s1, brand: { ...(s1.brand ?? {}), defaultOgImage: s1.brand?.defaultOgImage ?? null } }),
});
console.log(`POST (no locale) → HTTP ${w1.status}`);

/* Read back what the AR side now looks like (explicit locale, so this is the AR row's own data). */
const after1 = await (await fetch(`${BASE}/api/globals/site-settings?depth=0&locale=ar`, { headers: auth })).json();
show("AR row after shape 1:", after1);
const after1en = await (await fetch(`${BASE}/api/globals/site-settings?depth=0&locale=en`, { headers: auth })).json();
show("EN row after shape 1:", after1en);
