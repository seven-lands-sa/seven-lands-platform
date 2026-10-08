/**
 * Cache tags — the contract between Payload writes and the public site's cached reads.
 *
 * One tag per global (and one per media document). Deliberately NOT a single
 * `revalidate-everything`: publishing a social account must not expire the navigation, and the
 * admin must be able to say precisely what changed.
 *
 * Writers (Payload hooks) call `invalidateTags(...)`; readers (`src/lib/content`) attach the tag
 * with `cacheTag(...)` inside a `'use cache'` scope. Phase A proved that
 * `revalidateTag(tag, { expire: 0 })` makes the NEXT request fresh, while the `'max'` form leaves
 * exactly one stale response — the immediate form is required for owner-visible edits.
 */

export const CACHE_TAGS = {
  siteSettings: "site-settings",
  contactSettings: "contact-settings",
  businessHours: "business-hours",
  socialAccounts: "social-accounts",
  navigation: "navigation",
  footer: "footer",
} as const;

export type CacheTag =
  | (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
  | `media:${string}`
  | `page:${string}`
  | `page-system:${string}`
  | "pages"
  | `service:${string}`
  | `project:${string}`
  | `insight:${string}`
  | "services"
  | "projects"
  | "insights";

/** Tag for one page document — invalidated by every write to that page. */
export const pageTag = (id: string | number) => `page:${id}` as const;

/** Tag for a system page identity (home/about/…) — survives a rebuild of the document. */
export const pageSystemTag = (key: string) => `page-system:${key}` as const;

/** Coarse list tag: adding/removing a custom page touches the sitemap and any page index. */
export const PAGES_LIST_TAG = "pages" as const;

/** Tag for one media document — used when a file's metadata or visibility changes. */
export const mediaTag = (id: string | number): CacheTag => `media:${id}`;

/* ── Phase F — domain content (§10–§18) ─────────────────────────────────────────────────────── */

/** One capability document. */
export const serviceTag = (id: string | number) => `service:${id}` as const;

/** The capability list and anything that renders it (hub page, home grid, sitemap). */
export const servicesTag = "services" as const;

/** One case study document. */
export const projectTag = (id: string | number) => `project:${id}` as const;

/** The work index, related-work lists and the sitemap. */
export const projectsTag = "projects" as const;

/** One article document. */
export const insightTag = (id: string | number) => `insight:${id}` as const;

/** The insights index and the sitemap. */
export const insightsTag = "insights" as const;
