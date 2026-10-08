import type { Metadata } from "next";
import { absoluteFromCanonical, type SiteIdentity } from "@/lib/content";
import type { AppLocale } from "@/i18n/routing";

const OG_LOCALE: Record<AppLocale, string> = { ar: "ar_SA", en: "en_US" };
const HTML_LANG: Record<AppLocale, string> = { ar: "ar-SA", en: "en" };

type BuildMetadataArgs = {
  /**
   * The resolved business identity. Required on purpose: a page that forgets it would otherwise
   * publish a site name or share image that disagrees with the page it belongs to.
   */
  identity: SiteIdentity;
  locale: AppLocale;
  title: string;
  description: string;
  /** Route after the locale segment, e.g. "" | "/services" | "/services/branding-creative" */
  path: string;
  /** Set true for routes that should stay out of the index (legal drafts, thin pages). */
  noIndex?: boolean;
  /**
   * Page-level share image (Phase E §37): a path or canonical-absolute URL from the page's SEO
   * contract. Absent → the site-wide share image, exactly as before.
   */
  ogImagePath?: string | null;
};

export function buildMetadata({
  identity,
  locale,
  title,
  description,
  path,
  noIndex = false,
  ogImagePath = null,
}: BuildMetadataArgs): Metadata {
  const other: AppLocale = locale === "ar" ? "en" : "ar";
  const canonical = `${identity.url}/${locale}${path}`;
  /* The owner's own share image wins when one is uploaded; otherwise the shipped one. */
  /* A CMS share image is stored as a path; it is qualified against the canonical origin so a
     preview run can never publish its own host. */
  const ogImage =
    absoluteFromCanonical(ogImagePath ?? identity.assets.ogImage, identity.url) ?? `${identity.url}/og/og-${locale}.png`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "ar-SA": `${identity.url}/ar${path}`,
        en: `${identity.url}/en${path}`,
        "x-default": `${identity.url}/ar${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: identity.brand.nameEn,
      title,
      description,
      url: canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[other],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${identity.brand.nameEn} — ${identity.brand.nameAr}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    other: {
      "content-language": HTML_LANG[locale],
    },
  };
}
