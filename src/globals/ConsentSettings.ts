import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { localizedText, localizedTextarea } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Consent Settings — إعدادات تفضيلات الخصوصية وملفات تعريف الارتباط
 *
 * Scope: Banner activation, bilingual messages, consent category defaults.
 * Compliant with Saudi privacy guidelines and Google Consent Mode v2.
 *
 * RBAC:
 * - Read: tracking.read
 * - Update: tracking.manage
 */
export const ConsentSettings: GlobalConfig = {
  slug: "consent-settings",
  label: "إعدادات الموافقة والخصوصية",
  admin: {
    group: "إعدادات الموقع",
    description: "إدارة لافتة ملفات تعريف الارتباط وفئات الموافقة (التحليلات والتسويق). متوافقة مع الأنظمة السعودية.",
  },
  access: globalAccess("tracking.read", "tracking.manage"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "consent_updated",
    resourceType: "consent-settings",
    label: "إعدادات الموافقة والخصوصية",
    tags: [CACHE_TAGS.consentSettings],
    fieldLabels: {
      enabled: "تفعيل لافتة الموافقة",
      bannerTitle: "عنوان اللافتة",
      bannerDescription: "نص اللافتة",
      acceptAllLabel: "زر قبول الكل",
      rejectAllLabel: "زر رفض غير الضروري",
      preferencesLabel: "زر التفضيلات",
      savePreferencesLabel: "زر حفظ الخيارات",
      cookieExpiryMonths: "مدة صلاحية ملف تعريف الارتباط (أشهر)",
    },
  }),
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      label: "تفعيل لافتة الموافقة",
      admin: {
        description: "عند التعطيل، لا تظهر لافتة الموافقة للزائر، ولا تعمل أدوات التتبع المعتمدة على الموافقة إلا عند التفعيل الصريح.",
      },
    },
    {
      name: "cookieExpiryMonths",
      type: "number",
      defaultValue: 6,
      required: true,
      label: "مدة حفظ التفضيلات (أشهر)",
      admin: {
        description: "المدة التي تُحفظ فيها تفضيلات الزائر في المتصفح قبل طلب الموافقة مجددًا (الافتراضي 6 أشهر).",
      },
      validate: (value: unknown) => {
        if (typeof value === "number" && value >= 1 && value <= 24) return true;
        return "مدة الحفظ يجب أن تكون بين شهر و24 شهرًا.";
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "نصوص اللافتة",
          fields: [
            localizedText({
              name: "bannerTitle",
              label: "عنوان اللافتة",
              description: "عنوان مختصر يظهر في أعلى اللافتة.",
              required: false,
            }),
            localizedTextarea({
              name: "bannerDescription",
              label: "نص اللافتة",
              description: "شرح استخدام ملفات تعريف الارتباط وأدوات التحليل.",
            }),
          ],
        },
        {
          label: "نصوص الأزرار",
          fields: [
            {
              type: "row",
              fields: [
                localizedText({
                  name: "acceptAllLabel",
                  label: "زر قبول الكل",
                  description: "افتراضيًا: قبول الكل / Accept All",
                }),
                localizedText({
                  name: "rejectAllLabel",
                  label: "زر رفض غير الضروري",
                  description: "افتراضيًا: رفض غير الضروري / Reject Non-Essential",
                }),
              ],
            },
            {
              type: "row",
              fields: [
                localizedText({
                  name: "preferencesLabel",
                  label: "زر التفضيلات",
                  description: "افتراضيًا: الخيارات / Preferences",
                }),
                localizedText({
                  name: "savePreferencesLabel",
                  label: "زر حفظ الخيارات",
                  description: "افتراضيًا: حفظ الخيارات / Save Preferences",
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
};
