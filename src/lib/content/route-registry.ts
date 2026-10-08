import { lands } from "@/content/services";

/**
 * Internal route registry — the safe answer to "أدخل الرابط" (§19).
 *
 * Admins pick a known destination instead of typing a URL, so the public site never receives a
 * hand-written path that does not exist, and the proxy's 404 table stays authoritative.
 *
 * MIGRATION NOTE (Pages CMS): when `pages` exists, this registry keeps its shape but the *source*
 * changes — an internal link becomes a relationship to a page document, and `path` is read from
 * that document. Everything downstream (`LinkTarget`, `resolveLink`, the admin select) stays the
 * same, so no editor will have to re-pick links when the CMS lands.
 */

export type RouteLabel = { ar: string; en: string };

export type InternalRoute = {
  /** Stable key stored in the database. Never a URL. */
  key: string;
  /** Path without the locale prefix, exactly as `next-intl`'s Link expects. */
  path: string;
  label: RouteLabel;
  /** Marks routes that are not part of the main navigation but are legitimate targets. */
  kind: "page" | "legal" | "capability";
};

const PAGE_ROUTES: InternalRoute[] = [
  { key: "home", path: "/", label: { ar: "الرئيسية", en: "Home" }, kind: "page" },
  { key: "services", path: "/services", label: { ar: "خدماتنا", en: "Services" }, kind: "page" },
  { key: "work", path: "/work", label: { ar: "أعمالنا", en: "Work" }, kind: "page" },
  { key: "about", path: "/about", label: { ar: "من نحن", en: "About" }, kind: "page" },
  { key: "insights", path: "/insights", label: { ar: "رؤى", en: "Insights" }, kind: "page" },
  { key: "contact", path: "/contact", label: { ar: "تواصل", en: "Contact" }, kind: "page" },
  {
    key: "start-a-project",
    path: "/start-a-project",
    label: { ar: "ابدأ مشروعك", en: "Start a project" },
    kind: "page",
  },
];

const LEGAL_ROUTES: InternalRoute[] = [
  {
    key: "privacy",
    path: "/privacy",
    label: { ar: "سياسة الخصوصية", en: "Privacy policy" },
    kind: "legal",
  },
  {
    key: "terms",
    path: "/terms",
    label: { ar: "الشروط والأحكام", en: "Terms & conditions" },
    kind: "legal",
  },
];

/**
 * The seven capability pages. They are routes today and will become relationships to `services`
 * documents later; either way the admin keeps choosing "مجالات العمل ← الاستراتيجية" rather than
 * pasting `/services/strategy-business-growth`.
 *
 * NOTE (Defect D1 / Amendment A):
 * Keys use `capability_${land.slug}` instead of colons (`capability:...`) because GraphQL enum identifiers
 * strictly require `[_a-zA-Z0-9]`. Stored meaning and route identity `/services/${land.slug}` are 100%
 * preserved, and `internalRoute()` transparently resolves legacy colon keys as well.
 */
const CAPABILITY_ROUTES: InternalRoute[] = lands.map((land) => ({
  key: `capability_${land.slug}`,
  path: `/services/${land.slug}`,
  label: { ar: land.copy.ar.short, en: land.copy.en.short },
  kind: "capability" as const,
}));

export const INTERNAL_ROUTES: readonly InternalRoute[] = [
  ...PAGE_ROUTES,
  ...LEGAL_ROUTES,
  ...CAPABILITY_ROUTES,
];

const BY_KEY = new Map(INTERNAL_ROUTES.map((route) => [route.key, route]));

export function internalRoute(key: string | null | undefined): InternalRoute | null {
  if (!key) return null;
  const direct = BY_KEY.get(key);
  if (direct) return direct;
  // Backward compatibility for legacy colon keys: capability:slug -> capability_slug
  if (key.startsWith("capability:")) {
    const normalized = key.replace("capability:", "capability_");
    return BY_KEY.get(normalized) ?? null;
  }
  return null;
}

export function routePath(key: string | null | undefined): string | null {
  return internalRoute(key)?.path ?? null;
}

/** Reverse lookup, used by the seeder and by future page→route migrations. */
export function routeKeyForPath(path: string | null | undefined): string | null {
  if (!path) return null;
  return INTERNAL_ROUTES.find((route) => route.path === path)?.key ?? null;
}
