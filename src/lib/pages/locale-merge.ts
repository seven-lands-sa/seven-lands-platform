/**
 * Whole-document locale merging (§1, measured on this stack).
 *
 * WHY THIS EXISTS
 *   Payload stores one locale per write inside a version. A single-locale save therefore produces a
 *   version that contains only that language's rows — the next draft read in the *other* language
 *   then looks empty (observed here: version 4 held Arabic only, version 5 English only). The shape
 *   Payload's own admin panel sends is a whole-document save (`locale: "all"`) carrying both
 *   languages, which keeps every version complete.
 *
 * WHAT IT DOES
 *   Walks two readings of the same document and produces one value per localized leaf:
 *   the `targets` locales take the draft's value, every other locale keeps the already-published
 *   value. Arrays are merged by index, and every row keeps the id it came with — losing row ids is
 *   the other documented way to wipe the sibling language.
 */

export type PublishLocale = "ar" | "en";

const isLocalizedLeaf = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key === "ar" || key === "en");
};

/**
 * Merges the draft over the published document.
 *
 * @param draft  the document as read with `locale: "all"`, `draft: true`
 * @param live   the same document as read with `locale: "all"`, `draft: false` (may be null)
 * @param targets locales whose values should come from the draft
 */
export function mergeLocaleValues<T>(draft: T, live: unknown, targets: readonly PublishLocale[]): T {
  const walk = (draftNode: unknown, liveNode: unknown, key?: string): unknown => {
    if (isLocalizedLeaf(draftNode)) {
      const liveLeaf = isLocalizedLeaf(liveNode) ? liveNode : {};
      const out: Record<string, unknown> = { ...draftNode };
      for (const locale of ["ar", "en"] as const) {
        if (!targets.includes(locale)) {
          out[locale] = liveLeaf[locale] ?? null;
        } else if (out[locale] === undefined) {
          out[locale] = null;
        }
      }
      return out;
    }

    if (Array.isArray(draftNode)) {
      const liveArray = Array.isArray(liveNode) ? liveNode : [];
      return draftNode.map((row, index) => walk(row, liveArray[index]));
    }

    if (draftNode && typeof draftNode === "object") {
      const record = draftNode as Record<string, unknown>;
      const liveRecord = liveNode && typeof liveNode === "object" && !Array.isArray(liveNode) ? (liveNode as Record<string, unknown>) : {};
      const out: Record<string, unknown> = {};
      for (const [childKey, child] of Object.entries(record)) {
        out[childKey] = walk(child, liveRecord[childKey], childKey);
      }
      return out;
    }

    void key;
    return draftNode;
  };

  return walk(draft, live) as T;
}

/** True when at least one locale of the leaf has a non-empty value. */
export const leafHasValue = (value: unknown, locale: PublishLocale): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const own = (value as Record<string, unknown>)[locale];
    return typeof own === "string" ? own.trim().length > 0 : own !== null && own !== undefined && own !== "";
  }
  return value !== null && value !== undefined;
};

/**
 * Flattens `{ ar, en }` leaves to one locale's plain values — the shape a locale-scoped write needs.
 * A single-locale write that receives an object stores the object in that locale's column (measured).
 */
export function flattenLocaleValue<T>(node: T, locale: PublishLocale): T {
  if (isLocalizedLeaf(node)) return ((node as Record<string, unknown>)[locale] ?? null) as T;
  if (Array.isArray(node)) return node.map((row) => flattenLocaleValue(row, locale)) as unknown as T;
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) out[key] = flattenLocaleValue(child, locale);
    return out as T;
  }
  return node;
}
