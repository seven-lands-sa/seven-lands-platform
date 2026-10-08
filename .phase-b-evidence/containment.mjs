/**
 * PHASE B — ADMIN ↔ PUBLIC BUNDLE CONTAINMENT (production build on :3000)
 *
 * 1. every js/css asset in .next/static
 * 2. which of them the public routes actually load
 * 3. which /admin loads
 * 4. the overlap, and whether any shared chunk contains Payload (i.e. admin) code
 *
 * Markers are checked as `payloadcms` / `@payloadcms` / `create-first-user` / `payload.config`,
 * never the bare word "payload" — React's own runtime contains `lazy(() => … _payload)` and
 * `createInitialRSCPayloadFromFallbackPrerender`, which would false-positive.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:3000";
const MISSING = ["payloadcms", "@payloadcms", "create-first-user", "payload.config"];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const all = walk(".next/static").filter((f) => /\.(js|css)$/.test(f));
const toUrl = (p) => "/_next/" + relative(".next", p);
const sizeOf = new Map(all.map((p) => [toUrl(p), readFileSync(p).length]));

const PUBLIC_ROUTES = [
  "/ar", "/en", "/ar/services", "/en/services", "/ar/services/branding-creative",
  "/ar/work", "/ar/insights", "/ar/about", "/ar/insights", "/ar/start-a-project",
  "/en/start-a-project", "/ar/contact", "/en/contact", "/ar/privacy", "/en/privacy",
];

const assetsIn = async (path) => {
  const res = await fetch(ORIGIN + path);
  const html = await res.text();
  const refs = new Set();
  for (const m of html.matchAll(/\/_next\/static\/[^"'\\)\s]+?\.(?:js|css)/g)) refs.add(m[0]);
  return { status: res.status, refs, html };
};

const publicRefs = new Set();
for (const route of PUBLIC_ROUTES) {
  const { refs } = await assetsIn(route);
  for (const r of refs) publicRefs.add(r);
}
const admin = await assetsIn("/admin");

const adminOnly = [...admin.refs].filter((r) => !publicRefs.has(r));
const shared = [...admin.refs].filter((r) => publicRefs.has(r));
const bytes = (list) => list.reduce((sum, r) => sum + (sizeOf.get(r) ?? 0), 0);

console.log(`assets in the build ............. ${all.length} (js + css)`);
console.log(`loaded by public routes ......... ${publicRefs.size}  · ${bytes([...publicRefs]).toLocaleString()} B`);
console.log(`loaded by /admin ................ ${admin.refs.size}  · ${bytes([...admin.refs]).toLocaleString()} B`);
console.log(`admin-only ...................... ${adminOnly.length}  · ${bytes(adminOnly).toLocaleString()} B`);
console.log(`shared /admin ∩ public .......... ${shared.length}  · ${bytes(shared).toLocaleString()} B`);

const leaks = [];
for (const asset of [...publicRefs]) {
  const p = join(".next/static", relative("/_next/static", asset));
  let code;
  try { code = readFileSync(p, "utf8"); } catch { continue; }
  for (const marker of MISSING) if (code.includes(marker)) leaks.push(`${asset} → ${marker}`);
}
console.log(`\nPayload markers inside public assets ... ${leaks.length === 0 ? "0 ✅" : leaks.length}`);
for (const leak of leaks) console.log("   ❌ " + leak);

console.log(`\nmarkers inside the ${shared.length} shared chunks:`);
for (const asset of shared.sort((a, b) => (sizeOf.get(b) ?? 0) - (sizeOf.get(a) ?? 0))) {
  const p = join(".next/static", relative("/_next/static", asset));
  const code = readFileSync(p, "utf8");
  const hits = MISSING.filter((m) => code.includes(m));
  const isAdminHtml = code.includes("create-first-user") || code.includes("payload-admin") || code.includes("تسجيل الدخول");
  console.log(
    `   ${(sizeOf.get(asset) ?? 0).toString().padStart(9)} B  ${asset.replace("/_next/static/", "")}  ${hits.length ? "❌ " + hits.join(",") : "clean"}${isAdminHtml ? "  ⚠️ admin strings" : ""}`,
  );
}

const biggest = adminOnly.sort((a, b) => (sizeOf.get(b) ?? 0) - (sizeOf.get(a) ?? 0)).slice(0, 5);
console.log(`\nlargest admin-only assets (none of which a public route references):`);
for (const asset of biggest) {
  console.log(`   ${(sizeOf.get(asset) ?? 0).toLocaleString().padStart(12)} B  ${asset.replace("/_next/static/", "")}`);
}
