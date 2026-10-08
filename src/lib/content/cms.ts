/**
 * The CMS provider — reads Payload globals and maps them to the domain views.
 *
 * All reads happen server-side and inside a `'use cache'` scope with an explicit tag, so a page
 * render never issues a fresh query per request (§52) and an admin save can expire exactly what it
 * changed (§37/§38). `overrideAccess: true` is used deliberately and documented in the report's
 * §29 list: the public site must be able to read its own global configuration without a session —
 * the REST surface stays permission-protected for humans.
 *
 * LOCALIZATION (§27): Payload runs with `fallback: false`, so a missing English value comes back
 * empty. The mappers below turn that into `null` (or drop the whole row when the entry would be
 * meaningless without a label) — the other language is never substituted.
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";

import type { AppLocale } from "@/i18n/routing";
import { ICONS, STROKE_ICONS, isSocialIconKey, type SocialIconKey } from "@/components/ui/SocialIcon";
import { defaultIconFor } from "@/lib/social/platforms";

import { CACHE_TAGS } from "./tags";
import { isSafeExternalUrl, toLinkTarget, type RawLink } from "./links";
import { deriveEmailHref, derivePhoneHref, deriveWhatsAppHref } from "./contact";
import { resolvePublicMedia, type MediaDocLike } from "./media";
import type {
  BusinessHoursView,
  ContactChannelType,
  ContactChannelView,
  DayScheduleView,
  FooterGroupView,
  FooterView,
  NavigationView,
  SiteSettingsView,
  SocialAccountView,
  Weekday,
} from "./views";

/* ── raw document shapes (structural: the adapter owns this boundary, not the generated types) ── */

type RawGlobal<T> = T | null;

type Localized = string | { ar?: string | null; en?: string | null } | null | undefined;

const pick = (value: Localized, locale: AppLocale): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim() ? value : null;
  const selected = value[locale];
  return typeof selected === "string" && selected.trim() ? selected : null;
};

/* ── site settings ─────────────────────────────────────────────────────────── */

type RawSiteSettings = {
  brand?: {
    nameAr?: string | null;
    nameEn?: string | null;
    shortDescription?: Localized;
    logo?: MediaDocLike | null;
    logoLight?: MediaDocLike | null;
    logoDark?: MediaDocLike | null;
    favicon?: MediaDocLike | null;
    defaultOgImage?: MediaDocLike | null;
  } | null;
  localization?: {
    defaultLocale?: string | null;
    enabledLocales?: string[] | null;
    timezone?: string | null;
  } | null;
  location?: {
    display?: Localized;
    city?: Localized;
    region?: Localized;
    countryCode?: string | null;
    mapsUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  general?: { businessCategory?: Localized } | null;
};

async function readSiteSettings(locale: AppLocale): Promise<RawGlobal<RawSiteSettings>> {
  "use cache";
  cacheTag(CACHE_TAGS.siteSettings);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "site-settings",
    locale,
    depth: 1,
    overrideAccess: true,
  })) as unknown as RawSiteSettings;
}

export function mapSiteSettings(doc: RawSiteSettings, locale: AppLocale): SiteSettingsView {
  const brand = doc.brand ?? {};
  const localization = doc.localization ?? {};
  const location = doc.location ?? {};
  const enabled = (localization.enabledLocales ?? ["ar", "en"]).filter(
    (value): value is AppLocale => value === "ar" || value === "en",
  );

  return {
    source: "cms",
    brandNameAr: brand.nameAr?.trim() || "سفن لاند",
    brandNameEn: brand.nameEn?.trim() || "Seven Lands",
    shortDescription: pick(brand.shortDescription, locale),
    businessCategory: pick(doc.general?.businessCategory, locale),
    logo: resolvePublicMedia(brand.logo, { locale }),
    logoLight: resolvePublicMedia(brand.logoLight, { locale }),
    logoDark: resolvePublicMedia(brand.logoDark, { locale }),
    favicon: resolvePublicMedia(brand.favicon, { locale }),
    defaultOgImage: resolvePublicMedia(brand.defaultOgImage, { locale }),
    defaultLocale: localization.defaultLocale === "en" ? "en" : "ar",
    enabledLocales: enabled.length > 0 ? enabled : ["ar", "en"],
    timezone: localization.timezone?.trim() || "Asia/Riyadh",
    location: {
      display: pick(location.display, locale),
      city: pick(location.city, locale),
      region: pick(location.region, locale),
      countryCode: location.countryCode?.trim() || "SA",
      mapsUrl: location.mapsUrl?.trim() || null,
      latitude: typeof location.latitude === "number" ? location.latitude : null,
      longitude: typeof location.longitude === "number" ? location.longitude : null,
    },
  };
}

export const cmsSiteSettings = readSiteSettings;

/* ── contact channels ──────────────────────────────────────────────────────── */

type RawChannel = {
  id?: string | null;
  type?: string | null;
  label?: Localized;
  value?: string | null;
  hrefOverride?: string | null;
  icon?: string | null;
  isPrimary?: boolean | null;
  enabled?: boolean | null;
};

type RawContactSettings = { channels?: RawChannel[] | null } | null;

async function readContactSettings(locale: AppLocale): Promise<RawContactSettings> {
  "use cache";
  cacheTag(CACHE_TAGS.contactSettings);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "contact-settings",
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as RawContactSettings;
}

export const cmsContactSettings = readContactSettings;

/* ── business hours ────────────────────────────────────────────────────────── */

type RawHours = {
  week?: {
    day?: string | null;
    closed?: boolean | null;
    allDay?: boolean | null;
    periods?: { from?: string | null; to?: string | null }[] | null;
    note?: Localized;
  }[] | null;
  exceptions?: {
    id?: string | null;
    date?: string | null;
    closed?: boolean | null;
    periods?: { from?: string | null; to?: string | null }[] | null;
    note?: Localized;
  }[] | null;
  note?: Localized;
} | null;

async function readBusinessHours(locale: AppLocale): Promise<RawHours> {
  "use cache";
  cacheTag(CACHE_TAGS.businessHours);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "business-hours",
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as RawHours;
}

export const cmsBusinessHours = readBusinessHours;

/* ── social accounts ───────────────────────────────────────────────────────── */

type RawSocial = { accounts?: RawSocialAccount[] | null } | null;
type RawSocialAccount = {
  id?: string | null;
  platform?: string | null;
  url?: string | null;
  handle?: string | null;
  label?: Localized;
  iconKey?: string | null;
  enabled?: boolean | null;
};

async function readSocialAccounts(locale: AppLocale): Promise<RawSocial> {
  "use cache";
  cacheTag(CACHE_TAGS.socialAccounts);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "social-accounts",
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as RawSocial;
}

export const cmsSocialAccounts = readSocialAccounts;

/* ── navigation ────────────────────────────────────────────────────────────── */

type RawNavItem = RawLink & {
  id?: string | null;
  label?: Localized;
  enabled?: boolean | null;
};

type RawNavigation = {
  header?: {
    items?: RawNavItem[] | null;
    cta?: (RawLink & { enabled?: boolean | null; label?: Localized }) | null;
  } | null;
} | null;

async function readNavigation(locale: AppLocale): Promise<RawNavigation> {
  "use cache";
  cacheTag(CACHE_TAGS.navigation);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "navigation",
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as RawNavigation;
}

export const cmsNavigation = readNavigation;

/* ── footer ────────────────────────────────────────────────────────────────── */

type RawFooterItem = RawLink & { id?: string | null; label?: Localized; marker?: string | null; enabled?: boolean | null };
type RawFooter = {
  statement?: Localized;
  groups?: {
    id?: string | null;
    heading?: Localized;
    enabled?: boolean | null;
    items?: RawFooterItem[] | null;
  }[] | null;
  showContact?: boolean | null;
  showSocial?: boolean | null;
  legal?: RawFooterItem[] | null;
  copyright?: { owner?: string | null; rightsText?: Localized } | null;
} | null;

async function readFooter(locale: AppLocale): Promise<RawFooter> {
  "use cache";
  cacheTag(CACHE_TAGS.footer);
  cacheLife("minutes");
  const payload = await getPayload({ config });
  return (await payload.findGlobal({
    slug: "footer",
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as RawFooter;
}

export const cmsFooter = readFooter;

/* ── mappers ───────────────────────────────────────────────────────────────── */

/**
 * The href is DERIVED from the channel type unless the admin explicitly overrode it — nobody
 * hand-builds `tel:` or `wa.me` links, and a Saudi local number keeps its `+966` form (§10).
 */
export function deriveChannelHref(
  type: ContactChannelType,
  value: string,
  override?: string | null,
): string | null {
  const custom = override?.trim();
  if (custom) return custom;
  switch (type) {
    case "phone":
      return derivePhoneHref(value);
    case "whatsapp":
      return deriveWhatsAppHref(value);
    case "email":
      return deriveEmailHref(value);
    default:
      return isSafeExternalUrl(value) ? value.trim() : null;
  }
}

export function mapContactChannels(doc: RawContactSettings, locale: AppLocale): ContactChannelView[] {
  const rows = doc?.channels ?? [];
  return rows
    .filter((row) => row.enabled !== false)
    .map((row, index): ContactChannelView | null => {
      const type = (["phone", "whatsapp", "email", "custom"] as const).includes(
        row.type as ContactChannelType,
      )
        ? (row.type as ContactChannelType)
        : "custom";
      const value = row.value?.trim() ?? "";
      if (!value) return null;
      const href = deriveChannelHref(type, value, row.hrefOverride);
      /* A channel whose href cannot be built is dropped rather than rendered as a dead link. */
      if (!href) return null;
      const icon = row.icon && isSocialIconKey(row.icon) ? row.icon : null;
      return {
        id: row.id ?? `channel-${index}`,
        type,
        label: pick(row.label, locale),
        display: value,
        href,
        icon,
        primary: row.isPrimary === true,
      } satisfies ContactChannelView;
    })
    .filter((entry): entry is ContactChannelView => entry !== null);
}

export function mapBusinessHours(
  doc: RawHours,
  locale: AppLocale,
  timezone: string,
): BusinessHoursView {
  const week: DayScheduleView[] = (doc?.week ?? [])
    .filter((row): row is NonNullable<typeof row> => Boolean(row?.day))
    .map((row) => ({
      day: row.day as Weekday,
      closed: row.closed === true,
      allDay: row.allDay === true,
      periods: (row.periods ?? [])
        .filter((period) => period?.from && period?.to)
        .map((period) => ({ from: period.from as string, to: period.to as string })),
      note: pick(row.note, locale),
    }));

  const exceptions = (doc?.exceptions ?? [])
    .filter((row) => Boolean(row?.date))
    .map((row, index) => ({
      id: row.id ?? `exception-${index}`,
      date: row.date as string,
      closed: row.closed === true,
      periods: (row.periods ?? [])
        .filter((period) => period?.from && period?.to)
        .map((period) => ({ from: period.from as string, to: period.to as string })),
      note: pick(row.note, locale),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const configured = week.some((day) => !day.closed && (day.allDay || day.periods.length > 0));

  return {
    source: "cms",
    timezone,
    configured,
    week,
    exceptions,
    note: pick(doc?.note, locale),
  };
}

export function mapSocialAccounts(doc: RawSocial, locale: AppLocale): SocialAccountView[] {
  const rows = doc?.accounts ?? [];
  return rows
    .filter((row) => row.enabled !== false && row.url?.trim())
    .map((row, index): SocialAccountView => {
      const platform = row.platform?.trim() || "custom";
      const iconKey = row.iconKey && isSocialIconKey(row.iconKey)
        ? (row.iconKey as SocialIconKey)
        : (defaultIconFor(platform) as SocialIconKey);
      return {
        id: row.id ?? `social-${index}`,
        platform,
        url: row.url!.trim(),
        handle: row.handle?.trim() || null,
        label: pick(row.label, locale),
        iconKey: iconKey in ICONS || iconKey in STROKE_ICONS ? iconKey : "link",
      };
    });
}

export function mapNavigation(doc: RawNavigation, locale: AppLocale): NavigationView {
  const raw = doc?.header ?? {};
  const items = (raw.items ?? [])
    .filter((item) => item.enabled !== false)
    .map((item, index) => {
      const label = pick(item.label, locale);
      const link = toLinkTarget(item);
      /* No label for this locale, or no usable destination: the item is omitted entirely. */
      if (!label || !link) return null;
      return { id: item.id ?? `nav-${index}`, label, link };
    })
    .filter((entry): entry is NavigationView["items"][number] => entry !== null);

  const ctaLabel = pick(raw.cta?.label, locale);
  const ctaLink = toLinkTarget(raw.cta ?? null);
  const cta =
    raw.cta?.enabled !== false && ctaLabel && ctaLink ? { label: ctaLabel, link: ctaLink } : null;

  return { source: "cms", items, cta };
}

export function mapFooter(doc: RawFooter, locale: AppLocale): FooterView {
  const groups: FooterGroupView[] = (doc?.groups ?? [])
    .filter((group) => group.enabled !== false)
    .map((group, groupIndex) => {
      const heading = pick(group.heading, locale);
      const items = (group.items ?? [])
        .filter((item) => item.enabled !== false)
        .map((item, index) => {
          const label = pick(item.label, locale);
          const link = toLinkTarget(item);
          if (!label || !link) return null;
          return {
            id: item.id ?? `footer-item-${groupIndex}-${index}`,
            label,
            marker: item.marker?.trim() || null,
            link,
          };
        })
        .filter((entry): entry is FooterGroupView["items"][number] => entry !== null);
      if (!heading || items.length === 0) return null;
      return { id: group.id ?? `footer-group-${groupIndex}`, heading, items };
    })
    .filter((entry): entry is FooterGroupView => entry !== null);

  const legal = (doc?.legal ?? [])
    .map((item, index) => {
      const label = pick(item.label, locale);
      const link = toLinkTarget(item);
      if (!label || !link) return null;
      return { id: item.id ?? `legal-${index}`, label, link };
    })
    .filter((entry): entry is FooterView["legal"][number] => entry !== null);

  return {
    source: "cms",
    statement: pick(doc?.statement, locale),
    groups,
    showContact: doc?.showContact !== false,
    showSocial: doc?.showSocial !== false,
    legal,
    copyrightOwner: doc?.copyright?.owner?.trim() || "Seven Lands",
    rightsText: pick(doc?.copyright?.rightsText, locale),
  };
}

