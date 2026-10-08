/**
 * Phase C bootstrap seeder — العلامة التجارية والتواصل والتنقل والفوتر.
 *
 * WHAT IT DOES
 * Copies the values the public site already publishes (the verified static configuration) into the
 * CMS globals, so the CMS and the static fallback describe exactly the same website. After this
 * runs, the public site reads the CMS; if the CMS is ever unreachable it reads the identical
 * fallback — which is what makes §33's "prove equivalence" step meaningful rather than hopeful.
 *
 * WHAT IT REFUSES TO DO
 *   · It never invents data. Business hours, social accounts, the email address and the street
 *     address stay EMPTY because the owner has not confirmed them (§49).
 *   · It never overwrites an edited global: a global that is already configured is skipped, so
 *     running this script again cannot undo the owner's work.
 *   · It refuses to run against a production database unless `ALLOW_PRODUCTION_SEED=true` (§42).
 *
 * WRITE CONTRACT (measured, not assumed — see phase-c/PHASE_C_REPORT.md §O)
 * Payload's Local API writes ONE locale per call. Passing `{ ar, en }` to a localized field stores
 * the object as a single locale's value, so this script writes Arabic first, reads the row ids
 * back, then writes English against those same ids. That is the only shape that keeps a localized
 * array intact in both languages.
 */

import { getPayload } from "payload";
import config from "@payload-config";

import {
  fallbackContactSettings,
  fallbackFooter,
  fallbackNavigation,
  fallbackSiteSettings,
} from "@/lib/content/fallback";
import { routeKeyForPath } from "@/lib/content/route-registry";
import type { LinkTarget } from "@/lib/content/views";

const payload = await getPayload({ config });

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  console.error(
    "✖ رفض التنفيذ: بيئة إنتاج بدون ALLOW_PRODUCTION_SEED=true — البيانات الأولية لا تُزرع تلقائيًا في الإنتاج.",
  );
  process.exit(1);
}

type RawLinkFields = {
  linkType: "internal" | "external";
  route?: string | null;
  url?: string | null;
  newTab?: boolean;
};

const rawLink = (link: LinkTarget): RawLinkFields => {
  if (link.kind === "external") {
    return { linkType: "external", url: link.url, newTab: link.newTab };
  }
  const key = routeKeyForPath(link.path);
  if (!key) throw new Error(`لا يوجد مفتاح مسار داخلي للمسار ${link.path}`);
  return { linkType: "internal", route: key };
};

const log = (message: string) => console.log(`  ${message}`);

/* ── site settings ─────────────────────────────────────────────────────────── */

async function seedSiteSettings(): Promise<"written" | "skipped"> {
  const current = await payload.findGlobal({ slug: "site-settings", locale: "ar", depth: 0 });
  if (current?.brand?.nameAr) {
    log("site-settings: موجود مسبقًا — لم يُعد كتابته.");
    return "skipped";
  }

  const ar = fallbackSiteSettings("ar");
  const en = fallbackSiteSettings("en");

  const shared = {
    brand: { nameAr: ar.brandNameAr, nameEn: ar.brandNameEn },
    localization: {
      defaultLocale: "ar",
      enabledLocales: ["ar", "en"],
      timezone: "Asia/Riyadh",
    },
    location: {
      countryCode: ar.location.countryCode,
      mapsUrl: ar.location.mapsUrl,
      latitude: null,
      longitude: null,
    },
  };

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "ar",
    data: {
      ...shared,
      brand: { ...shared.brand, shortDescription: ar.shortDescription },
      general: { businessCategory: ar.businessCategory },
      location: { ...shared.location, display: ar.location.display, city: ar.location.city, region: ar.location.region },
    } as never,
  });

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "en",
    data: {
      ...shared,
      brand: { ...shared.brand, shortDescription: en.shortDescription },
      general: { businessCategory: en.businessCategory },
      location: { ...shared.location, display: en.location.display, city: en.location.city, region: en.location.region },
    } as never,
  });

  log("site-settings: كُتبت الهوية والموقع والمنطقة الزمنية (ar + en).");
  return "written";
}

/* ── contact channels ──────────────────────────────────────────────────────── */

async function seedContactSettings(): Promise<"written" | "skipped"> {
  const current = await payload.findGlobal({ slug: "contact-settings", locale: "ar", depth: 0 });
  if ((current?.channels ?? []).length > 0) {
    log("contact-settings: موجود مسبقًا — لم يُعد كتابته.");
    return "skipped";
  }

  const ar = fallbackContactSettings("ar");
  const en = fallbackContactSettings("en");

  const build = (
    channels: typeof ar.channels,
    includeLabels: boolean,
  ): Record<string, unknown>[] =>
    channels.map((channel) => ({
      type: channel.type,
      value: channel.display,
      hrefOverride: null,
      icon: channel.icon,
      isPrimary: channel.primary,
      enabled: true,
      ...(includeLabels && channel.label ? { label: channel.label } : {}),
      ...(includeLabels && !channel.label ? { label: null } : {}),
    }));

  /* Arabic first (creates the rows), then English against the same row ids. */
  await payload.updateGlobal({
    slug: "contact-settings",
    locale: "ar",
    data: { channels: build(ar.channels, true) } as never,
  });

  const withIds = await payload.findGlobal({ slug: "contact-settings", locale: "ar", depth: 0 });
  const ids = (withIds?.channels ?? []).map((row) => row.id);

  await payload.updateGlobal({
    slug: "contact-settings",
    locale: "en",
    data: {
      channels: build(en.channels, true).map((row, index) => ({ ...row, id: ids[index] })),
    } as never,
  });

  log(`contact-settings: ${ar.channels.length} قنوات (واتساب + هاتف) بالعربية والإنجليزية.`);
  return "written";
}

/* ── navigation ────────────────────────────────────────────────────────────── */

async function seedNavigation(): Promise<"written" | "skipped"> {
  const current = await payload.findGlobal({ slug: "navigation", locale: "ar", depth: 0 });
  if ((current?.header?.items ?? []).length > 0) {
    log("navigation: موجود مسبقًا — لم يُعد كتابته.");
    return "skipped";
  }

  const ar = fallbackNavigation("ar");
  const en = fallbackNavigation("en");

  const buildItems = (view: typeof ar, includeLabels: boolean) =>
    view.items.map((item) => ({
      ...rawLink(item.link),
      enabled: true,
      ...(includeLabels ? { label: item.label } : {}),
    }));

  await payload.updateGlobal({
    slug: "navigation",
    locale: "ar",
    data: {
      header: {
        items: buildItems(ar, true),
        cta: { ...rawLink(ar.cta!.link), enabled: true, label: ar.cta!.label },
      },
    } as never,
  });

  const withIds = await payload.findGlobal({ slug: "navigation", locale: "ar", depth: 0 });
  const ids = (withIds?.header?.items ?? []).map((row) => row.id);

  await payload.updateGlobal({
    slug: "navigation",
    locale: "en",
    data: {
      header: {
        items: buildItems(en, true).map((row, index) => ({ ...row, id: ids[index] })),
        cta: { ...rawLink(en.cta!.link), enabled: true, label: en.cta!.label },
      },
    } as never,
  });

  log(`navigation: ${ar.items.length} روابط + زر الإجراء (ar + en).`);
  return "written";
}

/* ── footer ────────────────────────────────────────────────────────────────── */

async function seedFooter(): Promise<"written" | "skipped"> {
  const current = await payload.findGlobal({ slug: "footer", locale: "ar", depth: 0 });
  if ((current?.groups ?? []).length > 0) {
    log("footer: موجود مسبقًا — لم يُعد كتابته.");
    return "skipped";
  }

  const ar = fallbackFooter("ar");
  const en = fallbackFooter("en");

  const buildGroups = (view: typeof ar) =>
    view.groups.map((group) => ({
      heading: group.heading,
      enabled: true,
      items: group.items.map((item) => ({
        ...rawLink(item.link),
        marker: item.marker,
        enabled: true,
        label: item.label,
      })),
    }));

  await payload.updateGlobal({
    slug: "footer",
    locale: "ar",
    data: {
      statement: ar.statement,
      groups: buildGroups(ar),
      showContact: true,
      showSocial: true,
      legal: ar.legal.map((item) => ({ ...rawLink(item.link), enabled: true, label: item.label })),
      copyright: { owner: ar.copyrightOwner, rightsText: ar.rightsText },
    } as never,
  });

  /* Row ids for both nesting levels — groups, then each group's items. */
  const withIds = await payload.findGlobal({ slug: "footer", locale: "ar", depth: 0 });
  const groupIds = (withIds?.groups ?? []).map((group) => group.id);
  const itemIds = (withIds?.groups ?? []).map((group) => (group.items ?? []).map((item) => item.id));
  const legalIds = (withIds?.legal ?? []).map((row) => row.id);

  await payload.updateGlobal({
    slug: "footer",
    locale: "en",
    data: {
      statement: en.statement,
      groups: buildGroups(en).map((group, groupIndex) => ({
        ...group,
        id: groupIds[groupIndex],
        items: group.items.map((item, itemIndex) => ({
          ...item,
          id: itemIds[groupIndex]?.[itemIndex],
        })),
      })),
      showContact: true,
      showSocial: true,
      legal: en.legal.map((item, index) => ({ ...rawLink(item.link), enabled: true, label: item.label, id: legalIds[index] })),
      copyright: { owner: en.copyrightOwner, rightsText: en.rightsText },
    } as never,
  });

  log(
    `footer: ${ar.groups.length} مجموعات و${ar.groups.reduce((total, group) => total + group.items.length, 0)} روابط (ar + en).`,
  );
  return "written";
}

/* ── run ───────────────────────────────────────────────────────────────────── */

const results = {
  siteSettings: await seedSiteSettings(),
  contact: await seedContactSettings(),
  navigation: await seedNavigation(),
  footer: await seedFooter(),
};

log("business-hours و social-accounts تُركت فارغة عمدًا: بيانات لم يعتمدها المالك بعد.");
log(`النتيجة: ${JSON.stringify(results)}`);
process.exit(0);
