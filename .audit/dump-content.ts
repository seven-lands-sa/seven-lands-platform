/**
 * AUDIT — read-only dump of the current CMS state. Writes nothing.
 * Usage: npx payload run .audit/dump-content.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const show = (label: string, value: unknown) =>
  console.log(`${label}: ${typeof value === "string" ? value : JSON.stringify(value)}`);

const site = (await payload.findGlobal({ slug: "site-settings", locale: "all", depth: 1, overrideAccess: true })) as Record<string, unknown>;
show("siteSettings", {
  brandNameAr: ((site.brand as Record<string, unknown>)?.nameAr) ?? null,
  brandNameEn: ((site.brand as Record<string, unknown>)?.nameEn) ?? null,
  logo: (site.brand as Record<string, unknown>)?.logo ?? null ? "set" : "empty",
  favicon: (site.brand as Record<string, unknown>)?.favicon ? "set" : "empty",
  defaultOg: (site.brand as Record<string, unknown>)?.defaultOgImage ? "set" : "empty",
  shortDescription: (site.brand as Record<string, unknown>)?.shortDescription ?? null,
  localeState: site.localeState ?? null,
});
const loc = (site.location ?? {}) as Record<string, unknown>;
show("siteSettings.location", { display: loc.display ?? null, city: loc.city ?? null, region: loc.region ?? null, countryCode: loc.countryCode ?? null, mapsUrl: loc.mapsUrl ?? null, lat: loc.latitude ?? null, lng: loc.longitude ?? null });
show("siteSettings.localization", site.localization ?? null);

const contact = (await payload.findGlobal({ slug: "contact-settings", locale: "all", depth: 0, overrideAccess: true })) as Record<string, unknown>;
show("contactSettings.channels", JSON.stringify(contact.channels ?? null));

const hours = (await payload.findGlobal({ slug: "business-hours", locale: "all", depth: 0, overrideAccess: true })) as Record<string, unknown>;
show("businessHours.week rows", Array.isArray(hours.week) ? hours.week.length : hours.week);
show("businessHours.exceptions rows", Array.isArray(hours.exceptions) ? hours.exceptions.length : hours.exceptions);

const social = (await payload.findGlobal({ slug: "social-accounts", locale: "all", depth: 0, overrideAccess: true })) as Record<string, unknown>;
show("socialAccounts.accounts", JSON.stringify(social.accounts ?? null));

const nav = (await payload.findGlobal({ slug: "navigation", locale: "all", depth: 0, overrideAccess: true })) as Record<string, unknown>;
show("navigation.header items", JSON.stringify(nav.header ?? null).slice(0, 600));

const footer = (await payload.findGlobal({ slug: "footer", locale: "all", depth: 0, overrideAccess: true })) as Record<string, unknown>;
show("footer.groups", JSON.stringify(footer.groups ?? null).slice(0, 700));
show("footer.legal", JSON.stringify(footer.legal ?? null).slice(0, 400));

const pages = await payload.find({ collection: "pages", limit: 20, pagination: false, depth: 0, draft: true, locale: "all", overrideAccess: true });
console.log("pages:");
for (const doc of pages.docs as unknown as { id: number; systemKey?: string; slug?: string; localeState?: Record<string, { state?: string }>; sections?: unknown[] }[]) {
  console.log(
    `  #${doc.id} ${doc.systemKey ?? "(custom)"} slug=${doc.slug} ar=${doc.localeState?.ar?.state} en=${doc.localeState?.en?.state} blocks=${Array.isArray(doc.sections) ? doc.sections.length : 0}`,
  );
}

const services = await payload.find({ collection: "services", limit: 20, pagination: false, depth: 0, draft: true, locale: "all", overrideAccess: true });
console.log("services:");
for (const doc of services.docs as unknown as { id: number; landKey?: string; order?: number; glyph?: string; enabled?: boolean; localeState?: Record<string, { state?: string }>; title?: Record<string, string> }[]) {
  console.log(
    `  #${doc.id} ${doc.landKey} order=${doc.order} glyph=${doc.glyph} enabled=${doc.enabled} ar=${doc.localeState?.ar?.state} en=${doc.localeState?.en?.state} title.ar=${doc.title?.ar}`,
  );
}

for (const slug of ["projects", "insights", "media", "audit-events"] as const) {
  const found = await payload.find({ collection: slug, limit: 1, depth: 0, overrideAccess: true });
  console.log(`${slug}: totalDocs=${found.totalDocs}`);
}

process.exit(0);
