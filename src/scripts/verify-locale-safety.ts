/**
 * PHASE E §1 — LOCALIZATION SAFETY REGRESSION SUITE.
 *
 * Proves, against the real database, that the shared helpers cannot lose one language while editing
 * the other, and that the write patterns the project actually uses behave as documented:
 *
 *   1. AR whole-document write preserves EN
 *   2. EN whole-document write preserves AR
 *   3. partial AR write preserves the other AR fields
 *   4. partial EN write preserves the other EN fields
 *   5. fixture-style teardown (per-locale mutation) preserves both locales
 *   6. helpers expose the resolved locale (reads never leak the other language)
 *
 * Runs on the Site Settings global because that is the document the Phase D incident destroyed; the
 * whole document of both locales is snapshotted first and restored in a `finally`, so the suite is
 * safe to re-run and leaves the database exactly as it found it.
 *
 * WRITE GUARD: refuses to run without ALLOW_VERIFICATION_WRITES=true (development/test only).
 */
import { getPayload } from "payload";
import config from "@payload-config";
import {
  CONTENT_LOCALES,
  mutateGlobalPerLocale,
  readGlobalForLocale,
  writeGlobalForLocale,
  type Locale,
} from "@/lib/payload/locale-safe";

if (process.env.ALLOW_VERIFICATION_WRITES !== "true") {
  console.error(
    "REFUSED: this suite writes to the database. Re-run with ALLOW_VERIFICATION_WRITES=true " +
      "against a development or test database.",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
const SLUG = "site-settings";
type Doc = Record<string, Record<string, unknown>> & Record<string, unknown>;

let passed = 0;
let failed = 0;
const failures: string[] = [];
const record = (ok: boolean, label: string, detail = "") => {
  if (ok) {
    passed += 1;
    console.log(`  ✅ ${label}${detail ? `  — ${detail}` : ""}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  ❌ ${label}${detail ? `  — ${detail}` : ""}`);
  }
};

const localizedPaths = [
  "location.display",
  "location.city",
  "location.region",
  "brand.shortDescription",
  "general.businessCategory",
] as const;

const pick = (doc: Doc, path: string) =>
  path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), doc);

const readPath = async (locale: Locale, path: string) => pick(await readGlobalForLocale<Doc>(payload, SLUG, locale), path);

/** Full-document snapshot of both locales — the safety net this suite restores from. */
const original = {} as Record<Locale, Doc>;
for (const locale of CONTENT_LOCALES) original[locale] = await readGlobalForLocale<Doc>(payload, SLUG, locale);

console.log("══ §1 · LOCALIZATION SAFETY ══\n");
console.log(`  baseline AR: display="${String(pick(original.ar, "location.display") ?? "")}" ` +
  `short="${String(pick(original.ar, "brand.shortDescription") ?? "").slice(0, 24)}…"`);
console.log(`  baseline EN: display="${String(pick(original.en, "location.display") ?? "")}" ` +
  `short="${String(pick(original.en, "brand.shortDescription") ?? "").slice(0, 24)}…"\n`);

try {
  /* ── 1 · AR whole-document write preserves EN ─────────────────────────────────────────────── */
  {
    const enBefore = await Promise.all(localizedPaths.map((p) => readPath("en", p)));
    const arDoc = await readGlobalForLocale<Doc>(payload, SLUG, "ar");
    const mutated: Doc = {
      ...arDoc,
      location: { ...(arDoc.location ?? {}), city: "بريدة، القصيم (اختبار)" },
    };
    await writeGlobalForLocale(payload, SLUG, "ar", mutated);

    const arCity = await readPath("ar", "location.city");
    const enAfter = await Promise.all(localizedPaths.map((p) => readPath("en", p)));
    record(arCity === "بريدة، القصيم (اختبار)", "AR write lands in AR", String(arCity));
    record(
      JSON.stringify(enBefore) === JSON.stringify(enAfter),
      "AR write preserves every EN field",
      `${localizedPaths.length} paths compared`,
    );
  }

  /* ── 2 · EN whole-document write preserves AR ─────────────────────────────────────────────── */
  {
    const arBefore = await Promise.all(localizedPaths.map((p) => readPath("ar", p)));
    const enDoc = await readGlobalForLocale<Doc>(payload, SLUG, "en");
    await writeGlobalForLocale(payload, SLUG, "en", {
      ...enDoc,
      location: { ...(enDoc.location ?? {}), city: "Buraydah, Al Qassim (test)" },
    });

    const enCity = await readPath("en", "location.city");
    const arAfter = await Promise.all(localizedPaths.map((p) => readPath("ar", p)));
    record(enCity === "Buraydah, Al Qassim (test)", "EN write lands in EN", String(enCity));
    record(
      JSON.stringify(arBefore) === JSON.stringify(arAfter),
      "EN write preserves every AR field",
      `${localizedPaths.length} paths compared`,
    );
  }

  /* ── 3 · partial AR write preserves the other AR fields ───────────────────────────────────── */
  {
    /* The pattern that caused the incident, but WITH an explicit locale: a partial body merges. */
    await payload.updateGlobal({
      slug: SLUG as never,
      locale: "ar",
      data: { general: { businessCategory: "اختبار تصنيف" } } as never,
      overrideAccess: true,
    });
    const category = await readPath("ar", "general.businessCategory");
    const displaySurvived = await readPath("ar", "location.display");
    const shortSurvived = await readPath("ar", "brand.shortDescription");
    /* Sibling INSIDE the same group: a group-level write must not blank the brand name. */
    const brandNameSurvived = await readPath("ar", "brand.nameAr");
    record(category === "اختبار تصنيف", "partial AR write lands in AR", String(category));
    record(
      Boolean(displaySurvived) && Boolean(shortSurvived),
      "partial AR write preserves the other AR fields",
      `display + shortDescription survived`,
    );
    record(brandNameSurvived === "سفن لاند", "partial write preserves siblings inside the same group", String(brandNameSurvived));
  }

  /* ── 4 · partial EN write preserves the other EN fields ───────────────────────────────────── */
  {
    await payload.updateGlobal({
      slug: SLUG as never,
      locale: "en",
      data: { general: { businessCategory: "Test category" } } as never,
      overrideAccess: true,
    });
    const category = await readPath("en", "general.businessCategory");
    const displaySurvived = await readPath("en", "location.display");
    const brandNameSurvived = await readPath("en", "brand.nameEn");
    record(category === "Test category", "partial EN write lands in EN", String(category));
    record(Boolean(displaySurvived), "partial EN write preserves the other EN fields", `${displaySurvived}`);
    record(brandNameSurvived === "Seven Lands", "partial EN write preserves siblings inside the same group", String(brandNameSurvived));
  }

  /* ── 5 · fixture-style teardown preserves both locales ────────────────────────────────────── */
  {
    /* This is the exact shape a teardown script uses: mutate each locale separately, writing the
       whole document back. Both languages must be intact afterwards. */
    await mutateGlobalPerLocale<Doc>(payload, SLUG, (doc) => ({ ...doc }));

    const arNow = await Promise.all(localizedPaths.map((p) => readPath("ar", p)));
    const enNow = await Promise.all(localizedPaths.map((p) => readPath("en", p)));
    record(
      arNow.slice(0, 1).every(Boolean) && enNow.slice(0, 1).every(Boolean),
      "teardown (per-locale whole-document write) preserves both locales",
      `AR=${String(arNow[0]).slice(0, 22)}… · EN=${String(enNow[0]).slice(0, 22)}…`,
    );
    record(
      arNow.filter(Boolean).length === localizedPaths.length && enNow.filter(Boolean).length === localizedPaths.length,
      "every localized field still present on both sides",
      `AR ${arNow.filter(Boolean).length}/${localizedPaths.length} · EN ${enNow.filter(Boolean).length}/${localizedPaths.length}`,
    );
  }

  /* ── 6 · reads never leak the other language ───────────────────────────────────────────────── */
  {
    /* Delete the EN value of one field, then prove the EN read is empty while AR keeps its own. */
    const arShort = await readPath("ar", "brand.shortDescription");
    const enDoc = await readGlobalForLocale<Doc>(payload, SLUG, "en");
    await writeGlobalForLocale(payload, SLUG, "en", {
      ...enDoc,
      brand: { ...(enDoc.brand ?? {}), shortDescription: null },
    });
    const enShortNow = await readPath("en", "brand.shortDescription");
    const arShortNow = await readPath("ar", "brand.shortDescription");
    record(enShortNow === null || enShortNow === "", "an empty EN value reads as empty in EN — never the Arabic text", JSON.stringify(enShortNow));
    record(arShortNow === arShort, "the AR value is untouched by the EN edit", String(arShortNow).slice(0, 24));
  }
} finally {
  /* Restore the exact documents captured at the start. */
  for (const locale of CONTENT_LOCALES) {
    await writeGlobalForLocale(payload, SLUG, locale, original[locale]);
  }
  const restored = {
    ar: await readPath("ar", "location.display"),
    en: await readPath("en", "location.display"),
  };
  console.log(`\n  ↩︎ restored: AR="${restored.ar}" · EN="${restored.en}"`);
}

console.log(`\n  checks passed: ${passed}`);
console.log(`  checks failed: ${failed}`);
if (failures.length) console.log(`  failures:\n    - ${failures.join("\n    - ")}`);
console.log(`  LOCALIZATION_SAFETY = ${failed === 0 ? "PASS" : "FAIL"}`);

await payload.destroy();
process.exit(failed === 0 ? 0 : 1);
