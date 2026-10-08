import type { AppLocale } from "@/i18n/routing";
import type { SocialIconKey, StrokeIconKey } from "@/components/ui/SocialIcon";

/**
 * The domain shape the public site consumes.
 *
 * Public components never see a Payload document. They receive these views, already resolved for
 * one locale, so that "which language is this string in?" and "what happens when the CMS is
 * unreachable?" are answered in exactly one layer (`src/lib/content`).
 *
 * LOCALIZATION RULE (§27 / §35): a view field for locale X is `null` when the CMS has no value in
 * locale X. It is NEVER filled with the other language. Consumers omit `null` — an empty element
 * is always better than Arabic text on the English site.
 */

/** Where a view came from — surfaced in tests and diagnostics, never in the UI. */
export type ContentSource = "cms" | "fallback";

export type LocalizedText = { ar: string | null; en: string | null };

export type MediaRef = {
  id: string | number;
  /** Storage-agnostic URL: whatever the storage layer says it is (local route today, CDN later). */
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  /** Normalised 0–1 focal coordinates, or null when the editor hasn't set one (§9). */
  focal?: { x: number; y: number } | null;
};

export type LinkTarget =
  | { kind: "internal"; path: string }
  | { kind: "external"; url: string; newTab: boolean };

export type SiteSettingsView = {
  source: ContentSource;
  brandNameAr: string;
  brandNameEn: string;
  shortDescription: string | null;
  businessCategory: string | null;
  logo: MediaRef | null;
  logoLight: MediaRef | null;
  logoDark: MediaRef | null;
  favicon: MediaRef | null;
  defaultOgImage: MediaRef | null;
  defaultLocale: AppLocale;
  enabledLocales: AppLocale[];
  timezone: string;
  location: {
    display: string | null;
    city: string | null;
    region: string | null;
    countryCode: string;
    mapsUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  };
};

export type ContactChannelType = "phone" | "whatsapp" | "email" | "custom";

export type ContactChannelView = {
  id: string;
  type: ContactChannelType;
  /** When set, the UI shows this label instead of the raw value (e.g. "اتصل بنا"). */
  label: string | null;
  /** What a visitor reads when there is no label, e.g. 0507776891. */
  display: string;
  /** Ready-to-use href: tel:, mailto:, wa.me, https:. Derived from the type unless overridden. */
  href: string;
  icon: SocialIconKey | StrokeIconKey | null;
  primary: boolean;
};

export type ContactSettingsView = { source: ContentSource; channels: ContactChannelView[] };

export type SocialAccountView = {
  id: string;
  platform: string;
  url: string;
  handle: string | null;
  label: string | null;
  iconKey: SocialIconKey | StrokeIconKey;
};

export type SocialAccountsView = { source: ContentSource; accounts: SocialAccountView[] };

export type NavigationView = {
  source: ContentSource;
  items: { id: string; label: string; link: LinkTarget }[];
  cta: { label: string; link: LinkTarget } | null;
};

export type FooterGroupView = {
  id: string;
  heading: string;
  items: { id: string; label: string; marker: string | null; link: LinkTarget }[];
};

export type FooterView = {
  source: ContentSource;
  statement: string | null;
  groups: FooterGroupView[];
  showContact: boolean;
  showSocial: boolean;
  legal: { id: string; label: string; link: LinkTarget }[];
  copyrightOwner: string;
  rightsText: string | null;
};

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type TimePeriod = { from: string; to: string };

export type DayScheduleView = {
  day: Weekday;
  closed: boolean;
  allDay: boolean;
  periods: TimePeriod[];
  note: string | null;
};

export type BusinessHoursExceptionView = {
  id: string;
  date: string;
  closed: boolean;
  periods: TimePeriod[];
  note: string | null;
};

export type BusinessHoursView = {
  source: ContentSource;
  /** Always the company timezone from site settings — never the server's. */
  timezone: string;
  /** False when no schedule is configured: the UI must show no open/closed state at all (§13). */
  configured: boolean;
  week: DayScheduleView[];
  exceptions: BusinessHoursExceptionView[];
  note: string | null;
};

/**
 * The resolved identity of the business for one locale — the shape `src/lib/seo.ts` and
 * `src/lib/schema.ts` need, plus the links every conversion surface uses.
 *
 * It exists so that metadata, structured data, the header, the footer and the forms all describe the
 * SAME Seven Lands. If the owner changes the phone number in the admin, the `tel:` link, the wa.me
 * link, the structured-data `telephone` and the visible number move together — there is no second
 * place where the old number can survive.
 */
export type SiteIdentity = {
  source: ContentSource;
  /** Canonical origin. Deployment configuration (`NEXT_PUBLIC_SITE_URL`), not editorial content. */
  url: string;
  brand: { nameAr: string; nameEn: string };
  description: string | null;
  businessCategory: string | null;
  phone: { display: string; e164: string; href: string };
  whatsapp: { display: string; href: string };
  email: string | null;
  location: {
    display: string | null;
    city: string | null;
    region: string | null;
    countryCode: string;
    mapsUrl: string | null;
  };
  /** Ready-to-use artwork URLs, or null to keep the artwork the design system ships. */
  assets: {
    logo: string | null;
    logoLight: string | null;
    logoDark: string | null;
    favicon: string | null;
    ogImage: string | null;
  };
};
