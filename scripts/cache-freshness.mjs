/**
 * §8 — CACHE FRESHNESS. Required sequence, nothing assumed:
 *
 *   1. public request          → OLD value
 *   2. admin update            (the write hook runs revalidateTag(tag, { expire: 0 }))
 *   3. the FIRST public request after the write → must already be the NEW value
 *   4. restore the canonical value and prove the restoration propagates the same way
 *
 * Two independent surfaces are tested (homepage metadata + the footer, which renders on every page)
 * because they are produced by different readers.
 */
import { readFileSync } from "node:fs";

const BASE = process.env.CACHE_TEST_BASE ?? "http://127.0.0.1:3000";
const ORIGIN = new URL(BASE).origin;

const env = readFileSync(".env", "utf8");
const value = (key) => env.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: ORIGIN },
  body: JSON.stringify({ email: value("SEED_SUPER_ADMIN_EMAIL"), password: value("SEED_SUPER_ADMIN_PASSWORD") }),
});
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const admin = (method, path, body) =>
  fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie, Origin: ORIGIN },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

const html = async () => (await fetch(BASE + "/ar", { cache: "no-store" })).text();
const results = [];
const check = (label, ok, detail) => {
  results.push(ok);
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? `  — ${detail}` : ""}`);
};

/* ── surface 1: the footer statement (a global read by the content adapter) ─────── */
/* NOTE: Payload's REST global update endpoint is POST (a PATCH returns 404), verified here. */
const footer = await (await admin("GET", "/api/globals/footer?locale=ar&depth=0")).json();
const originalStatement = footer.statement ?? "";
const marker = `${originalStatement} ✅`;
const before = await html();
check("1 · public request shows the ORIGINAL footer statement", before.includes(originalStatement));
check("1 · the marker is not present beforehand", !before.includes(marker));

await admin("POST", "/api/globals/footer?locale=ar&depth=0", { statement: marker });
const firstAfter = await html();
check("4 · FIRST public request after the admin update is FRESH", firstAfter.includes(marker), "no second request, no sleep, no rebuild");

/* ── surface 2: the header CTA label — a different global, a different reader ───── */
const navigation = await (await admin("GET", "/api/globals/navigation?locale=ar&depth=0")).json();
const originalCta = navigation.header.cta.label;
const ctaMarker = `${originalCta} ⟡`;
await admin("POST", "/api/globals/navigation?locale=ar&depth=0", { header: { ...navigation.header, cta: { ...navigation.header.cta, label: ctaMarker } } });
const ctaAfter = await html();
check("4 · a SECOND surface (header CTA) is fresh on its first request", ctaAfter.includes(ctaMarker), "a different global, a different cached reader");

/* ── restore, and prove the restore propagates the same way ─────────────────────── */
await admin("POST", "/api/globals/footer?locale=ar&depth=0", { statement: originalStatement });
const restored = await html();
check("5 · restore propagates on the first request (marker gone)", !restored.includes(marker));
check("5 · the canonical footer statement is back", restored.includes(originalStatement));
await admin("POST", "/api/globals/navigation?locale=ar&depth=0", { header: { ...navigation.header, cta: { ...navigation.header.cta, label: originalCta } } });

const fresh = results.every(Boolean);
console.log(`\n  FIRST_REQUEST_FRESH = ${fresh ? "YES" : "NO"}`);
process.exit(fresh ? 0 : 1);
