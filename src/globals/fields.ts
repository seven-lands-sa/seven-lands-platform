import type { Field } from "payload";

import { INTERNAL_ROUTES } from "@/lib/content/route-registry";
import { isSafeExternalUrl } from "@/lib/content/links";
import { isValidTime } from "@/lib/content/hours";

/**
 * Shared field factories for the Phase C globals.
 *
 * Deliberately narrow: this file exists so six globals cannot drift apart in how a localized text
 * or a link is defined. It is NOT a place to invent admin-controlled design tokens (§6) — nothing
 * here controls padding, colour, radius or animation.
 */

export const localizedText = (options: {
  name: string;
  label: string;
  description?: string;
  maxLength?: number;
  required?: boolean;
}): Field => ({
  name: options.name,
  type: "text",
  label: options.label,
  localized: true,
  required: options.required ?? false,
  ...(options.maxLength ? { maxLength: options.maxLength } : {}),
  admin: {
    description: options.description,
    /** Shows whether this field is filled per locale — the "missing translation" signal (§27). */
    placeholder: undefined,
  },
});

export const localizedTextarea = (options: {
  name: string;
  label: string;
  description?: string;
  maxLength?: number;
}): Field => ({
  name: options.name,
  type: "textarea",
  label: options.label,
  localized: true,
  ...(options.maxLength ? { maxLength: options.maxLength } : {}),
  admin: { description: options.description },
});

const routeOptions = INTERNAL_ROUTES.map((route) => ({
  label: `${route.label.ar} — ${route.label.en}`,
  value: route.key,
}));

/**
 * Destination fields for a navigation/footer entry.
 *
 * The admin picks a known page key or supplies an external URL — never a hand-typed internal path,
 * which is how broken links appear. The same shape migrates to Pages-CMS relationships later
 * (`route` becomes a relationship; `LinkTarget` and every consumer stay unchanged).
 */
export const linkFields = (): Field[] => [
  {
    name: "linkType",
    type: "radio",
    label: "نوع الوجهة",
    defaultValue: "internal",
    options: [
      { label: "صفحة داخلية", value: "internal" },
      { label: "رابط خارجي", value: "external" },
    ],
    admin: { layout: "horizontal" },
  },
  {
    name: "route",
    type: "select",
    label: "الصفحة",
    options: routeOptions,
    admin: {
      description: "اختر الصفحة من القائمة — لا حاجة لكتابة الرابط يدويًا.",
      condition: (_data, siblingData) => (siblingData as { linkType?: string } | undefined)?.linkType !== "external",
    },
    validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
      const type = (siblingData as { linkType?: string } | undefined)?.linkType;
      if (type === "external") return true;
      return value ? true : "اختر صفحة الوجهة.";
    },
  },
  {
    name: "url",
    type: "text",
    label: "الرابط الخارجي",
    admin: {
      description: "يجب أن يبدأ بـ https:// (أو http:// عند الضرورة).",
      condition: (_data, siblingData) => (siblingData as { linkType?: string } | undefined)?.linkType === "external",
    },
    validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
      const type = (siblingData as { linkType?: string } | undefined)?.linkType;
      if (type !== "external") return true;
      return isSafeExternalUrl(value)
        ? true
        : "أدخل رابطًا صحيحًا يبدأ بـ https:// — الروابط النسبية والبروتوكولات غير الآمنة مرفوضة.";
    },
  },
  {
    name: "newTab",
    type: "checkbox",
    label: "فتح في تبويب جديد",
    defaultValue: true,
    admin: {
      description: "يُفتح دائمًا مع rel=noopener noreferrer عندما يكون خارجيًا.",
      condition: (_data, siblingData) => (siblingData as { linkType?: string } | undefined)?.linkType === "external",
    },
  },
];

/** One opening period. `from`/`to` are validated as 24-hour times with `to > from` (§44). */
export const periodFields = (): Field[] => [
  {
    name: "from",
    type: "text",
    label: "من",
    required: true,
    admin: { placeholder: "09:00", width: "50%" },
    validate: (value: unknown) => (isValidTime(value) ? true : "الوقت بصيغة 24 ساعة، مثال: 09:00"),
  },
  {
    name: "to",
    type: "text",
    label: "إلى",
    required: true,
    admin: { placeholder: "13:00", width: "50%" },
    validate: (value: unknown) => (isValidTime(value) ? true : "الوقت بصيغة 24 ساعة، مثال: 13:00"),
  },
];
