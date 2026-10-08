/**
 * THE SERVICE ADAPTER — the only door between the capability documents and the public site.
 *
 * AUTHORITY ORDER (one documented hierarchy, §55):
 *   1. a service document PUBLISHED for THIS locale in the CMS wins outright;
 *   2. otherwise the shipped static content for THIS locale is served unchanged.
 * There is never a cross-language fallback: an English visitor sees English content or the shipped
 * English baseline — never Arabic.
 *
 * The route is derived from the immutable key, so nothing an editor does inside the CMS can move,
 * rename or break an indexed `/services/{key}` URL. A capability that is not published is simply the
 * static page it has always been.
 *
 * Reads are cached with the Phase E discipline: `'use cache'` + the coarse list tag + one document
 * tag, so a write to one capability expires exactly that capability and the capability lists.
 */
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import { lands, scopeNote as staticScopeNote, type Land, type LandSlug } from "@/content/services";
import type { AppLocale } from "@/i18n/routing";
import { servicesTag, serviceTag } from "@/lib/content/tags";
import { SERVICE_KEYS, type ServiceLocale } from "./model";

export type ServiceProblem = { question: string; answer: string };
export type ServiceFaq = { q: string; a: string };

/** The locale-resolved view model every component consumes — identical for CMS and static content. */
export type ServiceView = {
  slug: LandSlug;
  number: string;
  glyph: string;
  title: string;
  short: string;
  promise: string;
  intro: string;
  wa: string;
  problems: ServiceProblem[];
  capabilities: string[];
  faqs: ServiceFaq[];
  scopeNote: string;
  /** Where this particular view came from, for the admin-facing reports and tests. */
  source: "cms" | "static";
  seo: {
    title: string | null;
    description: string | null;
    ogImage: unknown;
    noindex: boolean;
  };
};

type RawService = {
  id: string | number;
  landKey?: string | null;
  number?: string | null;
  order?: number | null;
  enabled?: boolean | null;
  glyph?: string | null;
  title?: unknown;
  short?: unknown;
  promise?: unknown;
  intro?: unknown;
  wa?: unknown;
  capabilities?: unknown;
  problems?: unknown;
  faqs?: unknown;
  scopeNote?: unknown;
  seo?: { title?: unknown; description?: unknown; ogImage?: unknown; noindex?: boolean | null } | null;
  localeState?: Record<string, { state?: string | null; at?: string | null } | undefined> | null;
};

const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value.trim() : null);

/** Rows of `{ question, answer }` / `{ q, a }` that are complete in this locale. */
const rows = <T extends Record<string, unknown>>(value: unknown, keys: [string, string]): T[] => {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const first = text(record[keys[0]]);
    const second = text(record[keys[1]]);
    if (first && second) out.push({ [keys[0]]: first, [keys[1]]: second } as unknown as T);
  }
  return out;
};

const strings = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    if (typeof row === "string") return row.trim();
    if (row && typeof row === "object") return text((row as { item?: unknown }).item) ?? "";
    return "";
  }).filter(Boolean);
};

/** The shipped static capability as a view model (the fallback, and the equivalence baseline). */
export function staticServiceView(slug: LandSlug, locale: ServiceLocale): ServiceView {
  const land = lands.find((entry) => entry.slug === slug) as Land;
  const copy = land.copy[locale];
  return {
    slug: land.slug,
    number: land.number,
    glyph: land.glyph,
    title: copy.title,
    short: copy.short,
    promise: copy.promise,
    intro: copy.intro,
    wa: copy.wa,
    problems: copy.problems.map((row) => ({ question: row.question, answer: row.answer })),
    capabilities: [...copy.capabilities],
    faqs: copy.faqs.map((row) => ({ q: row.q, a: row.a })),
    scopeNote: staticScopeNote[locale],
    source: "static",
    seo: { title: null, description: null, ogImage: null, noindex: false },
  };
}

/** Turns a stored document into the same view model — only when its own locale is published. */
function documentView(doc: RawService, locale: ServiceLocale): ServiceView | null {
  if (doc.localeState?.[locale]?.state !== "published") return null;
  const key = doc.landKey as LandSlug | undefined;
  if (!key || !(SERVICE_KEYS as string[]).includes(key)) return null;
  const baseline = staticServiceView(key, locale);
  return {
    slug: key,
    number: text(doc.number) ?? baseline.number,
    glyph: text(doc.glyph) ?? baseline.glyph,
    /* Every editorial field prefers the CMS value and falls back to the shipped baseline for that
       SAME locale — a field the editor left empty can never downgrade the page. */
    title: text(doc.title) ?? baseline.title,
    short: text(doc.short) ?? baseline.short,
    promise: text(doc.promise) ?? baseline.promise,
    intro: text(doc.intro) ?? baseline.intro,
    wa: text(doc.wa) ?? baseline.wa,
    problems: rows<ServiceProblem>(doc.problems, ["question", "answer"]).length
      ? rows<ServiceProblem>(doc.problems, ["question", "answer"])
      : baseline.problems,
    capabilities: strings(doc.capabilities).length ? strings(doc.capabilities) : baseline.capabilities,
    faqs: rows<ServiceFaq>(doc.faqs, ["q", "a"]).length ? rows<ServiceFaq>(doc.faqs, ["q", "a"]) : baseline.faqs,
    scopeNote: text(doc.scopeNote) ?? baseline.scopeNote,
    source: "cms",
    seo: {
      title: text(doc.seo?.title),
      description: text(doc.seo?.description),
      ogImage: doc.seo?.ogImage ?? null,
      noindex: Boolean(doc.seo?.noindex),
    },
  };
}

/** All capability documents published in this locale, keyed by their immutable key. */
async function loadPublishedServices(locale: ServiceLocale): Promise<RawService[]> {
  "use cache";
  cacheTag(servicesTag);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "services",
    where: { [`localeState.${locale}.state`]: { equals: "published" } },
    limit: 20,
    pagination: false,
    depth: 1,
    locale,
    draft: false,
    overrideAccess: true,
  });
  return found.docs as unknown as RawService[];
}

async function loadPublishedService(key: string, locale: ServiceLocale): Promise<RawService | null> {
  "use cache";
  cacheTag(servicesTag, serviceTag(key));
  cacheLife("minutes");
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "services",
    where: { landKey: { equals: key }, [`localeState.${locale}.state`]: { equals: "published" } },
    limit: 1,
    pagination: false,
    depth: 1,
    locale,
    draft: false,
    overrideAccess: true,
  });
  return (found.docs[0] ?? null) as unknown as RawService | null;
}

/**
 * One capability for one locale. Never returns null for a known key: the shipped content is the
 * published page's own baseline, so the route can only 404 for a key that does not exist.
 */
export async function getService(key: string, locale: AppLocale): Promise<ServiceView | null> {
  if (!(SERVICE_KEYS as string[]).includes(key)) return null;
  const slug = key as LandSlug;
  const doc = await loadPublishedService(key, locale as ServiceLocale);
  const fromCms = doc ? documentView(doc, locale as ServiceLocale) : null;
  return fromCms ?? staticServiceView(slug, locale as ServiceLocale);
}

/**
 * The seven capabilities in display order for one locale.
 *
 * A published document contributes its own order (`order`, then the shipped key order); the rest come
 * from the shipped content. This is what keeps the hub, the home grid and the sitemap in one order
 * without ever dropping a capability the site has always shown.
 */
export async function getServiceIndex(locale: AppLocale): Promise<ServiceView[]> {
  const published = await loadPublishedServices(locale as ServiceLocale);
  const byKey = new Map<string, RawService>();
  for (const doc of published) {
    if (typeof doc.landKey === "string" && (SERVICE_KEYS as string[]).includes(doc.landKey)) byKey.set(doc.landKey, doc);
  }

  const items = SERVICE_KEYS.map((key) => {
    const doc = byKey.get(key);
    const view = doc ? documentView(doc, locale as ServiceLocale) : null;
    const resolved = view ?? staticServiceView(key as LandSlug, locale as ServiceLocale);
    const order = typeof doc?.order === "number" ? doc.order : SERVICE_KEYS.indexOf(key) + 1;
    return { order, view: resolved };
  });

  return items
    .sort((a, b) => (a.order === b.order ? a.view.number.localeCompare(b.view.number) : a.order - b.order))
    .map((item) => item.view);
}

/**
 * Capability labels keyed by immutable slug — for the places that only need a NAME: related-work
 * filters, the "related capability" line under a problem, the 404 land list. One authority, no
 * second lookup table.
 */
export async function getServiceLabels(locale: AppLocale): Promise<Map<string, { title: string; short: string }>> {
  const all = await getServiceIndex(locale);
  return new Map(all.map((service) => [service.slug, { title: service.title, short: service.short }]));
}

/**
 * Related capabilities for a detail page: the other six, in the site's display order — the same
 * list, in the same order, that the page has always shown.
 */
export async function getOtherServices(key: string, locale: AppLocale): Promise<ServiceView[]> {
  const all = await getServiceIndex(locale);
  return all.filter((service) => service.slug !== key);
}
