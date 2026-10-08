/**
 * PROJECTS — the publication gate (§13–§15).
 *
 * The rules that keep the public site honest, enforced in one place:
 *   1 · a project needs a name, a slug and a summary for that locale;
 *   2 · a metric row must carry BOTH a label and a value (a half-entered claim never publishes);
 *   3 · a testimonial requires approval AND attribution — an anonymous quote is refused;
 *   4 · cover/gallery media must exist, be public and carry alt text for that locale.
 *
 * Nothing is calculated, inferred or generated here: the gate only refuses.
 */
import type { MediaFacts } from "@/lib/pages/publish";

export type ProjectLocale = "ar" | "en";
export const PROJECT_LOCALES: readonly ProjectLocale[] = ["ar", "en"];

export type ProjectBlocker = {
  kind: "field" | "media" | "structure";
  locale: ProjectLocale;
  fieldLabel?: string;
  message: string;
};

export type ProjectValidation = {
  ok: boolean;
  blockers: ProjectBlocker[];
  perLocale: Record<ProjectLocale, { ok: boolean; count: number }>;
};

const localeLabel = (locale: ProjectLocale) => (locale === "ar" ? "العربية" : "الإنجليزية");
const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const localeValue = (value: unknown, locale: ProjectLocale): string => {
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

export function collectProjectMediaIds(project: Record<string, unknown>): (string | number)[] {
  return [...idsIn(project.cover), ...idsIn(project.gallery), ...idsIn((project.seo as { ogImage?: unknown } | undefined)?.ogImage)];
}

type Row = { label?: unknown; value?: unknown };

export function validateProjectForPublish(project: Record<string, unknown>, media: Map<string, MediaFacts>): ProjectValidation {
  const blockers: ProjectBlocker[] = [];
  const perLocale: Record<ProjectLocale, { ok: boolean; count: number }> = {
    ar: { ok: true, count: 0 },
    en: { ok: true, count: 0 },
  };
  const add = (blocker: ProjectBlocker) => {
    blockers.push(blocker);
    perLocale[blocker.locale].count += 1;
  };

  if (!asText(project.slug)) {
    for (const locale of PROJECT_LOCALES) {
      add({ kind: "structure", locale, message: "العمل بلا رابط — أضف رابطًا صالحًا قبل النشر." });
    }
  }

  for (const locale of PROJECT_LOCALES) {
    if (!localeValue(project.name, locale)) {
      add({ kind: "field", locale, fieldLabel: "اسم العمل", message: `اسم العمل فارغ بالـ${localeLabel(locale)}.` });
    }
    if (!localeValue(project.summary, locale)) {
      add({
        kind: "field",
        locale,
        fieldLabel: "الملخّص",
        message: `ملخّص العمل فارغ بالـ${localeLabel(locale)} — لا ننشر صفحة عمل بلا ملخّص واضح.`,
      });
    }

    /* metrics: both halves or none */
    const rows = (project.metrics ?? []) as Row[] | { ar?: Row[]; en?: Row[] };
    const own: Row[] = Array.isArray(rows) ? rows : (rows?.[locale] ?? []);
    own.forEach((row, index) => {
      const label = localeValue(row?.label, locale);
      const value = localeValue(row?.value, locale);
      if (!label || !value) {
        add({
          kind: "field",
          locale,
          fieldLabel: `النتائج الموثّقة (بند ${index + 1})`,
          message: `بند النتيجة رقم ${index + 1} ناقص بالـ${localeLabel(locale)}: نحتاج اسم المؤشر وقيمته معًا.`,
        });
      }
    });

    /* testimonial: approval + attribution */
    const testimonial = project.testimonial as { quote?: unknown; attribution?: unknown; approved?: boolean } | undefined;
    const quote = localeValue(testimonial?.quote, locale);
    if (quote) {
      if (testimonial?.approved !== true) {
        add({
          kind: "structure",
          locale,
          message: `شهادة العميل بالـ${localeLabel(locale)} بلا موافقة موثّقة — لا تُنشر شهادة قبل الموافقة.`,
        });
      }
      if (!localeValue(testimonial?.attribution, locale)) {
        add({
          kind: "field",
          locale,
          fieldLabel: "نُسبت إلى",
          message: `شهادة العميل بالـ${localeLabel(locale)} بلا نسبة — لا ننشر شهادة مجهولة.`,
        });
      }
    }

    /* media */
    const checkMedia = (value: unknown, fieldName: string) => {
      for (const id of idsIn(value)) {
        const facts = media.get(String(id));
        if (!facts) {
          add({ kind: "media", locale, fieldLabel: fieldName, message: `${fieldName}: الملف المرتبط غير موجود — أعد اختيار الصورة.` });
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
    };
    checkMedia(project.cover, "صورة الغلاف");
    checkMedia(project.gallery, "معرض الصور");
    checkMedia((project.seo as { ogImage?: unknown } | undefined)?.ogImage, "صورة المشاركة");
  }

  for (const locale of PROJECT_LOCALES) perLocale[locale].ok = perLocale[locale].count === 0;
  return { ok: blockers.length === 0, blockers, perLocale };
}

export function projectBlockerSummary(result: ProjectValidation): string {
  if (result.ok) return "كل المتطلبات مكتملة.";
  const first = result.blockers[0];
  const extra = result.blockers.length - 1;
  return extra > 0 ? `${first.message} (+${extra} ملاحظة أخرى)` : first.message;
}
