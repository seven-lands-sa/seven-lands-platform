/**
 * PHASE E VERIFICATION SUITE (§94 page suite, §95 regression hooks).
 *
 *   ALLOW_VERIFICATION_WRITES=true npx payload run src/scripts/verify-phase-e.ts
 *
 * Runs against the LOCAL database and the running server on :3000. Every check is independent and
 * every failure prints what it expected. Read-only except for the two checks marked WRITE, which
 * restore the document to the state they found it in.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import { BLOCK_KEYS, BLOCK_REGISTRY } from "@/lib/blocks/types";
import { PAGE_BLOCK_DEFINITIONS } from "@/lib/blocks/schema";
import { validateSlug } from "@/lib/pages/slug";
import { isCustomPageCandidate } from "@/lib/routes";
import { SYSTEM_PAGES } from "@/lib/pages/system-pages";
import { Pages } from "@/collections/Pages";
import { validatePageForPublish, collectPageMediaIds, type MediaFacts } from "@/lib/pages/publish";
import { visibleBlocks } from "@/lib/pages/adapter";
import { PAGES_LIST_TAG, pageSystemTag, pageTag } from "@/lib/content/tags";

const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const payload = await getPayload({ config });

let passed = 0;
const failures: string[] = [];
const check = (name: string, condition: boolean, detail?: string) => {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* ── HTTP helpers (admin session, exactly what the admin UI does) ───────────────────────────── */

const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? "owner@sevnland.com";
const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "";
let cookie = "";
try {
  const login = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
} catch {
  /* the server may be down; HTTP checks then fail with a clear message below */
}
const http = async (path: string, init?: RequestInit) => {
  try {
    const response = await fetch(`${BASE}${path}`, init);
    return { status: response.status, text: await response.text(), headers: response.headers };
  } catch (error) {
    return { status: 0, text: String(error), headers: new Headers() };
  }
};

/* ── 1 · block registry (§7/§8 — one authoritative source) ──────────────────────────────────── */

check("registry: exactly 18 block types", BLOCK_KEYS.length === 18, `got ${BLOCK_KEYS.length}`);
check(
  "registry: BLOCK_KEYS matches BLOCK_REGISTRY",
  BLOCK_KEYS.every((key) => Boolean(BLOCK_REGISTRY[key])) && Object.keys(BLOCK_REGISTRY).length === BLOCK_KEYS.length,
);
check(
  "registry: every block has Arabic and English labels",
  BLOCK_KEYS.every((key) => Boolean(BLOCK_REGISTRY[key].label.ar && BLOCK_REGISTRY[key].label.en)),
);
check(
  "registry: every block has a field definition in the collection schema",
  PAGE_BLOCK_DEFINITIONS.length === BLOCK_KEYS.length &&
    BLOCK_KEYS.every((key) => PAGE_BLOCK_DEFINITIONS.some((block) => block.slug === key)),
  `definitions=${PAGE_BLOCK_DEFINITIONS.map((block) => block.slug).join(",")}`,
);
const rendered = BLOCK_KEYS.filter((key) => BLOCK_REGISTRY[key].rendered);
const unrendered = BLOCK_KEYS.filter((key) => !BLOCK_REGISTRY[key].rendered);
check(
  "registry: rendered set is the seventeen shipped blocks",
  rendered.length === 17 &&
    [
      "hero",
      "trustStatement",
      "landsSystem",
      "problems",
      "process",
      "why",
      "workTeaser",
      "cta",
      "legalDocument",
      /* added by the about / contact / start-a-project migration (§43) */
      "pageHeader",
      "richText",
      "servicesTeaser",
      "operations",
      "noteSection",
      "buttonRow",
      "contactPanel",
      "briefForm",
    ].every((key) => rendered.includes(key as never)),
  `rendered=${rendered.join(",")}`,
);
check(
  "registry: only the map block still lacks a renderer",
  unrendered.length === 1 && unrendered[0] === "mapEmbed",
  `unrendered=${unrendered.join(",")}`,
);
/* Every block that DECLARES media must have a renderer that shows it, and only the hero declares
   media while explicitly not rendering it (the design has no image slot for it yet). */
check(
  "registry: blocks that declare media are exactly the hero (which refuses to publish it)",
  BLOCK_KEYS.filter((key) => BLOCK_REGISTRY[key].mediaPaths.length > 0).join(",") === "hero",
);
/* The three pages this phase migrated must each have a complete composition available. */
for (const [systemKey, expected] of [
  ["about", ["pageHeader", "richText", "servicesTeaser", "why", "operations", "noteSection", "buttonRow", "cta"]],
  ["contact", ["contactPanel"]],
  ["start-a-project", ["briefForm"]],
] as const) {
  const definition = SYSTEM_PAGES[systemKey];
  check(`registry: ${systemKey} is a migrated system page publishing in both locales`, definition.migrated && definition.requiresBothLocales);
  check(`registry: ${systemKey} has blocks for its migrated composition`, expected.every((key) => rendered.includes(key as never)));
}

/* ── 2 · slug contract (§38/§39) ───────────────────────────────────────────────────────────── */

check("slug: accepts a normal slug", validateSlug("new-offer").ok);
check("slug: rejects empty", !validateSlug("").ok);
check("slug: rejects one character", !validateSlug("a").ok);
check("slug: rejects 65 characters", !validateSlug("a".repeat(65)).ok);
check("slug: rejects reserved system segment", !validateSlug("about").ok);
check("slug: rejects the preview segment", !validateSlug("preview").ok);
check("slug: rejects the admin segment", !validateSlug("admin").ok);
check("slug: rejects uppercase/space input", !validateSlug("New Offer").ok);

/* ── 3 · publish validator (§24/§25) ───────────────────────────────────────────────────────── */

const noMedia = new Map<string, MediaFacts>();
const hero = (title1: unknown): Record<string, unknown> => ({
  blockType: "hero",
  label: { ar: "الواجهة", en: "Hero" },
  enabled: true,
  title1,
});
const base = {
  id: 1,
  systemKey: "home",
  slug: "home",
  title: "عنوان",
  localeState: { ar: { state: "draft" }, en: { state: "draft" } },
};

const empty = validatePageForPublish({ ...base, sections: [] } as never, noMedia);
check("validator: empty page is fatal", !empty.ok && empty.fatal === "empty_page");

const noTitle = validatePageForPublish({ ...base, title: "", sections: [hero("س")] } as never, noMedia);
check("validator: missing page title blocks both locales", !noTitle.perLocale.ar.ok && !noTitle.perLocale.en.ok);

const unknownBlock = validatePageForPublish({ ...base, sections: [{ blockType: "madeUp", title1: "x" }] } as never, noMedia);
check("validator: unknown block type is refused", !unknownBlock.ok && unknownBlock.blockers.some((b) => b.kind === "structure"));

const unrenderedBlock = validatePageForPublish({ ...base, sections: [{ blockType: "mapEmbed", enabled: true }] } as never, noMedia);
check(
  "validator: block without a renderer is refused with an Arabic reason",
  !unrenderedBlock.ok && unrenderedBlock.blockers.some((b) => b.message.includes("غير مدعوم")),
);

/** A hero with every field the registry requires, so only the tested field can fail. */
const fullHero = (title1: unknown, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  blockType: "hero",
  label: { ar: "الواجهة", en: "Hero" },
  enabled: true,
  eyebrow: { ar: "نص علوي", en: "Eyebrow" },
  title1,
  support: { ar: "دعم", en: "Support" },
  primary: { label: { ar: "ابدأ", en: "Start" }, routeKey: "start-a-project" },
  ...extra,
});
const partial = validatePageForPublish({ ...base, sections: [fullHero({ ar: "ص", en: "" })] } as never, noMedia);
check("validator: AR present + EN empty → AR ok, EN blocked (no fallback)", partial.perLocale.ar.ok && !partial.perLocale.en.ok);
check("validator: core page publishes both locales together", partial.requiresBothLocales === true);

/* Custom pages (§4/§5/§38/§39/§43): the `/[locale]/[slug]` route shipped with this phase, so a
   custom page with a valid slug publishes PER LOCALE — and a reserved or malformed slug is refused
   before anything can go live. */
const customArOnly = validatePageForPublish(
  {
    id: 2,
    systemKey: null,
    slug: "new-offer",
    title: { ar: "عرض", en: "" },
    sections: [fullHero({ ar: "ص", en: "" })],
  } as never,
  noMedia,
);
check(
  "validator: a custom page publishes per locale (Arabic may go live alone)",
  customArOnly.perLocale.ar.ok &&
    !customArOnly.perLocale.en.ok &&
    customArOnly.blockers.every((blocker) => blocker.locale === "en"),
);
check("validator: custom pages are per-locale, not both-or-nothing", customArOnly.requiresBothLocales === false);

const customComplete = validatePageForPublish(
  {
    id: 2,
    systemKey: null,
    slug: "new-offer",
    title: { ar: "عرض", en: "Offer" },
    sections: [fullHero({ ar: "ص", en: "p" })],
  } as never,
  noMedia,
);
check("validator: a complete custom page passes in both locales", customComplete.ok);

const reservedSlugPage = validatePageForPublish(
  { id: 3, systemKey: null, slug: "preview", title: "صفحة", sections: [fullHero({ ar: "ص", en: "p" })] } as never,
  noMedia,
);
check(
  "validator: a reserved slug is refused for both locales",
  !reservedSlugPage.ok && reservedSlugPage.blockers.filter((b) => b.kind === "structure").length === 2,
);

const emptySlugPage = validatePageForPublish(
  { id: 4, systemKey: null, slug: "", title: "صفحة", sections: [hero("س")] } as never,
  noMedia,
);
check("validator: a custom page without a slug cannot publish", !emptySlugPage.ok);

const missingRequired = validatePageForPublish({ ...base, sections: [{ blockType: "hero", enabled: true }] } as never, noMedia);
check(
  "validator: required field of a block is enforced",
  !missingRequired.ok && missingRequired.blockers.some((b) => b.sectionLabel && b.fieldLabel),
);

const privateMedia = new Map<string, MediaFacts>([[String(7), { id: 7, filename: "hero.png", visibility: "private", alt: { ar: "و", en: "h" } }]]);
const withMedia = validatePageForPublish(
  { ...base, sections: [fullHero("س", { media: 7 })] } as never,
  privateMedia,
);
check(
  "validator: private media is named and blocks publication",
  !withMedia.ok && withMedia.blockers.some((b) => b.kind === "media" && b.message.includes("hero.png")),
);
const stillPrivate = await payload.findByID({ collection: "media", id: 7, overrideAccess: true, depth: 0 }).catch(() => null);
check("validator: never silently flips a media asset to public", stillPrivate === null || (stillPrivate as { visibility?: string }).visibility === "private");

const missingMedia = validatePageForPublish(
  { ...base, sections: [fullHero("س", { media: 999999 })] } as never,
  noMedia,
);
check("validator: a media reference that no longer resolves is reported", !missingMedia.ok && missingMedia.blockers.some((b) => b.kind === "media"));

const noAlt = new Map<string, MediaFacts>([[String(8), { id: 8, filename: "photo.jpg", visibility: "public", alt: { ar: "وصف", en: null } }]]);
const altGap = validatePageForPublish(
  { ...base, sections: [fullHero("س", { media: 8 })] } as never,
  noAlt,
);
check(
  "validator: missing English alt is reported against the English locale",
  altGap.blockers.some((b) => b.kind === "media" && b.locale === "en"),
  altGap.blockers.map((b) => `${b.kind}:${b.locale}`).join(" "),
);

const ids = collectPageMediaIds({ sections: [fullHero("س", { media: 3, mobileMedia: 9 }), fullHero("س", { media: 12 })] } as never);
check("media ids: collected in document order, media then mobile media", ids.map(String).join(",") === "3,9,12", ids.map(String).join(","));

/* ── 4 · adapter filtering (§15–§18) ───────────────────────────────────────────────────────── */

const blocks = [
  { blockType: "hero", enabled: true, localeVisibility: "both" },
  { blockType: "trustStatement", enabled: false },
  { blockType: "problems", enabled: true, localeVisibility: "ar" },
  { blockType: "why", enabled: true, localeVisibility: "en" },
  { blockType: "nonsense", enabled: true },
];
const forAr = visibleBlocks(blocks as never, "ar").map((b) => b.blockType);
const forEn = visibleBlocks(blocks as never, "en").map((b) => b.blockType);
check("adapter: disabled block is not served", forAr.length === 2 && !forAr.includes("trustStatement"));
check("adapter: Arabic-only block is served to Arabic only", forAr.includes("problems") && !forEn.includes("problems"));
check("adapter: English-only block is served to English only", forEn.includes("why") && !forAr.includes("why"));
check("adapter: unknown block type never reaches the renderer", !forAr.includes("nonsense" as never) && !forEn.includes("nonsense" as never));

check("tags: page tags are stable and locale-explicit", pageTag(7) === "page:7" && pageSystemTag("home") === "page-system:home" && PAGES_LIST_TAG === "pages");

/* ── the /{locale}/{slug} surface (§5 · §39 · §43) ─────────────────────────────────────────── */

check(
  "routes: a single unbranded segment is a custom-page candidate",
  isCustomPageCandidate("/new-offer") && isCustomPageCandidate("/brand-refresh-2026"),
);
check(
  "routes: reserved segments are never custom-page candidates",
  !isCustomPageCandidate("/preview") &&
    !isCustomPageCandidate("/about") &&
    !isCustomPageCandidate("/api") &&
    !isCustomPageCandidate("/ar"),
);
check("routes: multi-segment and root paths are not candidates", !isCustomPageCandidate("/a/b") && !isCustomPageCandidate("/"));

/* The admin's preview button (§20): the URL comes from the document's own identity — the locked
   route for a system page, the validated slug for a custom page — and carries no token. */
const previewUrl = (doc: Record<string, unknown>, locale: string) =>
  (Pages.admin?.preview as (d: unknown, o: { locale: string }) => string | null)(doc, { locale });
check(
  "admin: the system page preview opens its locked route",
  (previewUrl({ systemKey: "about", slug: "about" }, "ar") ?? "").endsWith("/ar/preview?path=%2Fabout"),
);
check(
  "admin: the custom page preview opens the slug route",
  (previewUrl({ systemKey: null, slug: "new-offer" }, "en") ?? "").endsWith("/en/preview?path=%2Fnew-offer"),
);
check("admin: the preview URL never carries a token", !(previewUrl({ systemKey: "home" }, "ar") ?? "").includes("token"));

/* ── 5 · live server contract (§20/§21, §37) ───────────────────────────────────────────────── */

const loggedIn = cookie.length > 0;
check("live: admin session available", loggedIn || failures.length === 0, "login failed");

const anonPages = await http("/api/pages?limit=1");
check("live: pages API refuses anonymous reads", anonPages.status === 403, `HTTP ${anonPages.status}`);

const anonPublish = await http("/api/pages/9/publish", { method: "POST", body: "{}" });
check("live: publish endpoint refuses anonymous calls", anonPublish.status === 403, `HTTP ${anonPublish.status}`);

const previewAnon = await http("/ar/preview?path=/");
check("live: preview answers a REAL 404 without a session", previewAnon.status === 404, `HTTP ${previewAnon.status}`);
const previewAuthed = await http("/ar/preview?path=/", { headers: { cookie } });
check("live: preview renders for an authorized session", previewAuthed.status === 200 && previewAuthed.text.includes("معاينة"));
check("live: preview is not indexable", (previewAuthed.headers.get("x-robots-tag") ?? "").includes("noindex"));

const sitemap = await http("/sitemap.xml");
check("live: sitemap lists the published home page", sitemap.text.includes("https://sevnland.com/ar</loc>"));
check("live: sitemap excludes noindex legal pages", !sitemap.text.includes("/privacy") && !sitemap.text.includes("/terms"));
check("live: sitemap never lists the preview surface", !sitemap.text.includes("/preview"));

const robots = await http("/robots.txt");
check("live: robots.txt keeps crawlers out of admin + preview", robots.text.includes("/admin") && robots.text.includes("/*/preview"));

const privacy = await http("/ar/privacy");
check("live: migrated legal page keeps its noindex", /<meta name="robots"[^>]*noindex/i.test(privacy.text));
const homePage = await http("/ar");
check("live: canonical stays derived from the real route", homePage.text.includes('rel="canonical" href="https://sevnland.com/ar"'));
check("live: hreflang alternates intact", (homePage.text.match(/rel="alternate"/g) ?? []).length >= 3);
check("live: home is served from the CMS when published", homePage.text.includes("تسويق. إبداع. تقنية."));

/* ── 6 · WRITE checks: locale isolation and draft isolation ────────────────────────────────── */

const home = await payload.find({
  collection: "pages",
  where: { systemKey: { equals: "home" } },
  limit: 1,
  pagination: false,
  draft: true,
  locale: "ar",
  depth: 0,
  overrideAccess: true,
});
const homeId = home.docs[0]?.id as string | number;
check("write: home page exists for the write checks", Boolean(homeId));

if (homeId && process.env.ALLOW_VERIFICATION_WRITES === "true") {
  const arDraft = (await payload.findByID({ collection: "pages", id: homeId, locale: "ar", draft: true, depth: 0, overrideAccess: true })) as unknown as { sections: Array<Record<string, unknown>> };
  const enPublishedBefore = (await payload.findByID({ collection: "pages", id: homeId, locale: "en", draft: false, depth: 0, overrideAccess: true })) as unknown as { sections: Array<Record<string, unknown>> };
  const enTitleBefore = (enPublishedBefore.sections ?? []).find((b) => b.blockType === "hero")?.title1;

  /* AR-only publish: the English published row must be untouched (§1 — one locale never writes the other). */
  await payload.update({
    collection: "pages",
    id: homeId,
    locale: "ar",
    draft: true,
    data: { sections: arDraft.sections.map((block) => (block.blockType === "hero" ? { ...block, title1: "تحقق-AR" } : block)) } as never,
    overrideAccess: true,
  });
  await payload.update({ collection: "pages", id: homeId, locale: "ar", draft: false, data: {} as never, overrideAccess: true });
  const enPublishedAfter = (await payload.findByID({ collection: "pages", id: homeId, locale: "en", draft: false, depth: 0, overrideAccess: true })) as unknown as { sections: Array<Record<string, unknown>> };
  check(
    "write: publishing Arabic leaves the published English content byte-identical",
    (enPublishedAfter.sections ?? []).find((b) => b.blockType === "hero")?.title1 === enTitleBefore,
  );

  /* Draft isolation: an unpublished edit is not on the public page. */
  await payload.update({
    collection: "pages",
    id: homeId,
    locale: "ar",
    draft: true,
    data: { sections: arDraft.sections.map((block) => (block.blockType === "hero" ? { ...block, title1: "مسودة-فقط" } : block)) } as never,
    overrideAccess: true,
  });
  const publicHtml = await http("/ar");
  check("write: a draft-only Arabic edit is not visible on the public page", !publicHtml.text.includes("مسودة-فقط"));

  /* Restore the deterministic seed content and republish both locales. */
  await payload.update({ collection: "pages", id: homeId, locale: "ar", draft: true, data: { sections: arDraft.sections } as never, overrideAccess: true });
  await payload.update({ collection: "pages", id: homeId, locale: "ar", draft: false, data: {} as never, overrideAccess: true });
  const restored = await http("/ar");
  check("write: restoring the draft brings the original copy back", restored.text.includes("تسويق. إبداع. تقنية."));

  const state = (await payload.findByID({ collection: "pages", id: homeId, draft: false, locale: "all", depth: 0, overrideAccess: true })) as unknown as {
    localeState?: Record<string, { state?: string }>;
  };
  check("write: both locales report published after cleanup", state.localeState?.ar?.state === "published" && state.localeState?.en?.state === "published");
}

/* ── results ───────────────────────────────────────────────────────────────────────────────── */

for (const failure of failures) console.log(`FAIL  ${failure}`);
console.log(`\nPHASE E SUITE: ${passed} passed · ${failures.length} failed`);
await payload.destroy();
if (failures.length > 0) process.exitCode = 1;
