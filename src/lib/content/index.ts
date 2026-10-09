import type { AppLocale } from "@/i18n/routing";
import { site } from "@/content/site";

import {
  cmsBusinessHours,
  cmsConsentSettings,
  cmsContactSettings,
  cmsFooter,
  cmsNavigation,
  cmsSiteSettings,
  cmsSocialAccounts,
  cmsTrackingSettings,
  mapBusinessHours,
  mapConsentSettings,
  mapContactChannels,
  mapFooter,
  mapNavigation,
  mapSiteSettings,
  mapSocialAccounts,
  mapTrackingSettings,
} from "./cms";
import {
  fallbackBusinessHours,
  fallbackConsentSettings,
  fallbackContactSettings,
  fallbackFooter,
  fallbackNavigation,
  fallbackSiteSettings,
  fallbackSocialAccounts,
  fallbackTrackingSettings,
} from "./fallback";
import { channelOfType } from "./links";
import type {
  BusinessHoursView,
  ConsentSettingsView,
  ContactSettingsView,
  FooterView,
  NavigationView,
  SiteSettingsView,
  SiteIdentity,
  SocialAccountsView,
  TrackingSettingsView,
} from "./views";

/**
 * The content adapter — the single door between the public site and its content (§34).
 *
 * Public components call these functions and receive domain views already resolved for one locale.
 * They never import Payload, never build a query, and never know whether the answer came from the
 * CMS or from the static fallback.
 *
 * Each function: cached CMS read → on failure, log server-side and use the trusted static
 * configuration (§36). Visitors never see an infrastructure error and the homepage never 500s
 * because a social account could not be read.
 */

function reportFailure(what: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  // Server-side only. Never surfaced to a visitor.
  console.error(`[content] ${what} unavailable — serving trusted static fallback: ${message}`);
}

export async function getSiteSettings(locale: AppLocale): Promise<SiteSettingsView> {
  try {
    const doc = await cmsSiteSettings(locale);
    if (!doc) return fallbackSiteSettings(locale);
    return mapSiteSettings(doc, locale);
  } catch (error) {
    reportFailure("site-settings", error);
    return fallbackSiteSettings(locale);
  }
}

export async function getContactSettings(locale: AppLocale): Promise<ContactSettingsView> {
  try {
    const doc = await cmsContactSettings(locale);
    if (!doc) return fallbackContactSettings(locale);
    const channels = mapContactChannels(doc, locale);
    return channels.length > 0 ? { source: "cms", channels } : fallbackContactSettings(locale);
  } catch (error) {
    reportFailure("contact-settings", error);
    return fallbackContactSettings(locale);
  }
}

export async function getSocialAccounts(locale: AppLocale): Promise<SocialAccountsView> {
  try {
    const doc = await cmsSocialAccounts(locale);
    if (!doc) return fallbackSocialAccounts();
    return { source: "cms", accounts: mapSocialAccounts(doc, locale) };
  } catch (error) {
    reportFailure("social-accounts", error);
    return fallbackSocialAccounts();
  }
}

export async function getNavigation(locale: AppLocale): Promise<NavigationView> {
  try {
    const doc = await cmsNavigation(locale);
    if (!doc) return fallbackNavigation(locale);
    const view = mapNavigation(doc, locale);
    /* An empty menu would be a worse failure than the shipped menu — fall back, don't blank it. */
    return view.items.length > 0 ? view : fallbackNavigation(locale);
  } catch (error) {
    reportFailure("navigation", error);
    return fallbackNavigation(locale);
  }
}

export async function getFooter(locale: AppLocale): Promise<FooterView> {
  try {
    const doc = await cmsFooter(locale);
    if (!doc) return fallbackFooter(locale);
    const view = mapFooter(doc, locale);
    return view.groups.length > 0 ? view : fallbackFooter(locale);
  } catch (error) {
    reportFailure("footer", error);
    return fallbackFooter(locale);
  }
}

export async function getBusinessHours(locale: AppLocale): Promise<BusinessHoursView> {
  try {
    const settings = await getSiteSettings(locale);
    const doc = await cmsBusinessHours(locale);
    if (!doc) return fallbackBusinessHours();
    return mapBusinessHours(doc, locale, settings.timezone);
  } catch (error) {
    reportFailure("business-hours", error);
    return fallbackBusinessHours();
  }
}

export async function getTrackingSettings(): Promise<TrackingSettingsView> {
  try {
    const doc = await cmsTrackingSettings();
    if (!doc) return fallbackTrackingSettings();
    return mapTrackingSettings(doc);
  } catch (error) {
    reportFailure("tracking-settings", error);
    return fallbackTrackingSettings();
  }
}

export async function getConsentSettings(locale: AppLocale): Promise<ConsentSettingsView> {
  try {
    const doc = await cmsConsentSettings(locale);
    if (!doc) return fallbackConsentSettings(locale);
    return mapConsentSettings(doc, locale);
  } catch (error) {
    reportFailure("consent-settings", error);
    return fallbackConsentSettings(locale);
  }
}

export { getOpenState, formatPeriod, WEEKDAY_LABELS, WEEKDAYS } from "./hours";
export { absoluteFromCanonical, asPublicPath, collectMediaIds, focalPointOf, isPubliclyVisible, mediaSrcSet, mediaUrl, resolvePublicMedia } from "./media";
export { INTERNAL_ROUTES, routePath } from "./route-registry";
export { CACHE_TAGS, mediaTag } from "./tags";
export { channelOfType, isSafeExternalUrl, primaryContact, toLinkTarget, withWhatsAppMessage } from "./links";
export type { OpenState } from "./hours";
export type * from "./views";

/**
 * Site identity — brand, phone, WhatsApp, location and artwork for one locale, resolved once.
 *
 * Every consumer that needs more than one of these (metadata, structured data, the header, the
 * footer, the forms) calls this instead of assembling its own. The link derivations live here so
 * that a `tel:` link can never disagree with the number printed next to it.
 */
export async function getSiteIdentity(locale: AppLocale): Promise<SiteIdentity> {
  const [settings, contact] = await Promise.all([getSiteSettings(locale), getContactSettings(locale)]);

  const phoneChannel = channelOfType(contact.channels, "phone");
  const whatsappChannel = channelOfType(contact.channels, "whatsapp");
  const emailChannel = channelOfType(contact.channels, "email");

  const tel = phoneChannel?.href ?? `tel:${site.phone.e164}`;

  return {
    /* "cms" only when every ingredient of the identity came from the CMS. */
    source: settings.source === "cms" && contact.source === "cms" ? "cms" : "fallback",
    url: site.url,
    brand: { nameAr: settings.brandNameAr, nameEn: settings.brandNameEn },
    description: settings.shortDescription,
    businessCategory: settings.businessCategory,
    phone: {
      display: phoneChannel?.display ?? site.phone.display,
      e164: tel.replace(/^tel:/, ""),
      href: tel,
    },
    whatsapp: {
      display: whatsappChannel?.display ?? site.phone.display,
      href: whatsappChannel?.href ?? `https://wa.me/${site.phone.waNumber}`,
    },
    email: emailChannel ? emailChannel.href.replace(/^mailto:/, "") : null,
    location: {
      display: settings.location.display,
      city: settings.location.city,
      region: settings.location.region,
      countryCode: settings.location.countryCode,
      mapsUrl: settings.location.mapsUrl,
    },
    assets: {
      logo: settings.logo?.url ?? null,
      logoLight: settings.logoLight?.url ?? null,
      logoDark: settings.logoDark?.url ?? null,
      favicon: settings.favicon?.url ?? null,
      ogImage: settings.defaultOgImage?.url ?? null,
    },
  };
}
