/**
 * Restore the verified Site Settings localisations and repair the damage a partial localized write
 * can do.
 *
 * WHY THIS EXISTS: Payload replaces a global's values for the locale being written. A write that
 * carries only `brand` therefore nulls every other localized field of that locale — which is exactly
 * what the Phase D fixture script did to the Arabic values (found by the Phase C suite turning red
 * on the next run). The fixture script now sends the whole body; this script puts the verified
 * Arabic and English values back, keeping whatever `defaultOgImage` currently points at.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { fallbackSiteSettings } from "@/lib/content/fallback";

const payload = await getPayload({ config });
const ar = fallbackSiteSettings("ar");
const en = fallbackSiteSettings("en");

for (const locale of ["ar", "en"] as const) {
  const source = locale === "ar" ? ar : en;
  const current = (await payload.findGlobal({ slug: "site-settings", locale, depth: 0, overrideAccess: true })) as Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;

  await payload.updateGlobal({
    slug: "site-settings",
    locale,
    overrideAccess: true,
    data: {
      /* everything non-localized comes back unchanged; the localized fields are rewritten from the
         verified fallback facts (the same values the seeder writes) */
      brand: {
        ...(current?.brand ?? {}),
        nameAr: ar.brandNameAr,
        nameEn: ar.brandNameEn,
        shortDescription: source.shortDescription,
      },
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

  const after = (await payload.findGlobal({ slug: "site-settings", locale, depth: 0, overrideAccess: true })) as Record<
    string,
    Record<string, unknown>
  >;
  console.log(
    `${locale}: display="${after.location?.display ?? ""}" city="${after.location?.city ?? ""}" ` +
      `short="${String(after.brand?.shortDescription ?? "").slice(0, 28)}" og=${String(after.brand?.defaultOgImage ?? "—")}`,
  );
}

await payload.destroy();
