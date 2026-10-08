/**
 * THE PAGE ADAPTER — the only door between the CMS and the public site (§5, §44, §83).
 *
 * Public components never import Payload. They receive typed, locale-resolved view models, and the
 * adapter is the single place that decides:
 *
 *   · WHICH document is authoritative — a system page's CMS document is served only when its own
 *     locale is `published`; otherwise `null` is returned and the caller keeps its static content
 *     (§44: the static baseline stays until Phase E is accepted and proven equivalent).
 *   · WHICH locale is read — always explicit, never a locale-less read (§1).
 *   · WHICH blocks appear — `enabled`, `localeVisibility`, and array order come straight from the
 *     document, so the admin's ordering and visibility controls are exactly what the visitor sees.
 *
 * Reads are cached with the same discipline as the Phase C globals: `'use cache'` + one page tag +
 * the coarse list tag, so any write to a page expires precisely that page and nothing else.
 */
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import type { AppLocale } from "@/i18n/routing";
import { PAGES_LIST_TAG, pageSystemTag, pageTag } from "@/lib/content/tags";
import { isBlockKey, type BlockKey } from "@/lib/blocks/types";
import { pageRefId } from "./links";
import type { Where } from "payload";
import { isSystemPageKey, SYSTEM_PAGES, SYSTEM_PAGE_KEYS, type SystemPageKey } from "./system-pages";
import { RESERVED_SEGMENTS } from "./slug";

export type BlockData = {
  blockType: BlockKey;
  id?: string | null;
  label?: string | null;
  variant?: string | null;
  enabled?: boolean | null;
  localeVisibility?: "both" | "ar" | "en" | null;
  [key: string]: unknown;
};

export type PublicPage = {
  source: "cms";
  id: string | number;
  systemKey: SystemPageKey | null;
  /** Public path for this page (locale-independent). */
  path: string;
  slug: string | null;
  title: string;
  blocks: BlockData[];
  seo: {
    title: string | null;
    description: string | null;
    ogImage: unknown;
    noindex: boolean;
  };
  /** id → public path, for CTA blocks that point at other pages. */
  pagePaths: Map<string, string>;
  publishedAt: string | null;
};

type RawPage = {
  id: string | number;
  systemKey?: string | null;
  slug?: string | null;
  title?: unknown;
  sections?: unknown;
  seo?: { title?: unknown; description?: unknown; ogImage?: unknown; noindex?: boolean | null } | null;
  localeState?: Record<string, { state?: string | null; at?: string | null } | undefined> | null;
};

const asText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value;
  return null;
};

/** Blocks that survive this locale: enabled and allowed for the language. */
export function visibleBlocks(sections: unknown, locale: AppLocale): BlockData[] {
  if (!Array.isArray(sections)) return [];
  return (sections as BlockData[]).filter((block) => {
    if (!block || !isBlockKey(block.blockType)) return false;
    if (block.enabled === false) return false;
    const visibility = block.localeVisibility ?? "both";
    if (visibility !== "both" && visibility !== locale) return false;
    return true;
  });
}

/** Custom pages referenced by CTA blocks → their published path, for THIS locale. */
async function resolvePagePaths(
  payload: Awaited<ReturnType<typeof getPayload>>,
  blocks: BlockData[],
  locale: AppLocale,
): Promise<Map<string, string>> {
  const ids = new Set<string>();
  for (const block of blocks) {
    for (const key of ["primary", "secondary", "cta"] as const) {
      const cta = block[key];
      if (cta && typeof cta === "object") {
        const id = pageRefId((cta as { page?: unknown }).page);
        if (id) ids.add(id);
      }
    }
  }
  const map = new Map<string, string>();
  if (ids.size === 0) return map;

  const found = await payload.find({
    collection: "pages",
    where: { id: { in: [...ids] }, "localeState.state": { equals: "published" } },
    limit: ids.size,
    pagination: false,
    depth: 0,
    locale,
    draft: false,
    overrideAccess: true,
  });
  for (const doc of found.docs as RawPage[]) {
    if (doc.systemKey && isSystemPageKey(doc.systemKey)) {
      map.set(String(doc.id), SYSTEM_PAGES[doc.systemKey].path);
    } else if (doc.slug) {
      map.set(String(doc.id), `/${doc.slug}`);
    }
  }
  return map;
}

async function loadBySystemKey(systemKey: SystemPageKey, locale: AppLocale) {
  "use cache";
  cacheTag(pageSystemTag(systemKey), PAGES_LIST_TAG);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "pages",
    where: { systemKey: { equals: systemKey } },
    limit: 1,
    pagination: false,
    depth: 1,
    locale,
    draft: false,
    overrideAccess: true,
  });
  return (found.docs[0] ?? null) as unknown as RawPage | null;
}

async function loadBySlug(slug: string, locale: AppLocale) {
  "use cache";
  cacheTag(PAGES_LIST_TAG);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug }, systemKey: { exists: false } },
    limit: 1,
    pagination: false,
    depth: 1,
    locale,
    draft: false,
    overrideAccess: true,
  });
  return (found.docs[0] ?? null) as unknown as RawPage | null;
}

function toPublicPage(doc: RawPage | null, locale: AppLocale, payload: Awaited<ReturnType<typeof getPayload>>) {
  if (!doc) return null;
  const state = doc.localeState?.[locale];
  if (state?.state !== "published") return null;

  const blocks = visibleBlocks(doc.sections, locale);
  const systemKey = doc.systemKey && isSystemPageKey(doc.systemKey) ? doc.systemKey : null;

  return {
    systemKey,
    doc,
    blocks,
    payload,
  };
}

/**
 * Reads a published system page for one locale. Returns `null` when the page is not published in
 * that language — the caller then serves its static baseline, so an unpublished locale is never a
 * broken page. Never falls back to the other language (§15–§18).
 */
export async function getPublishedSystemPage(
  systemKey: SystemPageKey,
  locale: AppLocale,
): Promise<PublicPage | null> {
  const payload = await getPayload({ config });
  const doc = await loadBySystemKey(systemKey, locale);
  const ready = toPublicPage(doc, locale, payload);
  if (!ready) return null;

  const pagePaths = await resolvePagePaths(payload, ready.blocks, locale);
  return {
    source: "cms",
    id: ready.doc.id,
    systemKey,
    path: SYSTEM_PAGES[systemKey].path,
    slug: ready.doc.slug ?? null,
    title: asText(ready.doc.title) ?? SYSTEM_PAGES[systemKey].label.ar,
    blocks: ready.blocks,
    seo: {
      title: asText(ready.doc.seo?.title),
      description: asText(ready.doc.seo?.description),
      ogImage: ready.doc.seo?.ogImage ?? null,
      noindex: Boolean(ready.doc.seo?.noindex),
    },
    pagePaths,
    publishedAt: ready.doc.localeState?.[locale]?.at ?? null,
  };
}

/** Reads a published custom page by slug (used by the `/[slug]` route). */
export async function getPublishedCustomPage(slug: string, locale: AppLocale): Promise<PublicPage | null> {
  const payload = await getPayload({ config });
  const doc = await loadBySlug(slug, locale);
  const ready = toPublicPage(doc, locale, payload);
  if (!ready) return null;

  const pagePaths = await resolvePagePaths(payload, ready.blocks, locale);
  return {
    source: "cms",
    id: ready.doc.id,
    systemKey: null,
    path: `/${ready.doc.slug}`,
    slug: ready.doc.slug ?? slug,
    title: asText(ready.doc.title) ?? slug,
    blocks: ready.blocks,
    seo: {
      title: asText(ready.doc.seo?.title),
      description: asText(ready.doc.seo?.description),
      ogImage: ready.doc.seo?.ogImage ?? null,
      noindex: Boolean(ready.doc.seo?.noindex),
    },
    pagePaths,
    publishedAt: ready.doc.localeState?.[locale]?.at ?? null,
  };
}

/** Re-export so callers can build a tag list without importing the payload adapter directly. */
export { pageTag };

/* ── preview (§20/§21) ────────────────────────────────────────────────────────────────────────
 *
 * The preview read is deliberately the ONLY reader that ignores `localeState` and reads drafts.
 * It is never cached (`'use cache'` is absent), it always names its locale, and it is reachable
 * only through `/[locale]/preview`, which checks the admin session before calling it — so a draft
 * can never surface on a public route, in a cache tag, or in the sitemap.
 */

export type PreviewPage = PublicPage & {
  preview: true;
  /** Per-locale publication state, shown in the preview bar so the editor knows what is live. */
  localeState: Record<string, { state?: string | null; at?: string | null } | undefined>;
};

async function loadDraft(
  payload: Awaited<ReturnType<typeof getPayload>>,
  where: Where,
  locale: AppLocale,
): Promise<RawPage | null> {
  const found = await payload.find({
    collection: "pages",
    where,
    limit: 1,
    pagination: false,
    depth: 1,
    locale,
    draft: true,
    overrideAccess: true,
  });
  return (found.docs[0] ?? null) as unknown as RawPage | null;
}

/** `/` → home, `/about` → its system key, `/anything-else` → a custom page by slug. */
export function previewTargetFor(path: string): { systemKey: SystemPageKey } | { slug: string } | null {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (clean === "") return { systemKey: "home" };
  const systemKey = SYSTEM_PAGE_KEYS.find((key) => SYSTEM_PAGES[key].path === `/${clean}`);
  if (systemKey) return { systemKey };
  /* One segment only — the same shape the public routes can serve. */
  if (clean.includes("/") || RESERVED_SEGMENTS.includes(clean.toLowerCase())) return null;
  return { slug: clean };
}

/**
 * Reads the page as the EDITOR sees it: newest draft, this locale, no publication gate.
 * Returns `null` when no page exists for the target, so the caller can answer 404.
 */
export async function getPreviewPage(path: string, locale: AppLocale): Promise<PreviewPage | null> {
  const target = previewTargetFor(path);
  if (!target) return null;

  const payload = await getPayload({ config });
  const doc = await loadDraft(
    payload,
    "systemKey" in target
      ? { systemKey: { equals: target.systemKey } }
      : { slug: { equals: target.slug }, systemKey: { exists: false } },
    locale,
  );
  if (!doc) return null;

  const blocks = visibleBlocks(doc.sections, locale);
  const systemKey = doc.systemKey && isSystemPageKey(doc.systemKey) ? doc.systemKey : null;
  const pagePaths = await resolvePagePaths(payload, blocks, locale);

  return {
    source: "cms",
    preview: true,
    id: doc.id,
    systemKey,
    path: systemKey ? SYSTEM_PAGES[systemKey].path : `/${doc.slug ?? ("slug" in target ? target.slug : "")}`,
    slug: doc.slug ?? null,
    title: asText(doc.title) ?? (systemKey ? SYSTEM_PAGES[systemKey].label.ar : ""),
    blocks,
    seo: {
      title: asText(doc.seo?.title),
      description: asText(doc.seo?.description),
      ogImage: doc.seo?.ogImage ?? null,
      noindex: Boolean(doc.seo?.noindex),
    },
    pagePaths,
    publishedAt: doc.localeState?.[locale]?.at ?? null,
    localeState: doc.localeState ?? {},
  };
}

/* ── sitemap input (§37) ─────────────────────────────────────────────────────────────────────── */

export type PagePublication = {
  systemKey: string | null;
  slug: string | null;
  path: string;
  publishedIn: { ar: boolean; en: boolean };
  noindex: boolean;
};

/**
 * Publication facts for every page, per locale, cached under the pages tag so an editor's publish
 * expires the sitemap too. Reads one locale at a time on purpose (§1): a locale-less read would
 * report the wrong language's values.
 */
export async function listPagePublications(): Promise<PagePublication[]> {
  "use cache";
  cacheTag(PAGES_LIST_TAG);
  cacheLife("minutes");
  const payload = await getPayload({ config });

  const [ar, en] = await Promise.all(
    (["ar", "en"] as const).map((locale) =>
      payload.find({
        collection: "pages",
        limit: 0,
        pagination: false,
        depth: 0,
        locale,
        draft: false,
        overrideAccess: true,
      }),
    ),
  );

  const byId = new Map<string, PagePublication>();
  for (const doc of ar.docs as unknown as RawPage[]) {
    byId.set(String(doc.id), {
      systemKey: doc.systemKey ?? null,
      slug: doc.slug ?? null,
      path: doc.systemKey && isSystemPageKey(doc.systemKey) ? SYSTEM_PAGES[doc.systemKey].path : `/${doc.slug ?? ""}`,
      publishedIn: { ar: doc.localeState?.ar?.state === "published", en: false },
      noindex: Boolean(doc.seo?.noindex),
    });
  }
  for (const doc of en.docs as unknown as RawPage[]) {
    const entry = byId.get(String(doc.id));
    if (entry) entry.publishedIn.en = doc.localeState?.en?.state === "published";
  }
  return [...byId.values()];
}
