/**
 * The typed CTA/link contract (§28) — one validator, one resolver, shared by the collection hook,
 * the publication validator and the renderer.
 *
 * Destinations are typed, never free-form paths:
 *   internal → either a known route key (`route-registry`) or a relationship to a custom page
 *   external → https only
 *   whatsapp / phone / email → rendered from the Phase C globals, so no editor pastes a second number
 */
import { INTERNAL_ROUTES, internalRoute } from "@/lib/content/route-registry";

export type CtaKind = "internal" | "external" | "whatsapp" | "phone" | "email";

export type CtaValue = {
  kind?: CtaKind | null;
  routeKey?: string | null;
  page?: unknown;
  url?: string | null;
  newTab?: boolean | null;
  label?: unknown;
} | null;

const UNSAFE_PROTOCOL = /^\s*(javascript|data|vbscript|file|blob):/i;

/** Returns an Arabic reason when the stored CTA cannot be rendered safely, otherwise null. */
export function validateCta(cta: CtaValue, where: string): string | null {
  if (!cta || typeof cta !== "object") {
    /* An empty CTA is a completeness problem, not a safety problem — the publish validator owns it. */
    return null;
  }
  const kind = cta.kind ?? "internal";
  if (kind === "external") {
    const url = (cta.url ?? "").trim();
    if (!url) return null;
    if (UNSAFE_PROTOCOL.test(url)) {
      return `${where}: ${url.slice(0, 40)} — روابط javascript/data محجوبة.`;
    }
    if (!/^https:\/\//i.test(url)) {
      return `${where}: الرابط الخارجي يجب أن يبدأ بـ https:// — تم رفض «${url.slice(0, 40)}».`;
    }
    return null;
  }
  if (cta.url && UNSAFE_PROTOCOL.test(cta.url)) {
    return `${where}: صيغة الرابط غير مسموحة.`;
  }
  if (kind === "internal") {
    const hasPage = Boolean(cta.page);
    const hasRoute = Boolean(cta.routeKey && internalRoute(String(cta.routeKey)));
    if (!hasPage && !hasRoute) return null;
  }
  return null;
}

export type ResolvedCta = { href: string; external: boolean; newTab: boolean; kind: CtaKind };

/**
 * Resolves a stored CTA for rendering.
 *
 * `pagePaths` maps a page id to its public path — built once per render by the adapter, so a block
 * never has to fetch anything. WhatsApp/phone/email are resolved from the live globals instead of
 * being duplicated in page content (§29 — one source for contact data).
 */
export function resolveCta(
  cta: CtaValue,
  context: { pagePaths: Map<string, string>; whatsappHref?: string | null; phoneHref?: string | null; emailHref?: string | null },
): ResolvedCta | null {
  if (!cta || typeof cta !== "object") return null;
  const kind = (cta.kind ?? "internal") as CtaKind;

  if (kind === "whatsapp") return context.whatsappHref ? { href: context.whatsappHref, external: true, newTab: true, kind } : null;
  if (kind === "phone") return context.phoneHref ? { href: context.phoneHref, external: false, newTab: false, kind } : null;
  if (kind === "email") return context.emailHref ? { href: context.emailHref, external: false, newTab: false, kind } : null;

  if (kind === "external") {
    const url = (cta.url ?? "").trim();
    if (!url || UNSAFE_PROTOCOL.test(url) || !/^https:\/\//i.test(url)) return null;
    return { href: url, external: true, newTab: Boolean(cta.newTab), kind };
  }

  /* internal */
  const pageId = pageRefId(cta.page);
  if (pageId && context.pagePaths.has(pageId)) {
    return { href: context.pagePaths.get(pageId)!, external: false, newTab: false, kind: "internal" };
  }
  if (cta.routeKey) {
    const route = internalRoute(String(cta.routeKey));
    if (route) return { href: route.path, external: false, newTab: false, kind: "internal" };
  }
  return null;
}

/** Media-agnostic id getter for a relationship value (number, string, or populated doc). */
export function pageRefId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (typeof value === "object" && "id" in (value as Record<string, unknown>)) {
    const id = (value as { id?: string | number }).id;
    return id === undefined || id === null ? null : String(id);
  }
  return null;
}

/** Every known internal route key, for the schema select. */
export const INTERNAL_ROUTE_KEYS: readonly string[] = INTERNAL_ROUTES.map((route) => route.key);
