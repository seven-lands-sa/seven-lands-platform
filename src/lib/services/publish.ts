/**
 * SERVICES — the publication gate (§10–§12, §24, §25).
 *
 * Same discipline as the Pages validator, at the scale of a domain document: one authoritative
 * function, used by the endpoints, the admin UI and the tests, that answers "may this locale go
 * live?" with NAMED reasons in Arabic. It never mutates anything and never touches media visibility.
 *
 * The checks, in order:
 *   1 · the capability is enabled — a disabled capability cannot be published (its route would
 *       disappear while the URL is still indexed; until the Redirect Manager exists in Phase G, that
 *       is refused rather than half-served — §39 policy);
 *   2 · the locale carries every required field IN ITS OWN LANGUAGE (no AR→EN fallback);
 *   3 · if a cover image is set, it must resolve, be public and carry alt text for that locale.
 */
import { SERVICE_FIELD_LABELS, SERVICE_LOCALES, SERVICE_REQUIRED_FIELDS, type ServiceLocale } from "./model";
import type { MediaFacts } from "@/lib/pages/publish";

export type ServiceBlocker = {
  kind: "field" | "media" | "structure";
  locale: ServiceLocale;
  fieldLabel?: string;
  message: string;
};

export type ServiceValidation = {
  ok: boolean;
  blockers: ServiceBlocker[];
  perLocale: Record<ServiceLocale, { ok: boolean; count: number }>;
};

export type ServiceLike = {
  id?: string | number;
  landKey?: string | null;
  enabled?: boolean | null;
  title?: unknown;
  short?: unknown;
  promise?: unknown;
  intro?: unknown;
  wa?: unknown;
  capabilities?: unknown;
  problems?: unknown;
  faqs?: unknown;
  cover?: unknown;
  seo?: { title?: unknown; description?: unknown; noindex?: boolean | null } | null;
};

const localeLabel = (locale: ServiceLocale) => (locale === "ar" ? "العربية" : "الإنجليزية");

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** Dotted path inside the document (`cover`, `seo.ogImage`). */
const readPath = (doc: Record<string, unknown>, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), doc);

const idOf = (value: unknown): string | number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    const id = (value as { id?: string | number }).id;
    return id ?? null;
  }
  return (value as string | number) ?? null;
};

export type MediaLookup = Map<string, MediaFacts>;

/** Media ids a service document references (§27 — one contract shared with the usage registry). */
export function collectServiceMediaIds(service: ServiceLike): (string | number)[] {
  const ids: (string | number)[] = [];
  for (const path of ["cover", "seo.ogImage"]) {
    const id = idOf(readPath(service as unknown as Record<string, unknown>, path));
    if (id !== null && id !== "") ids.push(id);
  }
  return ids;
}

export function validateServiceForPublish(service: ServiceLike, media: MediaLookup): ServiceValidation {
  const blockers: ServiceBlocker[] = [];
  const perLocale: Record<ServiceLocale, { ok: boolean; count: number }> = {
    ar: { ok: true, count: 0 },
    en: { ok: true, count: 0 },
  };
  const add = (blocker: ServiceBlocker) => {
    blockers.push(blocker);
    perLocale[blocker.locale].count += 1;
  };

  /* 1 · identity + enabled state */
  if (!service.landKey) {
    for (const locale of SERVICE_LOCALES) {
      add({
        kind: "structure",
        locale,
        message: "المجال بلا هوية ثابتة — لا يمكن نشره حتى يُنشأ من قائمة المجالات السبعة.",
      });
    }
  }
  if (service.enabled === false) {
    const label = service.landKey ?? "المجال";
    for (const locale of SERVICE_LOCALES) {
      add({
        kind: "structure",
        locale,
        message: `«${label}» موقوف حاليًا. أعد تشغيله أولًا، أو ألغِ نشره من الموقع العام قبل إيقافه — لا نترك رابطًا مفهرسًا يسقط بلا تحويل.`,
      });
    }
  }

  /* 2 · required copy, per locale, in its own language */
  for (const locale of SERVICE_LOCALES) {
    for (const field of SERVICE_REQUIRED_FIELDS) {
      const raw = (service as Record<string, unknown>)[field];
      const localized =
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? asText((raw as Record<string, unknown>)[locale])
          : asText(raw);
      if (!localized) {
        add({
          kind: "field",
          locale,
          fieldLabel: SERVICE_FIELD_LABELS[field] ?? field,
          message: `${SERVICE_FIELD_LABELS[field] ?? field} فارغ بالـ${localeLabel(locale)} — لا يمكن نشر هذه اللغة قبل اكتمال نصّها.`,
        });
      }
    }
  }

  /* 3 · cover media (usage tracking + privacy + alt are the same rules as everywhere else) */
  for (const locale of SERVICE_LOCALES) {
    for (const path of ["cover", "seo.ogImage"]) {
      const id = idOf(readPath(service as unknown as Record<string, unknown>, path));
      if (id === null || id === "") continue;
      const key = String(id);
      const facts = media.get(key);
      const fieldName = path === "cover" ? "صورة الغلاف" : "صورة المشاركة";
      if (!facts) {
        add({
          kind: "media",
          locale,
          fieldLabel: fieldName,
          message: `${fieldName}: الملف المرتبط غير موجود أو لم يعد متاحًا — أعد اختيار الصورة.`,
        });
        continue;
      }
      if (facts.visibility !== "public") {
        add({
          kind: "media",
          locale,
          fieldLabel: fieldName,
          message: `${fieldName}: الملف «${facts.filename ?? facts.id}» خاص. لن نغيّر ظهوره تلقائيًا: اجعله عامًا من مكتبة الوسائط ثم انشر.`,
        });
      }
      if (!facts.decorative && !asText(facts.alt?.[locale])) {
        add({
          kind: "media",
          locale,
          fieldLabel: fieldName,
          message: `${fieldName}: النص البديل للملف «${facts.filename ?? facts.id}» ناقص بالـ${localeLabel(locale)}.`,
        });
      }
    }
  }

  for (const locale of SERVICE_LOCALES) perLocale[locale].ok = perLocale[locale].count === 0;
  return { ok: blockers.length === 0, blockers, perLocale };
}

/** Short Arabic summary of the first blocker — what the audit log and the admin banner carry. */
export function serviceBlockerSummary(result: ServiceValidation): string {
  if (result.ok) return "كل المتطلبات مكتملة.";
  const first = result.blockers[0];
  const extra = result.blockers.length - 1;
  return extra > 0 ? `${first.message} (+${extra} ملاحظة أخرى)` : first.message;
}
