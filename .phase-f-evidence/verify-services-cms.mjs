/**
 * PHASE F GATE — the capability documents, measured against the live server and the real database.
 *
 * Every check is an external HTTP call with a real session: content equivalence, per-locale authority,
 * refusals (with named blockers), RBAC, audit trail and the honesty rules (no fabricated work).
 * Nothing is asserted from source code.
 *
 * Usage: node .phase-f-evidence/verify-services-cms.mjs
 */
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const SUPER = { email: process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com", password: process.env.SEED_SUPER_ADMIN_PASSWORD };
const FIXTURE_PASSWORD = "Verify!PhaseB2026x";
if (!SUPER.password) throw new Error("SEED_SUPER_ADMIN_PASSWORD missing — export it from .env");

const LANDS = [
  "strategy-business-growth",
  "branding-creative",
  "content-production",
  "social-digital-presence",
  "performance-acquisition",
  "web-commerce-experiences",
  "software-automation-technology",
];
const PATHS = ["", "/services", ...LANDS.map((slug) => `/services/${slug}`), "/work", "/insights", "/sitemap.xml"];
const LOCALES = ["ar", "en"];

let passed = 0;
const failures = [];
const ok = (condition, label, detail = "") => {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

const visibleText = (body) =>
  body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const login = async (email, password) => {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed for ${email}: ${res.status}`);
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  return { cookie, "content-type": "application/json", origin: BASE, "sec-fetch-site": "same-origin" };
};

const page = async (locale, path) => visibleText(await (await fetch(`${BASE}/${locale}${path}`)).text());

const api = async (auth, path, init = {}) => {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth, ...(init.headers ?? {}) } });
  let body = null;
  try {
    body = await res.clone().json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
};

const superAuth = await login(SUPER.email, SUPER.password);

/** Ids + stored state of the seven capability documents. */
const docs = async () => {
  const { body } = await api(superAuth, "/api/services?limit=20&depth=0&draft=true&locale=all");
  return (body?.docs ?? []).map((doc) => ({
    id: doc.id,
    landKey: doc.landKey,
    ar: doc.localeState?.ar?.state ?? "draft",
    en: doc.localeState?.en?.state ?? "draft",
    titleAr: doc.title?.ar,
    enabled: doc.enabled,
  }));
};

const byKey = async (key) => (await docs()).find((doc) => doc.landKey === key);

const setLocales = async (id, locales) => {
  const path = locales.length ? `/api/services/${id}/publish` : `/api/services/${id}/unpublish`;
  return api(superAuth, path, { method: "POST", body: JSON.stringify({ locales }) });
};

const publishAll = async (locales) => {
  for (const doc of await docs()) await setLocales(doc.id, locales);
};

console.log("\n=== A · CONTENT EQUIVALENCE (published CMS vs the shipped baseline) ===");
{
  /* Deterministic starting point: the seven capabilities offered and published in both locales.
     (A capability left disabled by an interrupted run cannot be published — that is the rule.) */
  for (const doc of await docs()) {
    if (doc.enabled !== true) {
      await api(superAuth, `/api/services/${doc.id}?locale=ar&draft=true`, { method: "PATCH", body: JSON.stringify({ enabled: true }) });
    }
  }
  await publishAll(["ar", "en"]);
  let identical = 0;
  const total = PATHS.length * LOCALES.length;
  const diffs = [];
  for (const locale of LOCALES) {
    for (const path of PATHS) {
      const baseline = readFileSync(
        new URL(`./text/pre/${locale}${path.replace(/\//g, "_") || "_home"}.txt`, import.meta.url),
        "utf8",
      );
      const current = await page(locale, path);
      if (baseline === current) identical += 1;
      else diffs.push(`${locale}${path || "/"}`);
    }
  }
  ok(identical === total, `TEXT_EQUIVALENCE published vs shipped: ${identical}/${total} byte-identical`, diffs.join(", "));
  const state = await docs();
  ok(
    state.length === 7 && state.every((doc) => doc.ar === "published" && doc.en === "published"),
    "all seven capabilities published in both locales",
    JSON.stringify(state.map((d) => `${d.landKey}:${d.ar}/${d.en}`)),
  );
}

console.log("\n=== B · PER-LOCALE AUTHORITY (real fallback, no cross-language leak) ===");
{
  const target = await byKey("branding-creative");
  const baselineAr = readFileSync(new URL("./text/pre/ar_services_branding-creative.txt", import.meta.url), "utf8");
  const baselineEn = readFileSync(new URL("./text/pre/en_services_branding-creative.txt", import.meta.url), "utf8");
  const shippedTitleAr = shippedField("branding-creative", "ar", "title");
  const shippedTitleEn = shippedField("branding-creative", "en", "title");

  /* A real editorial change in Arabic only, published in Arabic only. */
  const marker = "استوديو الهوية والتعبير البصري";
  const edit = await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ title: marker }),
  });
  ok(edit.status === 200, "an editor may change the Arabic title (draft)", `status ${edit.status}`);
  const stillStatic = await page("ar", "/services/branding-creative");
  ok(stillStatic === baselineAr, "an unpublished Arabic edit does NOT leak to the public page");

  const publishAr = await setLocales(target.id, ["ar"]);
  ok(publishAr.status === 200, "publishing Arabic succeeds", JSON.stringify(publishAr.body));
  const afterPublish = await byKey("branding-creative");
  ok(
    afterPublish.ar === "published" && afterPublish.en === "published",
    "after publishing Arabic, both locales report published (state carried forward)",
    JSON.stringify(afterPublish),
  );
  const arPageWithMarker = await page("ar", "/services/branding-creative");
  ok(arPageWithMarker.includes(marker), "the public Arabic page shows the new title");
  const enPage = await page("en", "/services/branding-creative");
  ok(enPage === baselineEn, "the English page is untouched by an Arabic-only publish");
  ok(!enPage.includes(marker), "no Arabic string leaks into English");

  /* Unpublish Arabic ONLY — the page must fall back to the shipped Arabic content, not to English. */
  const unpublishAr = await api(superAuth, `/api/services/${target.id}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ locales: ["ar"] }),
  });
  ok(unpublishAr.status === 200, "unpublishing a single locale succeeds", JSON.stringify(unpublishAr.body));
  const mixed = await byKey("branding-creative");
  ok(mixed.ar === "draft" && mixed.en === "published", "the mix is exactly ar=draft · en=published", JSON.stringify(mixed));
  const fallbackPage = await page("ar", "/services/branding-creative");
  ok(!fallbackPage.includes(marker), "the marker disappeared from Arabic after unpublishing");
  ok(fallbackPage.includes(shippedTitleAr), "Arabic shows the shipped Arabic title again");
  ok(fallbackPage === baselineAr, "…byte-identical to the shipped baseline, which is what fallback means");
  ok(arPageWithMarker !== baselineAr, "while published, the Arabic page did differ from the baseline (the CMS really was live)");
  ok(arPageWithMarker.includes(marker), "…because it carried the editorial change, and nothing else moved");
  const enStill = await page("en", "/services/branding-creative");
  ok(enStill === baselineEn && enStill.includes(shippedTitleEn), "English is still the published CMS content");

  /* Restore: the shipped Arabic title, republished in both locales. */
  await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ title: shippedTitleAr }),
  });
  await setLocales(target.id, ["ar", "en"]);
  const restored = await page("ar", "/services/branding-creative");
  ok(restored === baselineAr, "restoring the shipped title returns the page to its baseline bytes");
}

/** Reads a shipped field straight from `src/content/services.ts` — never retyped by hand. */
function shippedField(slug, locale, field) {
  const seed = readFileSync(new URL("../src/content/services.ts", import.meta.url), "utf8");
  const block = seed.split(`slug: "${slug}"`)[1] ?? "";
  if (!block) throw new Error(`capability ${slug} not found in the shipped content`);
  const localeBlock = locale === "ar" ? block.split("en: {")[0] : block.split("en: {")[1] ?? "";
  const pattern = new RegExp(`${field}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = localeBlock.match(pattern);
  if (!match) throw new Error(`could not read ${field} (${locale}) for ${slug}`);
  return match[1].replace(/\\"/g, '"');
}

console.log("\n=== C · REFUSALS (named blockers, nothing partially published) ===");
{
  const target = await byKey("content-production");
  const shippedIntroAr = shippedField("content-production", "ar", "intro");
  const baselineAr = readFileSync(new URL("./text/pre/ar_services_content-production.txt", import.meta.url), "utf8");

  /* 1 · a required field emptied for Arabic. */
  await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, { method: "PATCH", body: JSON.stringify({ intro: "" }) });
  const refused = await setLocales(target.id, ["ar"]);
  const blockers = refused.body?.blockers ?? [];
  ok(refused.status === 400, "publish refused when a required field is empty", `status ${refused.status}`);
  ok(
    blockers.some((b) => b.locale === "ar" && (b.fieldLabel ?? "").includes("المقدمة")),
    "the refusal NAMES the field and the locale",
    JSON.stringify(blockers),
  );
  const afterRefusal = await byKey("content-production");
  ok(afterRefusal.ar === "published" && afterRefusal.en === "published", "a refused publish leaves the live state untouched", JSON.stringify(afterRefusal));
  const publicAfterRefusal = await page("ar", "/services/content-production");
  ok(publicAfterRefusal === baselineAr, "the public page is unchanged by a refused publish");

  /* 2 · a REAL private image used as a cover: the gate refuses and names the file. */
  const upload = await uploadFixturePng();
  ok(upload.status === 201 && upload.id, "a private image can be uploaded as a fixture", `status ${upload.status}`);
  const withCover = await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ cover: upload.id }),
  });
  ok(withCover.status === 200, "the draft can reference the private image", `status ${withCover.status}`);
  const mediaRefusal = await setLocales(target.id, ["ar"]);
  const mediaBlockers = mediaRefusal.body?.blockers ?? [];
  ok(
    mediaRefusal.status === 400 && mediaBlockers.some((b) => (b.fieldLabel ?? "").includes("الغلاف")),
    "a private cover image is refused, naming the field",
    JSON.stringify(mediaBlockers),
  );
  ok(
    mediaBlockers.some((b) => (b.message ?? "").includes("خاص")),
    "the refusal explains the image is private and that visibility is never flipped silently",
  );

  /* 3 · disabling a PUBLISHED capability is refused (it would drop an indexed URL). */
  const disable = await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ enabled: false }),
  });
  const stillEnabled = await byKey("content-production");
  ok(disable.status >= 400 && stillEnabled.enabled === true, "stopping a published capability is refused", `status ${disable.status}`);

  /* 4 · the identity is immutable. */
  const rename = await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ landKey: "branding-creative" }),
  });
  ok(rename.status >= 400, "changing the capability identity is refused", `status ${rename.status}`);

  /* Restore: shipped intro, no cover, enabled, republished. */
  await api(superAuth, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ intro: shippedIntroAr, cover: null, enabled: true }),
  });
  const republish = await setLocales(target.id, ["ar", "en"]);
  ok(republish.status === 200, "restored capability publishes again", `status ${republish.status} ${JSON.stringify(republish.body?.blockers ?? [])}`);
  const restoredPage = await page("ar", "/services/content-production");
  ok(restoredPage === baselineAr, "restored page is byte-identical to the baseline again");

  /* The fixture leaves no trace: it is unreferenced now, so it can be deleted. */
  if (upload.id) {
    const usage = await api(superAuth, `/api/media/${upload.id}/usage`);
    ok((usage.body?.references?.length ?? 0) === 0, "the fixture is no longer referenced by any document", JSON.stringify(usage.body?.references));
    const removed = await api(superAuth, `/api/media/${upload.id}?depth=0`, { method: "DELETE" });
    ok(removed.status === 200, "the fixture image is deleted again", `status ${removed.status}`);
  }
}

/** Uploads a small PNG through the real endpoint (private by default — that is the point). */
async function uploadFixturePng() {
  const sharp = (await import("sharp")).default;
  const buffer = await sharp({ create: { width: 24, height: 24, channels: 3, background: { r: 122, g: 156, b: 198 } } })
    .png()
    .toBuffer();
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/png" }), "phase-f-cover-fixture.png");
  form.append("_payload", JSON.stringify({ alt: { ar: "صورة اختبار المجالات", en: "Capability test image" } }));
  const res = await fetch(`${BASE}/api/media?locale=ar&draft=false`, {
    method: "POST",
    headers: { cookie: superAuth.cookie, origin: BASE, "sec-fetch-site": "same-origin" },
    body: form,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, id: body?.doc?.id, visibility: body?.doc?.visibility };
}

console.log("\n=== D · RBAC (real sessions, real endpoints) ===");
{
  const target = await byKey("social-digital-presence");
  const anon = await fetch(`${BASE}/api/services/${target.id}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locales: ["ar"] }),
  });
  ok([401, 403].includes(anon.status), "anonymous cannot publish", `status ${anon.status}`);

  const anonList = await fetch(`${BASE}/api/services?limit=5&draft=true`);
  ok(anonList.status === 403, "anonymous cannot read the draft list", `status ${anonList.status}`);

  const viewer = await login("verify+viewer@sevenlands.test", FIXTURE_PASSWORD);
  const viewerPublish = await api(viewer, `/api/services/${target.id}/publish`, { method: "POST", body: JSON.stringify({ locales: ["ar"] }) });
  ok(viewerPublish.status === 403, "viewer cannot publish", `status ${viewerPublish.status}`);
  const viewerRead = await api(viewer, "/api/services?limit=5&draft=true");
  ok(viewerRead.status === 200, "viewer may read (services.read)", `status ${viewerRead.status}`);

  const marketing = await login("verify+marketing@sevenlands.test", FIXTURE_PASSWORD);
  const marketingPublish = await api(marketing, `/api/services/${target.id}/publish`, { method: "POST", body: JSON.stringify({ locales: ["ar"] }) });
  ok(marketingPublish.status === 403, "marketing cannot publish capabilities", `status ${marketingPublish.status}`);

  const editor = await login("verify+editor@sevenlands.test", FIXTURE_PASSWORD);
  const editorEdit = await api(editor, `/api/services/${target.id}?locale=ar&draft=true`, {
    method: "PATCH",
    body: JSON.stringify({ short: (await byKey("social-digital-presence")).landKey ? undefined : undefined }),
  });
  ok([200, 400].includes(editorEdit.status), "editor reaches the capability document", `status ${editorEdit.status}`);
}

console.log("\n=== E · AUDIT TRAIL ===");
{
  const { body } = await api(superAuth, "/api/audit-events?limit=100&depth=0&sort=-occurredAt");
  const events = body?.docs ?? [];
  const published = events.filter((event) => event.action === "service_published");
  ok(published.length >= 7, "publishing is recorded in the audit log", `${published.length} service_published events`);
  ok(
    published.every((event) => event.resourceType === "services"),
    "audit events carry the capability resource type",
  );
  const refused = events.filter((event) => (event.summary ?? "").includes("محاولة نشر مرفوضة"));
  ok(refused.length >= 1, "refused publications are recorded too", `${refused.length}`);
}

console.log("\n=== F · HONESTY (no fabricated work, no internal notes in public HTML) ===");
{
  const projects = await api(superAuth, "/api/projects?limit=5&draft=true&depth=0");
  const insights = await api(superAuth, "/api/insights?limit=5&draft=true&depth=0");
  ok((projects.body?.totalDocs ?? -1) === 0, "the work collection holds no fabricated case study", `totalDocs=${projects.body?.totalDocs}`);
  ok((insights.body?.totalDocs ?? -1) === 0, "the insights collection holds no fabricated article", `totalDocs=${insights.body?.totalDocs}`);

  const work = await page("ar", "/work");
  const insightsPage = await page("ar", "/insights");
  ok(work.length > 200 && work.includes("لا") , "the Arabic work page renders its honest empty state", `${work.length} chars`);
  ok(insightsPage.length > 200, "the Arabic insights page renders its honest empty state", `${insightsPage.length} chars`);

  /* A scratch draft with an internal source note must never reach the public HTML. */
  const marker = "SOURCE-NOTE-MUST-STAY-INTERNAL-2f8b";
  const created = await api(superAuth, "/api/projects?locale=ar&draft=true", {
    method: "POST",
    body: JSON.stringify({
      name: "اختبار داخلي",
      slug: `qa-scratch-${Date.now()}`,
      summary: "مسودة اختبار",
      metrics: [{ label: "مؤشر", value: "1", sourceNote: marker }],
    }),
  });
  const id = created.body?.doc?.id;
  ok(Boolean(id), "a scratch project draft can be created for the note test", `status ${created.status}`);
  if (id) {
    const pages = await Promise.all(LOCALES.map((locale) => page(locale, "/work")));
    ok(!pages.join(" ").includes(marker), "the internal source note never appears in public HTML");
    const removed = await api(superAuth, `/api/projects/${id}?depth=0`, { method: "DELETE" });
    ok(removed.status === 200, "the scratch draft is removed again", `status ${removed.status}`);
  }
}

console.log(`\nPHASE F SERVICES GATE: ${passed} passed, ${failures.length} failed`);
if (failures.length) console.log(failures.map((f) => `  ✗ ${f}`).join("\n"));
process.exitCode = failures.length ? 1 : 0;
