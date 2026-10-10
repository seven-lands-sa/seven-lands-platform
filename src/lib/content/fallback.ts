/**
 * Static fallback provider — the trusted configuration the site already ships with.
 *
 * WHY THIS EXISTS (§35, §36): two different things must not be confused.
 *   1. Fallback between SOURCES — "the CMS is unreachable, use the values compiled into the app".
 *      Allowed, logged server-side, invisible to visitors.
 *   2. Fallback between LANGUAGES — "the English text is missing, show the Arabic".
 *      Forbidden, always. That is handled in the CMS mapper by returning null, never here.
 *
 * The fallback mirrors the values that were seeded into the CMS in this phase, so switching the
 * authority from static to CMS is provably text-identical (§33 step 6). Nothing here is invented:
 * every value below already exists in `src/content/site.ts`, `src/content/services.ts` or the
 * translation files that the live site renders today.
 */

import { category, site } from "@/content/site";
import { lands } from "@/content/services";
import arMessages from "@/i18n/messages/ar.json";
import enMessages from "@/i18n/messages/en.json";
import type { AppLocale } from "@/i18n/routing";

import type {
  BusinessHoursView,
  ContactChannelView,
  ContactSettingsView,
  FooterGroupView,
  FooterView,
  NavigationView,
  SiteSettingsView,
  SocialAccountsView,
  TrackingSettingsView,
  ConsentSettingsView,
} from "./views";
import { normalizePhone } from "./contact";

const MESSAGES = { ar: arMessages, en: enMessages } as const;

const text = (key: string, locale: AppLocale): string => {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
      MESSAGES[locale],
    );
  return typeof value === "string" ? value : "";
};

export function fallbackSiteSettings(locale: AppLocale): SiteSettingsView {
  return {
    source: "fallback",
    brandNameAr: site.brand.nameAr,
    brandNameEn: site.brand.nameEn,
    shortDescription: text("meta.home.description", locale) || null,
    businessCategory: locale === "ar" ? category.ar : category.en,
    /* Brand artwork stays in the design system until the owner uploads a replacement (§25). */
    logo: null,
    logoLight: null,
    logoDark: null,
    favicon: null,
    defaultOgImage: null,
    defaultLocale: "ar",
    enabledLocales: ["ar", "en"],
    timezone: "Asia/Riyadh",
    location: {
      display: locale === "ar" ? site.location.labelAr : site.location.labelEn,
      city: locale === "ar" ? site.location.shortAr : site.location.shortEn,
      region: locale === "ar" ? "القصيم" : "Al Qassim",
      countryCode: "SA",
      mapsUrl: site.location.mapsUrl,
      latitude: null,
      longitude: null,
    },
  };
}

export function fallbackTrackingSettings(): TrackingSettingsView {
  return {
    source: "fallback",
    environments: ["production"],
    googleAnalytics: { id: null, enabled: false },
    gtm: { containerId: null, enabled: false },
    googleAds: { conversionId: null, enabled: false },
    metaPixel: { id: null, enabled: false },
    snapPixel: { id: null, enabled: false },
    tiktokPixel: { id: null, enabled: false },
    linkedin: { partnerId: null, enabled: false },
    clarity: { projectId: null, enabled: false },
  };
}

export function fallbackConsentSettings(locale: AppLocale): ConsentSettingsView {
  return {
    source: "fallback",
    enabled: true,
    cookieExpiryMonths: 6,
    bannerTitle: locale === "ar" ? "تفضيلات الخصوصية وملفات تعريف الارتباط" : "Privacy Preferences & Cookies",
    bannerDescription:
      locale === "ar"
        ? "نستخدم ملفات تعريف الارتباط وأدوات التحليل لفهم استخدام الموقع وتحسين تجربتك وقياس أداء الحملات الإعلانية."
        : "We use cookies and analytics tools to understand site usage, enhance your experience, and measure campaign effectiveness.",
    acceptAllLabel: locale === "ar" ? "قبول الكل" : "Accept All",
    rejectAllLabel: locale === "ar" ? "رفض غير الضروري" : "Reject Non-Essential",
    preferencesLabel: locale === "ar" ? "تخصيص الخيارات" : "Preferences",
    savePreferencesLabel: locale === "ar" ? "حفظ التفضيلات" : "Save Preferences",
  };
}

/**
 * The two channels the site publishes today. WhatsApp shows the number itself (no label), the phone
 * row shows "اتصل بنا" — that difference is data, not code: a label overrides the raw value.
 */
export function fallbackContactChannels(locale: AppLocale): ContactChannelView[] {
  const phone = normalizePhone(site.phone.display);
  return [
    {
      id: "fallback-whatsapp",
      type: "whatsapp",
      label: null,
      display: site.phone.display,
      href: `https://wa.me/${site.phone.waNumber}`,
      icon: "whatsapp",
      primary: true,
    },
    {
      id: "fallback-phone",
      type: "phone",
      label: text("cta.call", locale) || null,
      display: phone?.display ?? site.phone.display,
      href: `tel:${site.phone.e164}`,
      icon: null,
      primary: false,
    },
  ];
}

export function fallbackContactSettings(locale: AppLocale): ContactSettingsView {
  return { source: "fallback", channels: fallbackContactChannels(locale) };
}

export function fallbackNavigation(locale: AppLocale): NavigationView {
  const items = [
    { id: "nav-home", path: "/", label: locale === "ar" ? "الرئيسية" : "Home" },
    { id: "nav-services", path: "/services", label: text("nav.services", locale) },
    { id: "nav-work", path: "/work", label: text("nav.work", locale) },
    { id: "nav-about", path: "/about", label: text("nav.about", locale) },
    { id: "nav-insights", path: "/insights", label: text("nav.insights", locale) },
    { id: "nav-contact", path: "/contact", label: text("nav.contact", locale) },
  ];

  return {
    source: "fallback",
    /* An item without a label for this locale is dropped — never rendered in the other language. */
    items: items
      .filter((item) => item.label)
      .map((item) => ({ id: item.id, label: item.label, link: { kind: "internal" as const, path: item.path } })),
    cta: {
      label: text("nav.start", locale),
      link: { kind: "internal", path: "/start-a-project" },
    },
  };
}

export function fallbackFooter(locale: AppLocale): FooterView {
  const navigationItems: FooterGroupView["items"] = [
    { label: text("nav.services", locale), path: "/services" },
    { label: text("nav.work", locale), path: "/work" },
    { label: text("nav.about", locale), path: "/about" },
    { label: text("nav.insights", locale), path: "/insights" },
    { label: text("nav.contact", locale), path: "/contact" },
    { label: text("nav.start", locale), path: "/start-a-project" },
  ]
    .filter((item) => item.label)
    .map((item, index) => ({
      id: `fallback-nav-${index}`,
      label: item.label,
      marker: null,
      link: { kind: "internal" as const, path: item.path },
    }));

  const capabilityItems: FooterGroupView["items"] = lands.map((land) => ({
    id: `fallback-land-${land.slug}`,
    label: land.copy[locale].short,
    marker: land.number,
    link: { kind: "internal" as const, path: `/services/${land.slug}` },
  }));

  return {
    source: "fallback",
    statement: text("footer.statement", locale) || null,
    groups: [
      {
        id: "fallback-group-navigation",
        heading: text("footer.navHeading", locale),
        items: navigationItems,
      },
      {
        id: "fallback-group-capabilities",
        heading: text("footer.landsHeading", locale),
        items: capabilityItems,
      },
    ].filter((group) => group.heading && group.items.length > 0),
    showContact: true,
    showSocial: true,
    legal: [
      { id: "fallback-legal-privacy", label: text("meta.privacy.title", locale), path: "/privacy" },
      { id: "fallback-legal-terms", label: text("meta.terms.title", locale), path: "/terms" },
    ]
      .filter((item) => item.label)
      .map((item) => ({
        id: item.id,
        label: item.label,
        link: { kind: "internal" as const, path: item.path },
      })),
    copyrightOwner: site.brand.wordmark,
    rightsText: text("footer.rights", locale) || null,
  };
}

/** No social account is published today — an empty list is the honest fallback (§49). */
export function fallbackSocialAccounts(): SocialAccountsView {
  return { source: "fallback", accounts: [] };
}

/**
 * Business hours are deliberately empty: the owner has not confirmed opening hours, and inventing
 * them would put a false "مفتوح الآن" badge on the site (§49, §57).
 */
export function fallbackBusinessHours(): BusinessHoursView {
  return {
    source: "fallback",
    timezone: "Asia/Riyadh",
    configured: false,
    week: [],
    exceptions: [],
    note: null,
  };
}
