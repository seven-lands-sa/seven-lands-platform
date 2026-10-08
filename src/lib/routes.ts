import { RESERVED_SEGMENTS } from "@/lib/pages/slug";
import { lands } from "@/content/services";
import { publishedCaseStudies } from "@/content/work";
import { publishedArticles } from "@/content/insights";

/**
 * Route table used by the proxy to reject unknown paths with a real 404 status
 * (see `src/proxy.ts`). Keep in sync when new top-level routes are added — the
 * QA suite has a test that walks every entry, so drift is visible.
 */

export const staticSegments = new Set([
  "",
  "services",
  "work",
  "about",
  "insights",
  "start-a-project",
  "contact",
  "privacy",
  "terms",
  // Target of the proxy's 404 rewrite. Not linked anywhere and noindexed.
  "not-found",
  // Owner/admin-only draft preview (§20). Guarded by the admin session, noindexed, never linked,
  // never in the sitemap. Listed here so the proxy serves it with a real status instead of a 404.
  "preview",
]);

export const serviceSlugs: Set<string> = new Set(lands.map((land) => land.slug));
export const caseStudySlugs: Set<string> = new Set(publishedCaseStudies.map((item) => item.slug));
export const articleSlugs: Set<string> = new Set(publishedArticles.map((article) => article.slug));

/** `path` arrives without the locale prefix, e.g. "/services/branding-creative". */
export function isKnownPath(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length > 2) return false;

  const [first, second] = segments;
  if (!staticSegments.has(first) || first === "") return false;
  if (!second) return true;

  if (first === "services") return serviceSlugs.has(second);
  if (first === "work") return caseStudySlugs.has(second);
  if (first === "insights") return articleSlugs.has(second);
  return false;
}

/**
 * A single-segment path that is not reserved may belong to a CUSTOM CMS page (§5, §39).
 *
 * Custom pages are created in the admin panel, so their slugs are not knowable at build time and a
 * static route table can never be authoritative for them. The proxy therefore lets exactly these
 * candidates through and `/[locale]/[slug]` decides: a published page for that locale renders, and
 * anything else answers a real 404 from the route (which is dynamic, so the status is not a
 * streamed soft 404). Multi-segment unknowns and every reserved segment still get the proxy's 404.
 */
export function isCustomPageCandidate(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  return !RESERVED_SEGMENTS.includes(segments[0].toLowerCase());
}
