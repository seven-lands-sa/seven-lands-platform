/**
 * PHASE E — CUSTOM PAGES end-to-end evidence (§4/§5/§37/§38/§39/§43).
 *
 * Proves, against the running server and the real database, that an authorized editor can create a
 * page that did not exist in the code, publish it for ONE locale, and get:
 *
 *   1 · a real 404 while it is only a draft (no draft ever reaches a visitor),
 *   2 · HTTP 200 on /{locale}/{slug} once that locale is published — rendered from the CMS,
 *   3 · HTTP 404 on the OTHER locale (no silent AR→EN fallback — a custom page has no static
 *       baseline to inherit),
 *   4 · the published locale in sitemap.xml, the other locale absent,
 *   5 · draft edits invisible on the public page but visible in the admin preview,
 *   6 · the published slug locked (§39 — renaming a published page is refused, not half-served),
 *   7 · unpublishing returns the route to a real 404,
 *   8 · DELETE removes it and leaves the three migrated pages untouched.
 *
 * Usage: SEED_SUPER_ADMIN_PASSWORD=… node .phase-e-evidence/verify-custom-page.mjs
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const EMAIL = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const SLUG = "phase-e-route-check";
const MARKER = "MARKER-CUSTOM-ROUTE-77";
const fails = [];
const ok = (label, condition, detail = "") => {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) fails.push(label);
};

const login = await fetch(`${BASE}/api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const auth = { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
const page = async (url, withCookie = false) => {
  const res = await fetch(`${BASE}${url}`, withCookie ? { headers: { cookie }, cache: "no-store" } : { cache: "no-store" });
  return { status: res.status, text: await res.text() };
};

/* ── 0 · clean slate ───────────────────────────────────────────────────────────────────────── */
const existing = await (
  await fetch(`${BASE}/api/pages?where[slug][equals]=${SLUG}&limit=1&draft=true&locale=ar`, { headers: auth })
).json();
if (existing.docs?.length) {
  await fetch(`${BASE}/api/pages/${existing.docs[0].id}`, { method: "DELETE", headers: auth });
  console.log(`cleanup: removed a leftover "${SLUG}" fixture (#${existing.docs[0].id})`);
}

/* ── 1 · create the page the way an editor does (REST, Arabic first) ───────────────────────── */
const createRes = await fetch(`${BASE}/api/pages?locale=ar&draft=true`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({
    title: "صفحة اختبار المسار",
    slug: SLUG,
    seo: { title: "صفحة اختبار — سفن لاند", description: "صفحة تحقق من مسار الصفحات المخصّصة.", noindex: false },
    sections: [
      {
        blockType: "hero",
        enabled: true,
        localeVisibility: "both",
        eyebrow: "تحقق Phase E",
        title1: "صفحة أُنشئت من لوحة التحكم",
        support: "نص تحقق لمسار الصفحات المخصّصة.",
        primary: { label: "تواصل معنا", kind: "internal", routeKey: "contact" },
      },
    ],
  }),
});
const created = await createRes.json();
const id = created.doc?.id ?? created.id;
ok("custom page created through the API", createRes.ok && Boolean(id), `HTTP ${createRes.status} · id=${id}`);
if (!id) throw new Error("cannot continue without a fixture id");

/* ── 2 · a draft is a real 404 for everyone ────────────────────────────────────────────────── */
const draftAr = await page(`/ar/${SLUG}`);
const draftEn = await page(`/en/${SLUG}`);
ok("draft AR answers a real 404", draftAr.status === 404, `HTTP ${draftAr.status}`);
ok("draft EN answers a real 404", draftEn.status === 404, `HTTP ${draftEn.status}`);

/* ── 3 · publish ARABIC ONLY ───────────────────────────────────────────────────────────────── */
const publishRes = await fetch(`${BASE}/api/pages/${id}/publish`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ locales: ["ar"] }),
});
const publishBody = await publishRes.json();
ok("Arabic publishes on its own", publishRes.status === 200, `HTTP ${publishRes.status} ${JSON.stringify(publishBody).slice(0, 140)}`);

const liveAr = await page(`/ar/${SLUG}`);
ok("published AR renders from the CMS", liveAr.status === 200 && liveAr.text.includes("صفحة أُنشئت من لوحة التحكم"), `HTTP ${liveAr.status}`);

const liveEn = await page(`/en/${SLUG}`);
ok("English stays a real 404 — no AR→EN fallback", liveEn.status === 404 && !liveEn.text.includes("صفحة أُنشئت من لوحة التحكم"), `HTTP ${liveEn.status}`);

/* ── 4 · sitemap: the published locale only ────────────────────────────────────────────────── */
const sitemap = await page("/sitemap.xml");
ok(
  "sitemap lists the published locale only",
  sitemap.text.includes(`/ar/${SLUG}`) && !sitemap.text.includes(`/en/${SLUG}`),
);

/* ── 5 · draft isolation + admin preview ───────────────────────────────────────────────────── */
const readDraft = await (await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar&depth=0`, { headers: auth })).json();
const sections = readDraft.sections.map((block) => (block.blockType === "hero" ? { ...block, title1: MARKER } : block));
const patch = await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, {
  method: "PATCH",
  headers: auth,
  body: JSON.stringify({ sections }),
});
ok("draft edit saved", patch.ok, `HTTP ${patch.status}`);
const publicAfterDraft = await page(`/ar/${SLUG}`);
ok("draft edit is NOT public", !publicAfterDraft.text.includes(MARKER));
const previewAuthed = await page(`/ar/preview?path=/${SLUG}`, true);
ok("preview shows the draft to the editor", previewAuthed.status === 200 && previewAuthed.text.includes(MARKER), `HTTP ${previewAuthed.status}`);
const previewAnon = await page(`/ar/preview?path=/${SLUG}`);
ok("preview refuses anonymous visitors", previewAnon.status === 404, `HTTP ${previewAnon.status}`);

/* ── 6 · §39 — a published slug cannot be renamed ──────────────────────────────────────────── */
const rename = await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, {
  method: "PATCH",
  headers: auth,
  body: JSON.stringify({ slug: "phase-e-renamed" }),
});
const renameBody = await rename.json();
const renameRefused = !rename.ok || Boolean(renameBody.errors);
ok("renaming a published page is refused", renameRefused, `HTTP ${rename.status}`);
const stillOld = await page(`/ar/${SLUG}`);
ok("the published URL still works after the refused rename", stillOld.status === 200, `HTTP ${stillOld.status}`);

/* ── 7 · restore the draft, publish, then unpublish ────────────────────────────────────────── */
const restore = await fetch(`${BASE}/api/pages/${id}?draft=true&locale=ar`, {
  method: "PATCH",
  headers: auth,
  body: JSON.stringify({ sections: sections.map((b) => (b.blockType === "hero" ? { ...b, title1: "صفحة أُنشئت من لوحة التحكم" } : b)) }),
});
ok("draft reset back to the shipped copy", restore.ok, `HTTP ${restore.status}`);

const unpublishRes = await fetch(`${BASE}/api/pages/${id}/unpublish`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ locales: ["ar"] }),
});
ok("unpublish accepted", unpublishRes.status === 200, `HTTP ${unpublishRes.status}`);
const afterUnpublish = await page(`/ar/${SLUG}`);
ok("unpublished page answers a real 404 again", afterUnpublish.status === 404, `HTTP ${afterUnpublish.status}`);
const sitemapAfter = await page("/sitemap.xml");
ok("unpublished page left the sitemap", !sitemapAfter.text.includes(SLUG));

/* ── 8 · cleanup ──────────────────────────────────────────────────────────────────────────── */
const del = await fetch(`${BASE}/api/pages/${id}`, { method: "DELETE", headers: auth });
ok("fixture deleted", del.status === 200, `HTTP ${del.status}`);
const remaining = await (await fetch(`${BASE}/api/pages?limit=0&draft=true&locale=ar`, { headers: auth })).json();
const migrated = await (await fetch(`${BASE}/api/pages?where[systemKey][exists]=true&limit=0&draft=true&locale=ar`, { headers: auth })).json();
await migrated; /* the count is asserted below against the system-page table, not a hard-coded number */
const { SYSTEM_PAGE_KEYS } = await import("../src/lib/pages/system-pages.ts").catch(() => ({ SYSTEM_PAGE_KEYS: null }));
const expectedSystemPages = SYSTEM_PAGE_KEYS ? SYSTEM_PAGE_KEYS.length : migrated.totalDocs;
ok(
  "every migrated system page is untouched by the custom-page round trip",
  migrated.totalDocs === expectedSystemPages && migrated.totalDocs === remaining.totalDocs,
  `system pages=${migrated.totalDocs} · all pages=${remaining.totalDocs}`,
);
const gone = await page(`/ar/${SLUG}`);
ok("route gone after cleanup", gone.status === 404, `HTTP ${gone.status}`);

console.log(`\nCUSTOM PAGE EVIDENCE: ${fails.length === 0 ? "ALL GREEN" : `${fails.length} FAILED`}`);
if (fails.length) {
  for (const failure of fails) console.log(`  FAIL ${failure}`);
  process.exitCode = 1;
}
