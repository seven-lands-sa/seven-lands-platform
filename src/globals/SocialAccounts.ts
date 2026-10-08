import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { SOCIAL_ICON_KEYS } from "@/components/ui/SocialIcon";
import { SOCIAL_PLATFORMS, defaultIconFor } from "@/lib/social/platforms";
import { localizedText } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Social accounts — حسابات التواصل الاجتماعي (§14–§17).
 *
 * One array, any platform, any order, enable/disable per row — never `instagramUrl`,
 * `facebookUrl`, `tiktokUrl` columns. The icon is a curated KEY (`instagram`), never markup:
 * the admin cannot introduce executable SVG, and the public bundle contains only the marks the
 * business actually uses.
 *
 * When the platform is chosen, the matching icon is suggested automatically (`beforeChange`); the
 * admin may still override it with any other curated mark.
 */

export const SocialAccounts: GlobalConfig = {
  slug: "social-accounts",
  label: "حسابات التواصل الاجتماعي",
  admin: {
    group: "إعدادات الموقع",
    description:
      "الحسابات التي تظهر في الموقع. لا تُضاف أي أيقونة دون حساب حقيقي — الحسابات الفارغة تُخفى تلقائيًا.",
  },
  access: globalAccess("settings.read", "settings.social.update"),
  versions: { max: 20 },
  hooks: {
    ...auditedGlobal({
      action: "social_updated",
      resourceType: "social-accounts",
      label: "حسابات التواصل الاجتماعي",
      tags: [CACHE_TAGS.socialAccounts, CACHE_TAGS.footer, CACHE_TAGS.contactSettings],
      fieldLabels: { accounts: "الحسابات" },
    }),
    beforeChange: [
      ({ data }) => {
        const accounts = (data as { accounts?: { platform?: string; iconKey?: string }[] }).accounts;
        if (Array.isArray(accounts)) {
          for (const account of accounts) {
            if (!account.iconKey) account.iconKey = defaultIconFor(account.platform);
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "accounts",
      type: "array",
      label: "الحسابات",
      labels: { singular: "حساب", plural: "حسابات" },
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "platform",
              type: "select",
              label: "المنصة",
              required: true,
              options: SOCIAL_PLATFORMS.map((platform) => ({
                label: platform.labelAr,
                value: platform.key,
              })),
              admin: { width: "40%" },
            },
            {
              name: "url",
              type: "text",
              label: "الرابط",
              required: true,
              admin: {
                width: "60%",
                description: "الرابط الكامل للحساب، مثال: https://instagram.com/sevenlands",
              },
              validate: (value: unknown) => {
                if (typeof value !== "string" || !value.trim()) return "أدخل رابط الحساب.";
                try {
                  const url = new URL(value.trim());
                  if (url.protocol !== "https:") return "يجب أن يبدأ الرابط بـ https://";
                  return true;
                } catch {
                  return "أدخل رابطًا صحيحًا يبدأ بـ https://";
                }
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "handle",
              type: "text",
              label: "المعرّف (اختياري)",
              admin: { width: "40%", description: "مثال: @sevenlands" },
            },
            {
              name: "iconKey",
              type: "text",
              label: "الأيقونة",
              admin: {
                width: "60%",
                description:
                  "تُقترح تلقائيًا من المنصة. يمكنك اختيار أيقونة أخرى من القائمة المنسّقة.",
                components: { Field: "@/components/admin/IconPicker#IconPickerField" },
              },
              /*
               * CURATED REGISTRY, enforced server-side (§15 / §11). The picker only offers valid
               * marks, but the API is not the picker: an unknown key is rejected here rather than
               * silently swapped for a fallback, so a typo or a hand-crafted request cannot put a
               * dangling icon reference into the footer.
               */
              validate: (value: unknown) => {
                if (value === undefined || value === null || value === "") return true;
                if (typeof value !== "string") return "قيمة الأيقونة غير صحيحة.";
                return SOCIAL_ICON_KEYS.includes(value as (typeof SOCIAL_ICON_KEYS)[number])
                  ? true
                  : `أيقونة غير معروفة: ${value}. اختر أيقونة من القائمة المنسّقة.`;
              },
            },
          ],
        },
        localizedText({
          name: "label",
          label: "التسمية المعروضة (اختياري)",
          description: "اتركها فارغة لاستخدام اسم المنصة الافتراضي.",
        }),
        {
          name: "enabled",
          type: "checkbox",
          label: "ظاهر في الموقع",
          defaultValue: true,
          admin: { description: "أيقونة الحساب المخفي لا تُعرض في أي مكان." },
        },
      ],
    },
  ],
};
