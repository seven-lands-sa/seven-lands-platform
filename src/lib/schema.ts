import { absoluteFromCanonical, type SiteIdentity } from "@/lib/content";
import { lands } from "@/content/services";
import type { AppLocale } from "@/i18n/routing";

/**
 * Structured data built only from verified facts.
 * Deliberately absent: aggregateRating, review, foundingDate, priceRange,
 * numberOfEmployees, awards — none of these are confirmed.
 */

export function organizationSchema(locale: AppLocale, identity: SiteIdentity) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${identity.url}/#organization`,
    name: locale === "ar" ? identity.brand.nameAr : identity.brand.nameEn,
    alternateName: [identity.brand.nameEn, identity.brand.nameAr],
    legalName: identity.brand.nameEn,
    url: `${identity.url}/${locale}`,
    logo:
      absoluteFromCanonical(identity.assets.logo, identity.url) ??
      `${identity.url}/brand/seven-lands-logo.png`,
    image:
      absoluteFromCanonical(identity.assets.ogImage, identity.url) ?? `${identity.url}/og/og-${locale}.png`,
    telephone: identity.phone.e164,
    /* Emitted only when the owner has published a map link — an empty hasMap is worse than none. */
    ...(identity.location.mapsUrl ? { hasMap: identity.location.mapsUrl } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: identity.location.city,
      addressRegion: identity.location.region,
      addressCountry: identity.location.countryCode,
    },
    areaServed: { "@type": "Country", name: identity.location.countryCode },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: identity.phone.e164,
        contactType: "customer service",
        availableLanguage: ["ar", "en"],
        areaServed: identity.location.countryCode,
      },
    ],
    knowsAbout: [
      "Digital marketing",
      "Branding",
      "Content production",
      "Social media management",
      "Paid media",
      "Web development",
      "E-commerce",
      "Business automation",
      "Custom software",
    ],
  };
}

export function websiteSchema(locale: AppLocale, identity: SiteIdentity) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${identity.url}/#website`,
    url: `${identity.url}/${locale}`,
    name:
      locale === "ar"
        ? `${identity.brand.nameAr} — ${identity.brand.nameEn}`
        : identity.brand.nameEn,
    inLanguage: locale === "ar" ? "ar-SA" : "en",
    publisher: { "@id": `${identity.url}/#organization` },
  };
}

/**
 * A capability's `Service` node.
 *
 * `source` is how structured data stays on the SAME authority as the page (§55): the renderer passes
 * the resolved view (CMS when published, shipped content otherwise), so the JSON-LD can never describe
 * an older name than the visible page. Without it the shipped content is used, which is exactly the
 * pre-Phase-F behaviour.
 */
export function serviceSchema(
  locale: AppLocale,
  slug: string,
  identity: SiteIdentity,
  source?: { title: string; promise: string; capabilities: string[] },
) {
  const land = lands.find((l) => l.slug === slug);
  if (!land) return null;
  const copy = source
    ? { title: source.title, promise: source.promise, capabilities: source.capabilities }
    : { title: land.copy[locale].title, promise: land.copy[locale].promise, capabilities: land.copy[locale].capabilities };

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.title,
    description: copy.promise,
    serviceType: copy.title,
    url: `${identity.url}/${locale}/services/${land.slug}`,
    provider: { "@id": `${identity.url}/#organization` },
    areaServed: { "@type": "Country", name: "SA" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: copy.title,
      itemListElement: copy.capabilities.map((capability, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: { "@type": "Service", name: capability },
      })),
    },
  };
}

export function faqSchema(locale: AppLocale, slug: string, source?: { q: string; a: string }[]) {
  const land = lands.find((l) => l.slug === slug);
  if (!land) return null;
  const copy = source ? { faqs: source } : land.copy[locale];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function breadcrumbSchema(
  locale: AppLocale,
  trail: { name: string; path: string }[],
  identity: SiteIdentity,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${identity.url}/${locale}${item.path}`,
    })),
  };
}
