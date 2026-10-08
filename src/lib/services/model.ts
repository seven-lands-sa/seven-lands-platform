/**
 * SERVICES — the domain model for the seven capabilities (Phase F, §10–§12).
 *
 * WHAT THIS COLLECTION IS (and what it is not)
 * The seven capabilities already exist as code-owned content (`src/content/services.ts`) and are
 * published at `/services/{slug}`. Phase F moves their EDITORIAL layer into the CMS — the copy, the
 * scope list, the FAQ, the opener message, the icon choice, an optional cover image and the SEO
 * contract — while the ROUTE stays derived from an immutable `landKey`, exactly the way system pages
 * work. An editor can therefore reword a capability, reorder the seven cards or hide one from the
 * list; they cannot invent a route, rename a capability's identity, or change the design.
 *
 * AUTHORITY HIERARCHY (one documented order, §55)
 *   1. a service published for that locale in the CMS wins;
 *   2. otherwise the shipped static content for that locale is served unchanged.
 * No locale ever falls back to the other language, and the shipped content is never deleted while it
 * is still the fallback — that is what keeps an unpublished locale a working page rather than a 404.
 */
import { lands, type LandSlug } from "@/content/services";

export type ServiceLocale = "ar" | "en";
export const SERVICE_LOCALES: readonly ServiceLocale[] = ["ar", "en"];

/** The immutable identity of a capability: it decides the public route and can never be edited. */
export const SERVICE_KEYS = lands.map((land) => land.slug) as LandSlug[];

export const isServiceKey = (value: unknown): value is LandSlug =>
  typeof value === "string" && (SERVICE_KEYS as string[]).includes(value);

/** Public path of a capability — derived, never stored, never editable. */
export const servicePath = (key: string): string => `/services/${key}`;

/**
 * The seven glyph ids the design system actually ships (see `components/brand/LandGlyphs.tsx`).
 * Kept as a registry, never free text: an editor picks from the approved set, exactly as the brief
 * requires. The names are read from the shipped content, not guessed.
 */
export const SERVICE_GLYPHS: readonly string[] = [
  "strategy",
  "branding",
  "content",
  "social",
  "performance",
  "web",
  "technology",
];

/** The shipped number of each capability (`01`…`07`), used as the default display order. */
export const serviceNumber = (key: string): string => {
  const index = SERVICE_KEYS.indexOf(key as LandSlug);
  return String(index + 1).padStart(2, "0");
};

/** Fields an editor must fill, per locale, before that locale may publish (§16–§18). */
export const SERVICE_REQUIRED_FIELDS = ["title", "promise", "intro"] as const;

/** Fields whose labels appear in blocker messages, so a refusal always names the field in Arabic. */
export const SERVICE_FIELD_LABELS: Record<string, string> = {
  title: "اسم المجال",
  short: "الاسم المختصر",
  promise: "الوعد/المخرَج",
  intro: "المقدمة",
  wa: "رسالة واتساب",
};
