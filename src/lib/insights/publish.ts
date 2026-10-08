/**
 * INSIGHTS — the editorial publication gate (§16–§17).
 *
 * Same shape as the other domain gates: named, per-locale refusals in Arabic, media held to the same
 * standard as everywhere else, and one addition specific to editorial work — SCHEDULING. A future
 * `publishedAt` may be stored, but publishing a document whose date is still in the future is refused
 * with an explanation rather than silently going live early (the scheduling surface itself arrives in
 * Phase K; this is the guard that makes it safe to add).
 */
import type { MediaFacts } from "@/lib/pages/publish";

export type InsightLocale = "ar" | "en";
export const INSIGHT_LOCALES: readonly InsightLocale[] = ["ar", "en"];

export type InsightBlocker = {
  kind: "field" | "media" | "structure";
  locale: InsightLocale;
  fieldLabel?: string;
  message: string;
};

export type InsightValidation = {
  ok: boolean;
  blockers: InsightBlocker[];
  perLocale: Record<InsightLocale, { ok: boolean; count: number }>;
};

const localeLabel = (locale: InsightLocale) => (locale === "ar" ? "العربية" : "الإنجليزية");
const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const localeValue = (value: unknown, locale: InsightLocale): string => {
  if (typeof value === "string") return asText(value);
  if (value && typeof value === "object" && !Array.isArray(value)) return asText((value as Record<string, unknown>)[locale]);
  return "";
};
const idsIn = (value: unknown): (string | number)[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(idsIn);
  if (typeof value === "object") {
    const id = (value as { id?: string | number }).id;
    return id === undefined || id === null ? [] : [id];
  }
  return typeof value === "string" || typeof value === "number" ? [value] : [];
};

export function collectInsightMediaIds(insight: Record<string, unknown>): (string | number)[] {
  return [...idsIn(insight.cover), ...idsIn((insight.seo as { ogImage?: unknown } | undefined)?.ogImage)];
}

/** True when the document's own body carries at least one paragraph in that locale. */
const bodyHasParagraph = (body: unknown, locale: InsightLocale): boolean => {
  const node =
    body && typeof body === "object" && !Array.isArray(body) ? ((body as Record<string, unknown>)[locale] ?? body) : body;
  const children = (node as { root?: { children?: unknown[] } } | undefined)?.root?.children;
  return Array.isArray(children) && children.length > 0;
};

export function validateInsightForPublish(insight: Record<string, unknown>, media: Map<string, MediaFacts>): InsightValidation {
  const blockers: InsightBlocker[] = [];
  const perLocale: Record<InsightLocale, { ok: boolean; count: number }> = {
    ar: { ok: true, count: 0 },
    en: { ok: true, count: 0 },
  };
  const add = (blocker: InsightBlocker) => {
    blockers.push(blocker);
    perLocale[blocker.locale].count += 1;
  };

  if (!asText(insight.slug)) {
    for (const locale of INSIGHT_LOCALES) {
      add({ kind: "structure", locale, message: "المقال بلا رابط — أضف رابطًا صالحًا قبل النشر." });
    }
  }

  const scheduled = insight.publishedAt ? new Date(String(insight.publishedAt)) : null;
  if (scheduled && !Number.isNaN(scheduled.getTime()) && scheduled.getTime() > Date.now()) {
    for (const locale of INSIGHT_LOCALES) {
      add({
        kind: "structure",
        locale,
        message: `تاريخ النشر المضبوط (${scheduled.toISOString().slice(0, 10)}) في المستقبل — النشر المجدول يأتي مع لوحة العمليات؛ حاليًا يبقى المقال مسودة حتى يحين موعده.`,
      });
    }
  }

  for (const locale of INSIGHT_LOCALES) {
    if (!localeValue(insight.title, locale)) {
      add({ kind: "field", locale, fieldLabel: "العنوان", message: `عنوان المقال فارغ بالـ${localeLabel(locale)}.` });
    }
    if (!localeValue(insight.excerpt, locale)) {
      add({ kind: "field", locale, fieldLabel: "المقتطف", message: `مقتطف المقال فارغ بالـ${localeLabel(locale)}.` });
    }
    if (!bodyHasParagraph(insight.body, locale)) {
      add({ kind: "field", locale, fieldLabel: "النص", message: `نص المقال فارغ بالـ${localeLabel(locale)}.` });
    }
    for (const id of idsIn(insight.cover)) {
      const facts = media.get(String(id));
      if (!facts) {
        add({ kind: "media", locale, fieldLabel: "صورة الغلاف", message: "صورة الغلاف: الملف المرتبط غير موجود — أعد اختيارها." });
        continue;
      }
      if (facts.visibility !== "public") {
        add({
          kind: "media",
          locale,
          fieldLabel: "صورة الغلاف",
          message: `صورة الغلاف: الملف «${facts.filename ?? facts.id}» خاص. لن نغيّر ظهوره تلقائيًا.`,
        });
      }
      if (!facts.decorative && !asText(facts.alt?.[locale])) {
        add({
          kind: "media",
          locale,
          fieldLabel: "صورة الغلاف",
          message: `صورة الغلاف: النص البديل للملف «${facts.filename ?? facts.id}» ناقص بالـ${localeLabel(locale)}.`,
        });
      }
    }
  }

  for (const locale of INSIGHT_LOCALES) perLocale[locale].ok = perLocale[locale].count === 0;
  return { ok: blockers.length === 0, blockers, perLocale };
}

export function insightBlockerSummary(result: InsightValidation): string {
  if (result.ok) return "كل المتطلبات مكتملة.";
  const first = result.blockers[0];
  const extra = result.blockers.length - 1;
  return extra > 0 ? `${first.message} (+${extra} ملاحظة أخرى)` : first.message;
}
