import type { AppLocale } from "@/i18n/routing";

/**
 * ============================================================================
 * INSIGHTS / ARTICLES
 * ============================================================================
 * 🚫 NO ARTICLES EXIST YET. Nothing is fabricated to fill the hub.
 * The model is ready: add a real entry with `published: true` and the hub,
 * article template, sitemap and Article structured data all activate.
 */

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date string, e.g. "2026-03-01" */
  date: string;
  readingMinutes: number;
  author: string | null;
  tags: string[];
  body: string[];
  published: boolean;
};

export const articles: Article[] = [];

export const publishedArticles = articles
  .filter((a) => a.published)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const insightsEmptyState: Record<AppLocale, { title: string; body: string; note: string }> = {
  ar: {
    title: "نشرح ما نتعلمه من العمل نفسه.",
    body: "نكتب عن ما نراه في المشاريع: ما يعمل، وما لا يعمل، وكيف تُتخذ القرارات.",
    note: "أول المقالات قيد الكتابة.",
  },
  en: {
    title: "We write from the work itself.",
    body: "We write about what we see in real projects: what works, what doesn't, and how decisions get made.",
    note: "The first articles are in progress.",
  },
};
