import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { INTERNAL_ROUTES } from "@/lib/content/route-registry";
import { localizedText, linkFields } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Header navigation and its primary action — التنقل الرئيسي وزر الإجراء (§18–§21).
 *
 * The design owns the treatment: this document owns labels, destinations, order and visibility.
 * There is no field for spacing, colour, size or animation (§6) — an admin cannot break the header
 * layout from here.
 *
 * Child items (dropdowns) are intentionally absent: the current header has no dropdown design, so
 * a nested level would be data the interface cannot honour. The `items` array is shaped so a future
 * design change can add `children` without migrating anything.
 */

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "الهيدر والتنقل",
  admin: {
    group: "إعدادات الموقع",
    description:
      "روابط القائمة الرئيسية في الهيدر وزر الإجراء الأساسي. الشكل النهائي ثابت من التصميم — التحكم هنا للمحتوى والترتيب فقط.",
  },
  access: globalAccess("settings.read", "settings.navigation.update"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "navigation_updated",
    resourceType: "navigation",
    label: "الهيدر والتنقل",
    tags: [CACHE_TAGS.navigation],
    fieldLabels: { header: "الهيدر", cta: "زر الإجراء" },
  }),
  fields: [
    {
      name: "header",
      type: "group",
      label: "الهيدر",
      fields: [
        {
          name: "items",
          type: "array",
          label: "روابط القائمة",
          labels: { singular: "رابط", plural: "روابط" },
          admin: {
            description:
              `المسارات المتاحة حاليًا: ${INTERNAL_ROUTES.filter((route) => route.kind === "page")
                .map((route) => route.label.ar)
                .join("، ")}. الترتيب هنا هو ترتيب الظهور — اسحب الصف لتغييره.`,
            initCollapsed: false,
          },
          fields: [
            localizedText({
              name: "label",
              label: "النص المعروض",
              required: true,
              maxLength: 40,
              description: "اكتب النص بالعربية والإنجليزية — لا يظهر نص عربي في الواجهة الإنجليزية.",
            }),
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
          name: "cta",
          type: "group",
          label: "زر الإجراء الأساسي",
          admin: {
            description:
              "الزر البارز في الهيدر. تغيّر النص والوجهة والظهور — أما الشكل فيبقى كما هو في التصميم.",
          },
          fields: [
            {
              name: "enabled",
              type: "checkbox",
              label: "ظاهر",
              defaultValue: true,
            },
            localizedText({
              name: "label",
              label: "نص الزر",
              maxLength: 30,
              description: "مثال: ابدأ مشروعك / Start a project",
            }),
            ...linkFields(),
          ],
        },
      ],
    },
  ],
};
