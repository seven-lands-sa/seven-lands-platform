import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { auditedGlobal } from "./hooks";

/**
 * Tracking Settings — إعدادات أدوات التحليل والتتبع (Tier 1 Native Integrations)
 *
 * Scope: GA4, GTM, Google Ads, Meta Pixel, TikTok, Snap, LinkedIn, Clarity.
 * No arbitrary JS fields here — only structured, typed identifiers.
 *
 * RBAC:
 * - Read: tracking.read
 * - Update: tracking.manage
 */
export const TrackingSettings: GlobalConfig = {
  slug: "tracking-settings",
  label: "أدوات التحليل والتتبع",
  admin: {
    group: "إعدادات الموقع",
    description: "إدارة معرّفات التحليل والتتبع الرسمية (GA4، سناب، ميتا، تيك توك، وغيرها). التفعيل يخضع لموافقة الزائر.",
  },
  access: globalAccess("tracking.read", "tracking.manage"),
  versions: { max: 20 },
  hooks: auditedGlobal({
    action: "tracking_updated",
    resourceType: "tracking-settings",
    label: "أدوات التحليل والتتبع",
    tags: [CACHE_TAGS.trackingSettings],
    fieldLabels: {
      googleAnalyticsId: "معرّف Google Analytics 4",
      googleAnalyticsEnabled: "تفعيل Google Analytics 4",
      gtmContainerId: "معرّف Google Tag Manager",
      gtmEnabled: "تفعيل Google Tag Manager",
      googleAdsConversionId: "معرّف تحويلات إعلانات Google",
      googleAdsEnabled: "تفعيل تحويلات إعلانات Google",
      metaPixelId: "معرّف Meta Pixel",
      metaPixelEnabled: "تفعيل Meta Pixel",
      tiktokPixelId: "معرّف TikTok Pixel",
      tiktokPixelEnabled: "تفعيل TikTok Pixel",
      snapPixelId: "معرّف Snapchat Pixel",
      snapPixelEnabled: "تفعيل Snapchat Pixel",
      linkedinPartnerId: "معرّف LinkedIn Insight Tag",
      linkedinEnabled: "تفعيل LinkedIn Insight Tag",
      clarityProjectId: "معرّف Microsoft Clarity",
      clarityEnabled: "تفعيل Microsoft Clarity",
      environments: "بيئات التشغيل",
    },
  }),
  fields: [
    {
      name: "environments",
      type: "select",
      hasMany: true,
      defaultValue: ["production"],
      required: true,
      label: "بيئات التشغيل المسموحة",
      options: [
        { label: "الإنتاج (Production)", value: "production" },
        { label: "المعاينة / التجربة (Staging / Preview)", value: "preview" },
        { label: "التطوير المحلي (Development)", value: "development" },
      ],
      admin: {
        description: "حدد البيئات التي يُسمح لأدوات التتبع بالعمل فيها. افتراضيًا: الإنتاج فقط.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Google & Analytics",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "googleAnalyticsId",
                  type: "text",
                  label: "Google Analytics 4 Measurement ID",
                  admin: {
                    placeholder: "G-XXXXXXXXXX",
                    width: "70%",
                    description: "معرّف القياس المعتمد من Google Analytics 4.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^G-[A-Z0-9]+$/i.test(value.trim())) return true;
                    return "معرّف GA4 يجب أن يبدأ بـ G- متبوعًا بأرقام وحروف لاتينية (مثال: G-1234567890).";
                  },
                },
                {
                  name: "googleAnalyticsEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل GA4",
                  admin: { width: "30%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "gtmContainerId",
                  type: "text",
                  label: "Google Tag Manager Container ID",
                  admin: {
                    placeholder: "GTM-XXXXXXX",
                    width: "70%",
                    description: "معرّف حاوية GTM (اختياري، في حال تفضيل إدارة العلامات من خلال GTM).",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^GTM-[A-Z0-9]+$/i.test(value.trim())) return true;
                    return "معرّف GTM يجب أن يبدأ بـ GTM- متبوعًا بأرقام وحروف لاتينية (مثال: GTM-ABC1234).";
                  },
                },
                {
                  name: "gtmEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل GTM",
                  admin: { width: "30%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "googleAdsConversionId",
                  type: "text",
                  label: "Google Ads Conversion ID",
                  admin: {
                    placeholder: "AW-XXXXXXXXXX",
                    width: "70%",
                    description: "معرّف إعلانات Google لتحويلات الحملات الإعلانية.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^AW-[0-9]+$/i.test(value.trim())) return true;
                    return "معرّف Google Ads يجب أن يبدأ بـ AW- متبوعًا بأرقام (مثال: AW-123456789).";
                  },
                },
                {
                  name: "googleAdsEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل Google Ads",
                  admin: { width: "30%" },
                },
              ],
            },
          ],
        },
        {
          label: "Social Pixels (Marketing)",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "metaPixelId",
                  type: "text",
                  label: "Meta (Facebook/Instagram) Pixel ID",
                  admin: {
                    placeholder: "123456789012345",
                    width: "70%",
                    description: "معرّف بكسل ميتا الرقمي.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^[0-9]{8,24}$/.test(value.trim())) return true;
                    return "معرّف Meta Pixel يجب أن يتكون من أرقام فقط (مثال: 123456789012345).";
                  },
                },
                {
                  name: "metaPixelEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل Meta Pixel",
                  admin: { width: "30%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "snapPixelId",
                  type: "text",
                  label: "Snapchat Pixel ID",
                  admin: {
                    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    width: "70%",
                    description: "معرّف بكسل سناب شات (UUID).",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^[0-9a-f-]{16,40}$/i.test(value.trim())) return true;
                    return "معرّف Snap Pixel يجب أن يكون بصيغة معرف صحيح (UUID).";
                  },
                },
                {
                  name: "snapPixelEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل Snap Pixel",
                  admin: { width: "30%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "tiktokPixelId",
                  type: "text",
                  label: "TikTok Pixel ID",
                  admin: {
                    placeholder: "CXXXXXXXXXXXXXXXXXXX",
                    width: "70%",
                    description: "معرّف بكسل تيك توك.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^[A-Z0-9]{10,30}$/i.test(value.trim())) return true;
                    return "معرّف TikTok Pixel يجب أن يتكون من أحرف وأرقام لاتينية.";
                  },
                },
                {
                  name: "tiktokPixelEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل TikTok Pixel",
                  admin: { width: "30%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "linkedinPartnerId",
                  type: "text",
                  label: "LinkedIn Insight Tag Partner ID",
                  admin: {
                    placeholder: "1234567",
                    width: "70%",
                    description: "معرّف الشريك لشبكة لينكد إن.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^[0-9]{4,15}$/.test(value.trim())) return true;
                    return "معرّف LinkedIn Partner ID يجب أن يتكون من أرقام فقط.";
                  },
                },
                {
                  name: "linkedinEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل LinkedIn Insight",
                  admin: { width: "30%" },
                },
              ],
            },
          ],
        },
        {
          label: "Heatmaps & Clarity",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "clarityProjectId",
                  type: "text",
                  label: "Microsoft Clarity Project ID",
                  admin: {
                    placeholder: "xxxxxxxxxx",
                    width: "70%",
                    description: "معرّف مشروع Microsoft Clarity للخرائط الحرارية.",
                  },
                  validate: (value: unknown) => {
                    if (!value) return true;
                    if (typeof value === "string" && /^[a-z0-9]{8,16}$/i.test(value.trim())) return true;
                    return "معرّف Clarity يجب أن يتكون من أحرف وأرقام لاتينية.";
                  },
                },
                {
                  name: "clarityEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "تفعيل Clarity",
                  admin: { width: "30%" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
