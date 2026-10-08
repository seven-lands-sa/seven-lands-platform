import type { Payload } from "payload";

/**
 * Locale-safe read/write helpers (§1 of Phase E — a permanent localisation safety rule).
 *
 * WHY THIS EXISTS
 * Phase D lost the Arabic row of the Site Settings global twice. The trap, established empirically:
 *
 *   · with `localization.fallback: false`, a **REST read without an explicit locale** returns `null`
 *     for every localized field;
 *   · a **write without an explicit locale** lands in the default locale (`ar`);
 *   · so the innocent-looking "read the document, change one field, write it back" pattern writes a
 *     document full of `null`s into Arabic, and Payload deletes the emptied row.
 *
 * Every programmatic read/write of localized content in this codebase goes through this module, so a
 * developer cannot forget the rule by accident. The regression suite for these helpers lives in
 * `src/scripts/verify-locale-safety.ts`.
 */

export type Locale = "ar" | "en";
export const CONTENT_LOCALES: readonly Locale[] = ["ar", "en"] as const;

/** Read a global for ONE locale, with the locale always explicit. */
export async function readGlobalForLocale<T extends Record<string, unknown>>(
  payload: Payload,
  slug: string,
  locale: Locale,
): Promise<T> {
  return (await payload.findGlobal({
    slug: slug as never,
    locale,
    depth: 0,
    overrideAccess: true,
  })) as unknown as T;
}

/**
 * Write a whole document for ONE locale. The caller owns the completeness of `data` — that is what
 * makes this safe: nothing is read from a different locale and written back as this one.
 */
export async function writeGlobalForLocale<T extends Record<string, unknown>>(
  payload: Payload,
  slug: string,
  locale: Locale,
  data: T,
): Promise<void> {
  await payload.updateGlobal({
    slug: slug as never,
    locale,
    data: data as never,
    depth: 0,
    overrideAccess: true,
  });
}

/**
 * Apply `mutate` to a global **per locale**, reading and writing each locale explicitly and
 * separately. This is the helper every script, seed and fixture should use instead of hand-rolling
 * read-modify-write: the mutation cannot see another locale's values, so it cannot copy them across
 * and it cannot blank one language while editing the other.
 *
 * Returns the value `mutate` produced for each locale, for assertions.
 */
export async function mutateGlobalPerLocale<T extends Record<string, unknown>>(
  payload: Payload,
  slug: string,
  mutate: (doc: T, locale: Locale) => T,
): Promise<Record<Locale, T>> {
  const written = {} as Record<Locale, T>;
  for (const locale of CONTENT_LOCALES) {
    const current = await readGlobalForLocale<T>(payload, slug, locale);
    const next = mutate(current, locale);
    await writeGlobalForLocale(payload, slug, locale, next);
    written[locale] = next;
  }
  return written;
}

/**
 * Read a localized collection document for one locale. `fallbackLocale: false` is explicit on
 * purpose: a missing English value must come back as `null`, never as Arabic.
 */
export async function readDocForLocale<T>(
  payload: Payload,
  collection: string,
  id: string | number,
  locale: Locale,
): Promise<T> {
  return (await payload.findByID({
    collection: collection as never,
    id,
    locale,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: true,
  })) as unknown as T;
}

/** Snapshot of the localized values a guard should protect, for before/after comparison. */
export type LocaleSnapshot = {
  ar: Record<string, unknown>;
  en: Record<string, unknown>;
};

/** Capture the given field paths of a global for both locales. */
export async function snapshotGlobal(
  payload: Payload,
  slug: string,
  paths: readonly string[],
): Promise<LocaleSnapshot> {
  const pick = (doc: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const path of paths) {
      out[path] = path.split(".").reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
        return undefined;
      }, doc);
    }
    return out;
  };

  return {
    ar: pick(await readGlobalForLocale(payload, slug, "ar")),
    en: pick(await readGlobalForLocale(payload, slug, "en")),
  };
}

/** Compare a snapshot taken by `snapshotGlobal` with the current state. */
export async function snapshotGlobalIntact(
  payload: Payload,
  slug: string,
  paths: readonly string[],
  before: LocaleSnapshot,
): Promise<{ ar: boolean; en: boolean; after: LocaleSnapshot }> {
  const after = await snapshotGlobal(payload, slug, paths);
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    paths.every((path) => JSON.stringify(a[path] ?? null) === JSON.stringify(b[path] ?? null));
  return { ar: same(before.ar, after.ar), en: same(before.en, after.en), after };
}
