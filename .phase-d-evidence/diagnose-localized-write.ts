/**
 * Diagnostic: what exactly does a partial localized write to a Payload global do?
 *
 * Background: `site_settings_locales` lost its Arabic row twice. The first time, the Phase D fixture
 * script (REST) was blamed; the second time it happened after the Phase D suite ran its usage check
 * (Local API, no explicit locale). This script isolates the three write shapes and prints the
 * observable result of each, restoring the verified values between experiments so the database is
 * left exactly as it was found.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { fallbackSiteSettings } from "@/lib/content/fallback";

const payload = await getPayload({ config });
const ar = fallbackSiteSettings("ar");
const en = fallbackSiteSettings("en");

type AnyDoc = Record<string, Record<string, unknown>>;

/** Write the verified values for BOTH locales (whole body per locale). */
async function restore() {
  for (const locale of ["ar", "en"] as const) {
    const source = locale === "ar" ? ar : en;
    const current = (await payload.findGlobal({ slug: "site-settings", locale, depth: 0, overrideAccess: true })) as AnyDoc;
    await payload.updateGlobal({
      slug: "site-settings",
      locale,
      overrideAccess: true,
      data: {
        brand: { ...(current?.brand ?? {}), nameAr: ar.brandNameAr, nameEn: ar.brandNameEn, shortDescription: source.shortDescription },
        localization: current?.localization ?? { defaultLocale: "ar", enabledLocales: ["ar", "en"], timezone: "Asia/Riyadh" },
        location: {
          ...(current?.location ?? {}),
          countryCode: ar.location.countryCode,
          mapsUrl: ar.location.mapsUrl,
          display: source.location.display,
          city: source.location.city,
          region: source.location.region,
        },
        general: { ...(current?.general ?? {}), businessCategory: source.businessCategory },
      } as never,
    });
  }
}

async function dump(tag: string) {
  const out: string[] = [];
  for (const locale of ["ar", "en"] as const) {
    const doc = (await payload.findGlobal({ slug: "site-settings", locale, depth: 0, overrideAccess: true })) as AnyDoc;
    out.push(
      `   ${locale}: display=${JSON.stringify(doc?.location?.display ?? null)} ` +
        `short=${JSON.stringify(String(doc?.brand?.shortDescription ?? "").slice(0, 22))} ` +
        `category=${JSON.stringify(doc?.general?.businessCategory ?? null)}`,
    );
  }
  console.log(`\n── ${tag}\n${out.join("\n")}`);
}

await restore();
await dump("BASELINE (verified values, both locales)");

/* A · Local API write naming ONLY `brand`, no explicit locale (⇒ default locale). */
await payload.updateGlobal({ slug: "site-settings", data: { brand: { shortDescription: "A-dev-value" } } as never, overrideAccess: true });
await dump("A · updateGlobal({data:{brand:{shortDescription}}} ) — no locale");

await restore();

/* B · The same write, but explicitly targeting the SECOND locale. */
await payload.updateGlobal({
  slug: "site-settings",
  locale: "en",
  data: { brand: { shortDescription: "B-dev-value" } } as never,
  overrideAccess: true,
});
await dump("B · same partial body, locale:'en'");

await restore();

/* C · The shape the Phase D usage check uses: read without locale, write the whole doc back. */
const read = (await payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true })) as AnyDoc & {
  brand?: Record<string, unknown>;
};
await payload.updateGlobal({
  slug: "site-settings",
  data: { ...(read as never), brand: { ...(read.brand ?? {}), defaultOgImage: read.brand?.defaultOgImage ?? null } } as never,
  depth: 0,
  overrideAccess: true,
});
await dump("C · read (no locale) + whole-document write (no locale) — the D-suite shape");

await restore();
await dump("RESTORED (final state)");

await payload.destroy();
