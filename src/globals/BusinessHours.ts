import type { Field, GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { WEEKDAYS, WEEKDAY_LABELS, duplicateDays, overlappingPeriods, periodProblem } from "@/lib/content/hours";
import { localizedText, periodFields } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Business hours — مواعيد العمل (§11/§12/§13).
 *
 * Structured, never free text: a weekly schedule of opening periods plus dated exceptions. The
 * timezone is NOT duplicated here — it lives in the site settings ("المنطقة الزمنية للشركة") so
 * there is exactly one source of truth for "what time is it for the business".
 *
 * The site shows «مفتوح الآن / مغلق الآن» only when this document actually describes a schedule;
 * an empty schedule renders no badge at all rather than a wrong one.
 */

type Period = { from?: string | null; to?: string | null };

const validatePeriodRows = (value: unknown): true | string => {
  const periods = (value as Period[] | undefined) ?? [];
  for (const period of periods) {
    const problem = periodProblem(period);
    if (problem) return problem;
  }
  const clean = periods
    .filter((period) => period?.from && period?.to)
    .map((period) => ({ from: period.from as string, to: period.to as string }));
  if (overlappingPeriods(clean)) {
    return "هناك فترتان متداخلتان في اليوم نفسه. عدّل الأوقات حتى لا تتقاطع.";
  }
  return true;
};

const dayField: Field = {
  name: "day",
  type: "select",
  label: "اليوم",
  required: true,
  options: WEEKDAYS.map((day) => ({ label: `${WEEKDAY_LABELS[day].ar} — ${WEEKDAY_LABELS[day].en}`, value: day })),
  admin: { width: "40%" },
};

export const BusinessHours: GlobalConfig = {
  slug: "business-hours",
  label: "مواعيد العمل",
  admin: {
    group: "إعدادات الموقع",
    description:
      "المواعيد التي يقرأها الموقع لعرض حالة «مفتوح الآن». تُحسب دائمًا بتوقيت الشركة المحدد في الإعدادات العامة.",
  },
  access: globalAccess("settings.read", "settings.hours.update"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "hours_updated",
    resourceType: "business-hours",
    label: "مواعيد العمل",
    tags: [CACHE_TAGS.businessHours],
    fieldLabels: { week: "الجدول الأسبوعي", exceptions: "الاستثناءات", note: "ملاحظة عامة" },
  }),
  fields: [
    {
      name: "week",
      type: "array",
      label: "الجدول الأسبوعي",
      labels: { singular: "يوم", plural: "أيام الأسبوع" },
      admin: {
        description:
          "أضف الأيام التي تعمل فيها. اليوم غير المُضاف يُعتبر غير محدد، واليوم المُعلَّم «مغلق» يظهر مغلقًا بوضوح.",
        initCollapsed: true,
      },
      validate: (value: unknown) => {
        const rows = (value as { day?: string; closed?: boolean; allDay?: boolean; periods?: Period[] }[] | undefined) ?? [];
        if (duplicateDays(rows.map((row) => row.day))) {
          return "لا يمكن تكرار اليوم نفسه مرتين في الجدول.";
        }
        for (const row of rows) {
          if (row.closed || row.allDay) continue;
          const periods = (row.periods ?? []).filter((period) => period?.from && period?.to);
          if (periods.length === 0) {
            return "أضف فترة واحدة على الأقل، أو علّم اليوم كـ«مغلق»، أو «مفتوح ٢٤ ساعة».";
          }
        }
        return true;
      },
      fields: [
        {
          type: "row",
          fields: [
            dayField,
            {
              name: "closed",
              type: "checkbox",
              label: "مغلق",
              defaultValue: false,
              admin: { width: "30%" },
            },
            {
              name: "allDay",
              type: "checkbox",
              label: "مفتوح ٢٤ ساعة",
              defaultValue: false,
              admin: { width: "30%" },
            },
          ],
        },
        {
          name: "periods",
          type: "array",
          label: "الفترات",
          labels: { singular: "فترة", plural: "فترات" },
          admin: {
            description:
              "الفترات المنفصلة في اليوم نفسه مسموحة (مثال: 09:00–13:00 ثم 16:00–22:00). الفترة التي تمتد بعد منتصف الليل تُسجَّل كفترتين.",
            condition: (_data, siblingData) =>
              !(siblingData as { closed?: boolean; allDay?: boolean } | undefined)?.closed &&
              !(siblingData as { allDay?: boolean } | undefined)?.allDay,
          },
          validate: validatePeriodRows,
          fields: periodFields(),
        },
        localizedText({
          name: "note",
          label: "ملاحظة اليوم (اختياري)",
          description: "مثال: استراحة الصلاة. تُعرض بجانب الفترات.",
        }),
      ],
    },
    {
      name: "exceptions",
      type: "array",
      label: "استثناءات بتواريخ محددة",
      labels: { singular: "استثناء", plural: "استثناءات" },
      admin: {
        description:
          "الأعياد، الإغلاق المؤقت، أو ساعات خاصة في يوم واحد. الاستثناء يتقدّم على الجدول الأسبوعي في تاريخه.",
        initCollapsed: true,
      },
      validate: (value: unknown) => {
        const rows = (value as { closed?: boolean; periods?: Period[] }[] | undefined) ?? [];
        const seen = new Set<string>();
        for (const row of (value as { date?: string }[] | undefined) ?? []) {
          const date = row.date?.slice(0, 10);
          if (!date) continue;
          if (seen.has(date)) return "هذا التاريخ مُسجَّل مرتين — اجمع الحالة في استثناء واحد.";
          seen.add(date);
        }
        for (const row of rows) {
          if (row.closed) continue;
          const periods = (row.periods ?? []).filter((period) => period?.from && period?.to);
          if (periods.length === 0) {
            return "أضف الفترات الخاصة بذلك اليوم، أو علّمه كـ«مغلق».";
          }
        }
        return true;
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "date",
              type: "date",
              label: "التاريخ",
              required: true,
              admin: {
                width: "50%",
                date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" },
              },
            },
            {
              name: "closed",
              type: "checkbox",
              label: "مغلق طوال اليوم",
              defaultValue: false,
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "periods",
          type: "array",
          label: "فترات ذلك اليوم",
          labels: { singular: "فترة", plural: "فترات" },
          admin: {
            condition: (_data, siblingData) => !(siblingData as { closed?: boolean } | undefined)?.closed,
          },
          validate: validatePeriodRows,
          fields: periodFields(),
        },
        localizedText({
          name: "note",
          label: "ملاحظة (اختياري)",
          description: "مثال: عيد الفطر — إغلاق كامل.",
        }),
      ],
    },
    localizedText({
      name: "note",
      label: "ملاحظة عامة (اختياري)",
      description: "تظهر أسفل المواعيد إن وُجدت، مثال: ساعات رمضان تختلف.",
    }),
  ],
};
