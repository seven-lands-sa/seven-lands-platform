/**
 * Media facts for the publication gate (§24, §25, §27).
 *
 * One read, one shape. The publication validator needs `filename`, `visibility`, `decorative` and
 * the alt text of BOTH locales (to name the missing language precisely). `locale: "all"` returns
 * localized fields as `{ ar, en }`, and `fallback: false` means a missing translation stays empty —
 * exactly what the no-silent-fallback rule needs.
 */
import type { Payload } from "payload";
import type { MediaFacts } from "./publish";

type MediaDoc = {
  id: string | number;
  filename?: string | null;
  visibility?: "public" | "private" | null;
  decorative?: boolean | null;
  alt?: unknown;
};

const localeValue = (value: unknown, locale: "ar" | "en"): string | null => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const own = record[locale];
    return typeof own === "string" ? own : null;
  }
  return null;
};

/** Resolves the given media ids into validator facts. Missing ids are simply absent from the map. */
export async function resolveMediaFacts(
  payload: Payload,
  ids: readonly (string | number)[],
): Promise<Map<string, MediaFacts>> {
  const unique = [...new Set(ids.map((id) => String(id)).filter(Boolean))];
  const map = new Map<string, MediaFacts>();
  if (unique.length === 0) return map;

  const result = await payload.find({
    collection: "media",
    where: { id: { in: unique } },
    limit: unique.length,
    pagination: false,
    depth: 0,
    locale: "all",
    draft: false,
    overrideAccess: true,
  });

  for (const doc of result.docs as MediaDoc[]) {
    map.set(String(doc.id), {
      id: doc.id,
      filename: doc.filename ?? null,
      visibility: doc.visibility ?? "private",
      decorative: Boolean(doc.decorative),
      alt: { ar: localeValue(doc.alt, "ar"), en: localeValue(doc.alt, "en") },
    });
  }
  return map;
}
