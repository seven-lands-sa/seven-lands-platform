import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { localizedText, linkFields } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Footer — الفوتر (§22–§24).
 *
 * Structured groups only: no raw HTML, no free-form "footer code" field. Groups and their links are
 * data, so the public footer keeps its design and gains no injection surface.
 *
 * The footer is the brand line, the navigation groups, the contact block, the social row, the legal
 * links and the rights line. The defensive wording that was removed from the site
 * ("محتوى الموقع تعريف بالخدمات ولا يُعد عرضًا ملزمًا.") must never come back — it was a legal
 * disclaimer the owner rejected, not content for a CMS field.
 *
 * The copyright YEAR is rendered automatically from the site's own clock; only the owner name and
 * the rights wording are editable, so nobody has to edit "2026" every January.
 */

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "الفوتر",
  admin: {
    group: "إعدادات الموقع",
    description:
      "محتوى الفوتر: الجملة التعريفية، مجموعات الروابط، إظهار بيانات التواصل والحسابات، والروابط النظامية.",
  },
  access: globalAccess("settings.read", "settings.navigation.update"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "footer_updated",
    resourceType: "footer",
    label: "الفوتر",
    tags: [CACHE_TAGS.footer],
    fieldLabels: {
      statement: "الجملة التعريفية",
      groups: "مجموعات الروابط",
      showContact: "إظهار بيانات التواصل",
      showSocial: "إظهار حسابات التواصل",
      legal: "الروابط النظامية",
      copyright: "الحقوق",
    },
  }),
  fields: [
    localizedText({
      name: "statement",
      label: "الجملة التعريفية",
      maxLength: 220,
      description: "السطر التعريفي أسفل الشعار في الفوتر.",
    }),
    {
      name: "groups",
      type: "array",
      label: "مجموعات الروابط",
      labels: { singular: "مجموعة", plural: "مجموعات" },
      admin: {
        description: "كل مجموعة عمود في الفوتر. الترتيب هنا هو ترتيب الأعمدة.",
        initCollapsed: false,
      },
      fields: [
        localizedText({
          name: "heading",
          label: "عنوان المجموعة",
          required: true,
          maxLength: 40,
          description: "اكتب العنوان بالعربية والإنجليزية.",
        }),
        {
          name: "items",
          type: "array",
          label: "روابط المجموعة",
          labels: { singular: "رابط", plural: "روابط" },
          fields: [
            localizedText({
              name: "label",
              label: "النص المعروض",
              required: true,
              maxLength: 60,
            }),
            {
              name: "marker",
              type: "text",
              label: "رقم/رمز جانبي (اختياري)",
              maxLength: 4,
              admin: {
                description:
                  "يظهر بخط صغير بجانب الرابط — كما في عمود «المجالات» (01، 02 …). اتركه فارغًا لرابط عادي.",
              },
            },
            ...linkFields(),
            {
              name: "enabled",
              type: "checkbox",
              label: "ظاهر",
              defaultValue: true,
            },
          ],
        },
        {
          name: "enabled",
          type: "checkbox",
          label: "إظهار المجموعة",
          defaultValue: true,
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "showContact",
          type: "checkbox",
          label: "إظهار عمود التواصل",
          defaultValue: true,
          admin: { width: "50%", description: "يستخدم قنوات التواصل والموقع الجغرافي المُعرَّفين." },
        },
        {
          name: "showSocial",
          type: "checkbox",
          label: "إظهار حسابات التواصل",
          defaultValue: true,
          admin: {
            width: "50%",
            description: "لا تظهر أي أيقونة إن لم توجد حسابات مُفعّلة.",
          },
        },
      ],
    },
    {
      name: "legal",
      type: "array",
      label: "الروابط النظامية",
      labels: { singular: "رابط", plural: "روابط" },
      admin: { description: "تظهر في الشريط السفلي بجانب الحقوق.", initCollapsed: true },
      fields: [
        localizedText({ name: "label", label: "النص المعروض", required: true, maxLength: 40 }),
        ...linkFields(),
        {
          name: "enabled",
          type: "checkbox",
          label: "ظاهر",
          defaultValue: true,
        },
      ],
    },
    {
      name: "copyright",
      type: "group",
      label: "الحقوق",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "owner",
              type: "text",
              label: "اسم الجهة",
              defaultValue: "Seven Lands",
              required: true,
              admin: {
                width: "50%",
                description: "يظهر بجانب رمز الحقوق مع السنة المحسوبة تلقائيًا.",
              },
            },
            {
              name: "rightsText",
              type: "text",
              label: "نص الحقوق",
              localized: true,
              admin: { width: "50%", description: "مثال: جميع الحقوق محفوظة." },
            },
          ],
        },
      ],
    },
  ],
};
