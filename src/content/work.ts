import type { AppLocale } from "@/i18n/routing";

/**
 * ============================================================================
 * WORK / CASE STUDIES
 * ============================================================================
 * 🚫 NO REAL, PUBLISHED CASE STUDIES EXIST YET.
 * Nothing may be fabricated here — no clients, no sectors, no results, no
 * logos, no metrics. The model below is production-ready: add a real entry and
 * the Work hub, filters and case-study template start rendering immediately.
 * Until then the site shows an honest, designed "in preparation" state.
 */

export type CaseStudy = {
  slug: string;
  client: string;
  /** Show the client name only with written permission. */
  clientApproved: boolean;
  sector: string;
  landSlugs: string[];
  year: string;
  challenge: string;
  objective: string;
  approach: string;
  execution: string[];
  /** Only verified outcomes. Never estimated or "illustrative" numbers. */
  results: { label: string; value: string }[];
  gallery: { src: string; alt: string }[];
  coverImage: string | null;
  published: boolean;
};

export const caseStudies: CaseStudy[] = [];

export const publishedCaseStudies = caseStudies.filter((c) => c.published && c.clientApproved);

export const workEmptyState: Record<
  AppLocale,
  { title: string; body: string; note: string }
> = {
  ar: {
    title: "نوثّق أعمالنا قبل نشرها.",
    body: "نعرض المشاريع التي نستطيع الحديث عنها بالأرقام وبموافقة العميل.",
    note: "الأعمال الجاهزة للمشاركة تُضاف هنا تباعًا.",
  },
  en: {
    title: "We document before we publish.",
    body: "We show the projects we can talk about with numbers, with the client's agreement.",
    note: "Publishable case studies are added here as they clear.",
  },
};
