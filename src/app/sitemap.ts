import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CONTENT_UPDATED_AT, site } from "@/content/site";
import { lands } from "@/content/services";
import { listPagePublications } from "@/lib/pages/adapter";

/**
 * Sitemap (§37 — page SEO contract, §21 — preview/drafts stay out).
 *
 * Three rules, each of them enforced here rather than trusted to memory:
 *   1 · a route that is `noindex` is NOT in the sitemap. `/privacy` and `/terms` carry a deliberate
 *       `noindex` while their copy is a placeholder pending legal review, and a published CMS page
 *       that turns `noindex` on disappears from this file as well.
 *   2 · only pages published IN THAT LOCALE are added by the CMS (an AR-only page never appears in
 *       the English sitemap), and a custom page appears only when it is published for that locale.
 *   3 · nothing that is a draft, a preview (`/{locale}/preview`) or an admin route can ever be
 *       listed: drafts are never returned by a `draft: false` read, and the preview/admin routes
 *       are not generated here at all.
 *
 * The static route list stays authoritative for the shipped pages: a system page whose locale is
 * unpublished still serves its static baseline, so its URL remains a real, indexable page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/work", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "yearly" },
    { path: "/insights", priority: 0.6, changeFrequency: "monthly" },
    { path: "/start-a-project", priority: 0.9, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
    /* /privacy and /terms intentionally absent: `noindex` in the shipped code (see rule 1). */
  ];

  const publications = await listPagePublications();
  const suppressed = new Set(
    publications.filter((page) => page.noindex && page.systemKey).map((page) => page.path || ""),
  );

  const lastModified = new Date(`${CONTENT_UPDATED_AT}T00:00:00Z`);

  return routing.locales.flatMap((locale) => {
    const indexable = staticRoutes.filter((route) => !suppressed.has(route.path));
    const custom = publications.filter(
      (page) => !page.systemKey && page.slug && !page.noindex && page.publishedIn[locale as "ar" | "en"],
    );

    const alternatesFor = (path: string) => ({
      languages: {
        ar: `${site.url}/ar${path}`,
        en: `${site.url}/en${path}`,
      },
    });

    return [
      ...indexable.map((route) => ({
        url: `${site.url}/${locale}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: alternatesFor(route.path),
      })),
      ...custom.map((page) => {
        /* A custom page exists PER LOCALE (§16). Its alternates may only name the locales where it
           is actually published — an hreflang pointing at a 404 is worse than no hreflang, and the
           English URL of an Arabic-only page must never appear in this file. */
        const publishedLocales = routing.locales.filter((code) => page.publishedIn[code as "ar" | "en"]);
        const languages = Object.fromEntries(publishedLocales.map((code) => [code, `${site.url}/${code}${page.path}`]));
        return {
          url: `${site.url}/${locale}${page.path}`,
          lastModified,
          changeFrequency: "yearly" as const,
          priority: 0.5,
          alternates: {
            languages: { ...languages, "x-default": `${site.url}/${publishedLocales[0] ?? locale}${page.path}` },
          },
        };
      }),
      ...lands.map((land) => ({
        url: `${site.url}/${locale}/services/${land.slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: alternatesFor(`/services/${land.slug}`),
      })),
    ];
  });
}
