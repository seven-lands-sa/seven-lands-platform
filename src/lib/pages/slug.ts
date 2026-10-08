/**
 * Slug rules for custom pages (§37, §39, §62).
 *
 * A slug is the public path segment. It is validated here, once, and consumed by the collection
 * hooks, the publication validator and the tests — never by a second ad-hoc regex elsewhere.
 *
 * RESERVED_SEGMENTS protects every route the application already serves (locale prefixes, API,
 * admin, Next internals, files). A custom page may never collide with one of them.
 */

/** First path segment reserved by the framework, the admin panel, or an existing route. */
export const RESERVED_SEGMENTS: readonly string[] = [
  // next-intl locale prefixes
  "ar",
  "en",
  // framework + admin
  "api",
  "admin",
  // Owner-only draft preview + the proxy's 404 rewrite target: neither may ever be a page slug.
  "preview",
  "not-found",
  "next",
  "_next",
  "static",
  "media",
  "files",
  "og",
  "sitemap.xml",
  "robots.txt",
  "manifest.webmanifest",
  "favicon.ico",
  // existing public routes (system pages + hub shells that already exist)
  "about",
  "contact",
  "start-a-project",
  "privacy",
  "terms",
  "services",
  "work",
  "insights",
];

export type SlugCheck = { ok: true; slug: string } | { ok: false; reason: { ar: string; en: string } };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(input: unknown): SlugCheck {
  const raw = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!raw) {
    return { ok: false, reason: { ar: "الرابط مطلوب.", en: "A slug is required." } };
  }
  if (raw.length < 2 || raw.length > 64) {
    return { ok: false, reason: { ar: "طول الرابط يجب أن يكون بين 2 و64 حرفًا.", en: "Slug length must be between 2 and 64 characters." } };
  }
  if (!SLUG_PATTERN.test(raw)) {
    return {
      ok: false,
      reason: {
        ar: "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطة (-) فقط، بدون مسافات أو رموز.",
        en: "Use lowercase Latin letters, digits and hyphens (-) only — no spaces or symbols.",
      },
    };
  }
  if (RESERVED_SEGMENTS.includes(raw)) {
    return {
      ok: false,
      reason: { ar: `«${raw}» محجوز لمسار موجود في الموقع. اختر رابطًا آخر.`, en: `“${raw}” is reserved for an existing route. Choose another slug.` },
    };
  }
  return { ok: true, slug: raw };
}

/** Public path of a page document, locale-independent (`/brand-refresh`). */
export function pagePath(slug: string): string {
  return `/${slug}`;
}
