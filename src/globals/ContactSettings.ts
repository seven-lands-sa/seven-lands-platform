import type { GlobalConfig } from "payload";

import { globalAccess } from "@/lib/auth/access";
import { CACHE_TAGS } from "@/lib/content/tags";
import { isSafeExternalUrl } from "@/lib/content/links";
import { normalizePhone, whatsAppNumber, isValidEmail } from "@/lib/content/contact";
import { localizedText } from "./fields";
import { auditedGlobal } from "./hooks";

/**
 * Contact channels — قنوات التواصل (§9/§10).
 *
 * Flexible by design: the business can hold one phone, two phones, a WhatsApp line and an email, in
 * any order, without a schema change — and without `phone1`/`phone2`/`email1` columns that rot.
 *
 * The editor types what the business publishes (`0507776891`). The href is derived from the channel
 * type, so nobody hand-writes `tel:` or `wa.me` links and no local number loses its dialling code.
 * `normalized` is stored alongside for auditing and exports.
 */

export const ContactSettings: GlobalConfig = {
  slug: "contact-settings",
  label: "بيانات التواصل",
  admin: {
    group: "إعدادات الموقع",
    description:
      "كل قناة يظهرها الموقع. حذف قناة أو تعطيلها يخفيها من الهيدر والفوتر وصفحة التواصل فورًا.",
  },
  access: globalAccess("settings.read", "settings.contact.update"),
  versions: { max: 20 },
  hooks: {
    ...auditedGlobal({
      action: "contact_updated",
      resourceType: "contact-settings",
      label: "بيانات التواصل",
      tags: [CACHE_TAGS.contactSettings, CACHE_TAGS.navigation, CACHE_TAGS.footer],
      fieldLabels: { channels: "قنوات التواصل" },
    }),
    beforeChange: [
      ({ data }) => {
        const channels = (data as { channels?: { type?: string; value?: string; normalized?: string }[] }).channels;
        if (Array.isArray(channels)) {
          for (const channel of channels) {
            const value = channel.value?.trim();
            if (!value) continue;
            if (channel.type === "phone") {
              channel.normalized = normalizePhone(value)?.e164 ?? "";
            } else if (channel.type === "whatsapp") {
              const number = whatsAppNumber(value);
              channel.normalized = number ? `+${number}` : "";
            } else if (channel.type === "email") {
              channel.normalized = isValidEmail(value) ? value : "";
            } else {
              channel.normalized = value;
            }
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "channels",
      type: "array",
      label: "قنوات التواصل",
      labels: { singular: "قناة", plural: "قنوات" },
      admin: {
        description:
          "رتّب القنوات كما تريد ظهورها. القناة الأساسية تُستخدم في أزرار التواصل السريعة.",
        initCollapsed: false,
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "type",
              type: "select",
              label: "النوع",
              required: true,
              defaultValue: "phone",
              options: [
                { label: "هاتف", value: "phone" },
                { label: "واتساب", value: "whatsapp" },
                { label: "بريد إلكتروني", value: "email" },
                { label: "أخرى", value: "custom" },
              ],
              admin: { width: "40%" },
            },
            {
              name: "value",
              type: "text",
              label: "القيمة",
              required: true,
              admin: {
                width: "60%",
                description: "رقم الهاتف أو الواتساب أو البريد، كما تُريد عرضه (مثال: 0507776891).",
              },
              validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
                const type = (siblingData as { type?: string } | undefined)?.type;
                const text = typeof value === "string" ? value.trim() : "";
                if (!text) return "أدخل القيمة.";
                if (type === "phone" || type === "whatsapp") {
                  return normalizePhone(text)
                    ? true
                    : "رقم غير صحيح. أمثلة مقبولة: 0507776891 أو +966507776891";
                }
                if (type === "email") {
                  return isValidEmail(text) ? true : "أدخل بريدًا إلكترونيًا صحيحًا.";
                }
                return isSafeExternalUrl(text) ? true : "أدخل رابطًا يبدأ بـ https://";
              },
            },
          ],
        },
        localizedText({
          name: "label",
          label: "التسمية المعروضة (اختياري)",
          description:
            "عند تعبئتها يظهر النص بدلًا من الرقم نفسه — كما في «اتصل بنا». اتركها فارغة لعرض القيمة.",
        }),
        {
          name: "hrefOverride",
          type: "text",
          label: "رابط مخصص (اختياري)",
          admin: {
            description:
              "اتركه فارغًا في أغلب الحالات — يُبنى الرابط تلقائيًا حسب النوع (tel: / wa.me / mailto:).",
          },
          validate: (value: unknown) =>
            !value || isSafeExternalUrl(value) || /^(tel:|mailto:)/.test(String(value))
              ? true
              : "استخدم https:// أو tel: أو mailto:",
        },
        {
          name: "icon",
          type: "text",
          label: "الأيقونة",
          admin: {
            description: "اتركها فارغة لاستخدام أيقونة النوع الافتراضية.",
            components: { Field: "@/components/admin/IconPicker#IconPickerField" },
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "isPrimary",
              type: "checkbox",
              label: "القناة الأساسية",
              defaultValue: false,
              admin: { width: "50%", description: "قناة واحدة فقط تكون أساسية." },
            },
            {
              name: "enabled",
              type: "checkbox",
              label: "مُفعّلة",
              defaultValue: true,
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "normalized",
          type: "text",
          label: "القيمة المعيارية",
          admin: {
            readOnly: true,
            description: "يُحسب تلقائيًا (مثال: +966507776891) ويُستخدم في الروابط والتصدير.",
          },
        },
      ],
    },
  ],
};
