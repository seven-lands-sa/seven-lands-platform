import type { Field, GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { isSafeExternalUrl } from "@/lib/content/links";
import { localizedText } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Site settings — الإعدادات العامة للموقع.
 *
 * Scope (§7): identity, localization, timezone and the verified location. SEO defaults, analytics
 * and scripts are NOT here — they belong to later phases and would otherwise turn this document
 * into the "one enormous settings blob" the brief forbids.
 *
 * Structure: tabs for the admin, named GROUPS for the data. The groups (`brand`, `localization`,
 * `location`, `general`) are the contract the content adapter and the seeder read — a flat document
 * would force every consumer to know field names by heart.
 *
 * Brand artwork is an OVERRIDE, not a copy: leaving a field empty keeps the artwork the design
 * system already ships (`/brand/...`), which is exactly what the site renders today. Uploading one
 * switches the public site to the media library — no code change, no invented variant (§25).
 */

const imageField = (options: { name: string; label: string; description: string }): Field => ({
  name: options.name,
  type: "upload",
  relationTo: "media",
  label: options.label,
  admin: { description: options.description },
  /* Only public media can back a public asset — the resolver refuses private documents anyway. */
  filterOptions: { visibility: { equals: "public" } },
});

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "الإعدادات العامة",
  admin: {
    group: "إعدادات الموقع",
    description: "بيانات الشركة التي تظهر في كل صفحات الموقع. أي تعديل هنا يسري مباشرة بعد الحفظ.",
  },
  access: globalAccess("settings.read", "settings.general.update"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "settings_updated",
    resourceType: "site-settings",
    label: "الإعدادات العامة",
    /* Business hours inherit the company timezone, so they expire with this document. */
    tags: [CACHE_TAGS.siteSettings, CACHE_TAGS.businessHours],
    fieldLabels: {
      brand: "الهوية",
      localization: "اللغة والمنطقة الزمنية",
      location: "الموقع الجغرافي",
      general: "معلومات عامة",
    },
  }),
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "الهوية",
          fields: [
            {
              name: "brand",
              type: "group",
              label: "الهوية",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "nameAr",
                      type: "text",
                      label: "اسم الشركة (عربي)",
                      required: true,
                      admin: { description: "كما يُكتب في الواجهة العربية.", width: "50%" },
                    },
                    {
                      name: "nameEn",
                      type: "text",
                      label: "اسم الشركة (إنجليزي)",
                      required: true,
                      admin: { description: "الشكل اللاتيني المعتمد للاسم.", width: "50%" },
                    },
                  ],
                },
                localizedText({
                  name: "shortDescription",
                  label: "وصف مختصر",
                  description:
                    "جملة أو جملتان تُستخدم في بطاقات المشاركة والوصف العام. اتركه فارغًا في أي لغة لا تريد إظهارها بها.",
                }),
                imageField({
                  name: "logo",
                  label: "الشعار الأساسي",
                  description:
                    "اتركه فارغًا للإبقاء على الشعار الحالي في التصميم. عند الرفع يجب أن يكون الملف بظهور «عام».",
                }),
                {
                  type: "row",
                  fields: [
                    imageField({
                      name: "logoLight",
                      label: "نسخة للخلفيات الداكنة",
                      description: "اختياري — للأصل الرسمي فقط.",
                    }),
                    imageField({
                      name: "logoDark",
                      label: "نسخة للخلفيات الفاتحة",
                      description: "اختياري — للأصل الرسمي فقط.",
                    }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    imageField({
                      name: "favicon",
                      label: "أيقونة الموقع",
                      description: "اختياري — مربعة 512×512 مثاليًا.",
                    }),
                    imageField({
                      name: "defaultOgImage",
                      label: "صورة المشاركة الافتراضية",
                      description: "تُستخدم عندما لا تحدد صفحة معينة صورتها — 1200×630.",
                    }),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "اللغة والمنطقة الزمنية",
          fields: [
            {
              name: "localization",
              type: "group",
              label: "اللغة والمنطقة الزمنية",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "defaultLocale",
                      type: "select",
                      label: "لغة الموقع الافتراضية",
                      defaultValue: "ar",
                      options: [
                        { label: "العربية", value: "ar" },
                        { label: "الإنجليزية", value: "en" },
                      ],
                      admin: { width: "50%" },
                    },
                    {
                      name: "enabledLocales",
                      type: "select",
                      hasMany: true,
                      label: "اللغات المُتاحة",
                      defaultValue: ["ar", "en"],
                      options: [
                        { label: "العربية", value: "ar" },
                        { label: "الإنجليزية", value: "en" },
                      ],
                      admin: {
                        width: "50%",
                        description: "لا تُزل لغة يعتمد عليها الموقع حاليًا.",
                      },
                    },
                  ],
                },
                {
                  name: "timezone",
                  type: "text",
                  label: "المنطقة الزمنية للشركة",
                  defaultValue: "Asia/Riyadh",
                  required: true,
                  admin: {
                    description:
                      "تُستخدم لحساب «مفتوح الآن» في مواعيد العمل. لا يُستخدم توقيت الخادم أبدًا.",
                  },
                  validate: (value: unknown) => {
                    if (typeof value !== "string" || !value.trim()) return "أدخل المنطقة الزمنية.";
                    try {
                      new Intl.DateTimeFormat("en-US", { timeZone: value.trim() });
                      return true;
                    } catch {
                      return "منطقة زمنية غير معروفة. مثال صحيح: Asia/Riyadh";
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: "الموقع الجغرافي",
          fields: [
            {
              name: "location",
              type: "group",
              label: "الموقع الجغرافي",
              fields: [
                localizedText({
                  name: "display",
                  label: "العنوان المعروض",
                  description: "كما يظهر للزائر، مثال: بريدة، القصيم، المملكة العربية السعودية.",
                }),
                {
                  type: "row",
                  fields: [
                    localizedText({ name: "city", label: "المدينة" }),
                    localizedText({ name: "region", label: "المنطقة" }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "countryCode",
                      type: "text",
                      label: "رمز الدولة",
                      defaultValue: "SA",
                      maxLength: 2,
                      admin: { width: "30%", description: "رمز من حرفين، مثل SA." },
                    },
                    {
                      name: "mapsUrl",
                      type: "text",
                      label: "رابط الخريطة",
                      admin: {
                        width: "70%",
                        description: "رابط Google Maps الذي يفتح موقع الشركة.",
                      },
                      validate: (value: unknown) =>
                        !value || isSafeExternalUrl(value)
                          ? true
                          : "أدخل رابطًا صحيحًا يبدأ بـ https://",
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "latitude",
                      type: "number",
                      label: "خط العرض",
                      admin: {
                        width: "50%",
                        description: "اختياري — غير مستخدم في الواجهة حاليًا.",
                      },
                    },
                    {
                      name: "longitude",
                      type: "number",
                      label: "خط الطول",
                      admin: {
                        width: "50%",
                        description: "اختياري — غير مستخدم في الواجهة حاليًا.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "عام",
          fields: [
            {
              name: "general",
              type: "group",
              label: "معلومات عامة",
              fields: [
                localizedText({
                  name: "businessCategory",
                  label: "تصنيف النشاط",
                  description: "يُستخدم في بيانات البحث المنظَّمة وفي التعريف المختصر.",
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
