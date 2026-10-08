/**
 * MEDIA VISIBILITY — BINARY DELIVERY GATE (§3/§4/§6 of the completion brief).
 *
 * Everything asserted here goes over HTTP against the running server, because that is what an
 * attacker or a hotlinking visitor actually does. A Local API check would prove the collection
 * access rule; it would NOT prove that the file bytes are unreachable. Both matters are tested:
 * the Local API creates the fixtures, HTTP proves the delivery.
 *
 * The privacy claim under test is "knowing the URL is not enough" — so the test always knows the
 * exact URL, including the derivative URLs, and asserts on the bytes that come back.
 */
import { getPayload } from "payload";
import sharp from "sharp";
import config from "@payload-config";

const BASE = process.env.MEDIA_TEST_BASE ?? "http://127.0.0.1:3000";
/*
 * WRITE GUARD (§15). This script creates fixtures ({personas, media, roles}) that must never exist
 * in a production database unless someone deliberately asks for them. It refuses by default and the
 * flag documents intent, so a stray `payload run` on a live deployment cannot seed test accounts.
 */
if (process.env.ALLOW_VERIFICATION_WRITES !== "true") {
  console.error(
    "REFUSED: this verification script writes fixtures to the database.\n" +
      "          Re-run with ALLOW_VERIFICATION_WRITES=true on a development or test database only.",
  );
  process.exit(1);
}

const payload = await getPayload({ config });

let passed = 0;
let failed = 0;
const failures: string[] = [];
const record = (ok: boolean, label: string, detail = "") => {
  if (ok) { passed += 1; console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ""}`); }
  else { failed += 1; failures.push(label); console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ""}`); }
};

/* ── session: a real admin, over HTTP, exactly like the browser does ─────────────── */
const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: BASE },
  body: JSON.stringify({
    email: process.env.SEED_SUPER_ADMIN_EMAIL,
    password: process.env.SEED_SUPER_ADMIN_PASSWORD,
  }),
});
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
record(login.status === 200 && cookie.length > 0, "admin session established over HTTP", `HTTP ${login.status}`);

type Probe = { status: number; cacheControl: string | null; bytes: number; type: string | null };
/*
 * Payload's cookie authentication (node_modules/payload/dist/auth/extractJWT.js) accepts a cookie
 * when the request carries a trusted `Origin`, or — with no Origin — a `Sec-Fetch-Site` of
 * same-origin / same-site / none. A bare cookie with no browser context headers is IGNORED, which is
 * the CSRF defence: possessing the cookie is not enough, the request must look like it came from the
 * site. Real browsers send `Sec-Fetch-Site: same-origin` on `<img>` loads (verified with Playwright
 * against the running admin — see evidence/admin-media-edit.png), so the probe sends what the
 * browser sends. `bare: true` deliberately omits it.
 */
const browserHeaders = (bare = false): Record<string, string> =>
  bare ? { Cookie: cookie } : { Cookie: cookie, "Sec-Fetch-Site": "same-origin" };

const probe = async (url: string, authenticated = false, bare = false): Promise<Probe> => {
  /* The document stores absolute URLs built from serverURL; probe the server under test instead. */
  const path = new URL(url, BASE).pathname;
  const response = await fetch(BASE + path, authenticated ? { headers: browserHeaders(bare) } : {});
  const body = await response.arrayBuffer();
  return {
    status: response.status,
    cacheControl: response.headers.get("cache-control"),
    bytes: body.byteLength,
    type: response.headers.get("content-type"),
  };
};
const isDenied = (p: Probe) => p.status === 403 || p.status === 404;
const isServed = (p: Probe) => p.status === 200 && p.bytes > 0;

/* Remove fixtures left behind by an interrupted run, so the library is never polluted. */
{
  const stale = await payload.find({ collection: "media", where: { filename: { like: "phase-c-" } }, limit: 50, overrideAccess: true });
  for (const doc of stale.docs) await payload.delete({ collection: "media", id: doc.id, overrideAccess: true });
  if (stale.docs.length) console.log(`  cleaned ${stale.docs.length} stale fixture(s) from an earlier run`);
}

/* ── fixture: a real 1200×800 image so genuine derivatives are produced ──────────── */
const source = await sharp({
  create: { width: 1200, height: 800, channels: 3, background: { r: 26, g: 58, b: 102 } },
})
  .png()
  .toBuffer();

const asset = await payload.create({
  collection: "media",
  data: { alt: "اختبار خصوصية الوسائط", visibility: "private" },
  file: { data: source, mimetype: "image/png", name: `phase-c-binary-${Date.now()}.png`, size: source.length },
  overrideAccess: true,
});

const urls = {
  original: asset.url!,
  thumbnail: asset.sizes?.thumbnail?.url ?? null,
  card: asset.sizes?.card?.url ?? null,
};
console.log(`\n  fixture: id ${asset.id} — ${asset.filename}`);
console.log(`  original  ${urls.original}`);
console.log(`  thumbnail ${urls.thumbnail}`);
console.log(`  card      ${urls.card}\n`);

record(Boolean(urls.thumbnail && urls.card), "sharp generated both configured derivatives (400×300, 768×512)");

/* ── 1 · PRIVATE + anonymous: every URL must be unreachable ──────────────────────── */
console.log("══ 1 · PRIVATE asset, anonymous visitor ══");
const privateAnon = {
  original: await probe(urls.original),
  thumbnail: await probe(urls.thumbnail!),
  card: await probe(urls.card!),
};
record(isDenied(privateAnon.original), "PRIVATE original  → DENY", `HTTP ${privateAnon.original.status}`);
record(isDenied(privateAnon.thumbnail), "PRIVATE thumbnail → DENY", `HTTP ${privateAnon.thumbnail.status}`);
record(isDenied(privateAnon.card), "PRIVATE card      → DENY", `HTTP ${privateAnon.card.status}`);

/* §4 — the file exists; it is access control that refuses, not a missing file. */
const onDisk = await payload.find({ collection: "media", where: { id: { equals: asset.id } }, overrideAccess: true });
record(onDisk.docs.length === 1, "the private asset still EXISTS in the library (denial is authorization, not absence)");
record(
  privateAnon.original.cacheControl?.includes("no-store") ?? false,
  "denied response is not cacheable",
  `Cache-Control: ${privateAnon.original.cacheControl}`,
);

/* ── 2 · PRIVATE + authorized admin: every URL must be reachable ─────────────────── */
console.log("\n══ 2 · PRIVATE asset, authenticated admin with media.read ══");
const privateAuth = {
  original: await probe(urls.original, true),
  thumbnail: await probe(urls.thumbnail!, true),
  card: await probe(urls.card!, true),
};
record(isServed(privateAuth.original), "authorized original  → ALLOW", `HTTP ${privateAuth.original.status}, ${privateAuth.original.bytes} B`);
record(isServed(privateAuth.thumbnail), "authorized thumbnail → ALLOW", `HTTP ${privateAuth.thumbnail.status}, ${privateAuth.thumbnail.bytes} B`);
record(isServed(privateAuth.card), "authorized card      → ALLOW", `HTTP ${privateAuth.card.status}, ${privateAuth.card.bytes} B`);
{
  /* Defence in depth, and the reason §4 holds: a replayed cookie outside a browser context is not
     authenticated at all. Knowledge of the token — like knowledge of the URL — buys nothing. */
  const bare = await probe(urls.original, true, true);
  record(isDenied(bare), "a bare cookie replay (no browser context headers) is refused", `HTTP ${bare.status}`);
}

/* ── 3 · flip to PUBLIC: anonymous must get the bytes ────────────────────────────── */
console.log("\n══ 3 · transition PRIVATE → PUBLIC ══");
const flipStart = Date.now();
await payload.update({ collection: "media", id: asset.id, data: { visibility: "public" }, overrideAccess: true });
const publicAnon = {
  original: await probe(urls.original),
  thumbnail: await probe(urls.thumbnail!),
  card: await probe(urls.card!),
};
record(isServed(publicAnon.original), "PUBLIC original  → anonymous ALLOW", `HTTP ${publicAnon.original.status}, ${publicAnon.original.bytes} B`);
record(isServed(publicAnon.thumbnail), "PUBLIC thumbnail → anonymous ALLOW", `HTTP ${publicAnon.thumbnail.status}, ${publicAnon.thumbnail.bytes} B`);
record(isServed(publicAnon.card), "PUBLIC card      → anonymous ALLOW", `HTTP ${publicAnon.card.status}, ${publicAnon.card.bytes} B`);
record(isServed(publicAnon.card), "PRIVATE_TO_PUBLIC activation is immediate on the first request", `${Date.now() - flipStart} ms after the write`);

/* The very same derivative URLs are used in both directions: the only thing that changed is
   visibility. That is the point — the URL is not the secret. */
{
  const after = await payload.findByID({ collection: "media", id: asset.id, overrideAccess: true });
  const sameUrls =
    after.url === asset.url &&
    after.sizes?.thumbnail?.url === asset.sizes?.thumbnail?.url &&
    after.sizes?.card?.url === asset.sizes?.card?.url;
  record(
    sameUrls,
    "the SAME URLs served both states — the path/filename never changes on transition",
    "so neither the filename nor its obscurity is part of the protection",
  );
}

/* ── 4 · flip back to PRIVATE: anonymous access must be revoked, promptly ────────── */
console.log("\n══ 4 · transition PUBLIC → PRIVATE ══");
const revokeStart = Date.now();
await payload.update({ collection: "media", id: asset.id, data: { visibility: "private" }, overrideAccess: true });
const revoked = {
  original: await probe(urls.original),
  thumbnail: await probe(urls.thumbnail!),
  card: await probe(urls.card!),
};
record(isDenied(revoked.original), "revoked original  → DENY again", `HTTP ${revoked.original.status}`);
record(isDenied(revoked.thumbnail), "revoked thumbnail → DENY again", `HTTP ${revoked.thumbnail.status}`);
record(isDenied(revoked.card), "revoked card      → DENY again", `HTTP ${revoked.card.status}`);
record(isDenied(revoked.card), "PUBLIC_TO_PRIVATE revocation is immediate on the first request", `${Date.now() - revokeStart} ms after the write`);
record(
  !(revoked.original.cacheControl ?? "").includes("max-age=31536000"),
  "revoked response carries no public long-lived cache directive",
  `Cache-Control: ${revoked.original.cacheControl}`,
);

/* ── 5 · audit trail for both transitions ───────────────────────────────────────── */
const audit = await payload.find({
  collection: "audit-events",
  where: { and: [{ action: { equals: "media_visibility_changed" } }, { resourceId: { equals: String(asset.id) } }] },
  sort: "-createdAt",
  limit: 5,
  overrideAccess: true,
});
record(audit.docs.length >= 2, "both visibility transitions were audited", `${audit.docs.length} events for media ${asset.id}`);

/* ── cleanup ────────────────────────────────────────────────────────────────────── */
await payload.delete({ collection: "media", id: asset.id, overrideAccess: true });
console.log("\n  fixture removed (document + files)");

console.log(`\n  checks passed: ${passed}`);
console.log(`  checks failed: ${failed}`);
if (failures.length) for (const f of failures) console.log(`    · ${f}`);
console.log(failed === 0 ? "\n  MEDIA_BINARY_VISIBILITY = PASS\n" : "\n  MEDIA_BINARY_VISIBILITY = FAIL\n");

await payload.destroy();
process.exit(failed === 0 ? 0 : 1);
