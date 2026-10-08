import type { CollectionConfig } from "payload";

import { denyAll, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";

/**
 * Phase H — Leads Collection (العملاء المحتملون)
 *
 * Strict RBAC:
 * - read: requires 'leads.read' (Admin, Marketing, Super Admin)
 * - update: requires 'leads.update' (Admin, Super Admin)
 * - create: denyAll via UI/REST (leads created only by server handler / system)
 * - delete: Super Admin only ('roles.manage' / fullAccess)
 *
 * Permanent V1 Status Model (Amendment B):
 * - NEW: جديد
 * - CONTACTED: تم التواصل
 * - QUALIFIED: مؤهل
 * - WON: تم التعاقد
 * - LOST: ملغي / لم يتم
 * - SPAM: مزعج / سبام
 */

export const LEAD_STATUSES = [
  { label: "جديد", value: "NEW" },
  { label: "تم التواصل", value: "CONTACTED" },
  { label: "مؤهل", value: "QUALIFIED" },
  { label: "تم التعاقد", value: "WON" },
  { label: "ملغي / لم يتم", value: "LOST" },
  { label: "مزعج / سبام", value: "SPAM" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "عميل محتمل", plural: "العملاء المحتملون" },
  admin: {
    useAsTitle: "reference",
    defaultColumns: ["reference", "name", "phone", "company", "status", "createdAt"],
    group: "العملاء المحتملون",
    description: "طلبات المشاريع والتواصل الواردة من الموقع.",
  },
  access: {
    read: requirePermission("leads.read"),
    update: requirePermission("leads.update"),
    create: denyAll, // Created via system / local API only
    delete: requirePermission("roles.manage"), // Super Admin only
  },
  hooks: {
    afterChange: [
      async ({ operation, doc, previousDoc, req }) => {
        if (operation === "update" && req.user && doc.status !== previousDoc?.status) {
          await recordAuditEvent(req.payload, {
            action: "lead_status_changed",
            summary: `تغيير حالة العميل ${doc.reference} من ${previousDoc?.status} إلى ${doc.status}`,
            resourceType: "leads",
            resourceId: doc.id,
            req,
          });
        }
      },
    ],
  },
  fields: [
    {
      name: "reference",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "الرقم المرجعي",
      admin: {
        readOnly: true,
        description: "رقم مرجعي فريد تلقائي، مثل SL-20261009-XXXX",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "NEW",
      index: true,
      label: "الحالة",
      options: LEAD_STATUSES.map((s) => ({ label: s.label, value: s.value })),
    },
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "الاسم",
        },
        {
          name: "company",
          type: "text",
          label: "الشركة / الجهة",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          required: true,
          index: true,
          label: "رقم الجوال",
        },
        {
          name: "email",
          type: "email",
          label: "البريد الإلكتروني",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "channel",
          type: "select",
          required: true,
          label: "قناة التواصل المفضلة",
          options: [
            { label: "واتساب", value: "whatsapp" },
            { label: "اتصال هاتفي", value: "call" },
          ],
        },
        {
          name: "timeline",
          type: "select",
          label: "الإطار الزمني",
          options: [
            { label: "فوري / عاجل", value: "now" },
            { label: "خلال هذا الربع", value: "quarter" },
            { label: "لاحقاً", value: "later" },
            { label: "غير محدد", value: "unsure" },
          ],
        },
      ],
    },
    {
      name: "mode",
      type: "select",
      required: true,
      defaultValue: "brief",
      label: "نوع النموذج",
      options: [
        { label: "نموذج المشروع الكامل", value: "brief" },
        { label: "تواصل سريع", value: "quick" },
      ],
    },
    {
      name: "lands",
      type: "json",
      label: "المجالات المطلوبة",
      admin: {
        description: "مصفوفة بمفاتيح المجالات المطلوبة في الطلب.",
      },
    },
    {
      name: "goal",
      type: "textarea",
      required: true,
      label: "الهدف والاحتياج",
    },
    {
      name: "notes",
      type: "textarea",
      label: "ملاحظات إضافية من العميل",
    },
    {
      name: "consent",
      type: "checkbox",
      required: true,
      defaultValue: true,
      label: "موافقة الخصوصية",
    },
    {
      name: "locale",
      type: "select",
      required: true,
      defaultValue: "ar",
      label: "لغة التقديم",
      options: [
        { label: "العربية", value: "ar" },
        { label: "English", value: "en" },
      ],
    },
    {
      type: "collapsible",
      label: "بيانات التتبع والحملات (Marketing & Attribution)",
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "campaign",
          type: "json",
          label: "بيانات الحملة والإحالة",
        },
        {
          name: "ipHash",
          type: "text",
          label: "بصمة الطلب (Rate Limit / Hash)",
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: "internalNotes",
      type: "array",
      label: "ملاحظات الفريق الداخلي",
      admin: {
        description: "سجل الملاحظات والمتابعات الداخلية لفريق العمل.",
      },
      fields: [
        {
          name: "text",
          type: "textarea",
          required: true,
          label: "الملاحظة",
        },
        {
          name: "author",
          type: "text",
          label: "الكاتب",
        },
        {
          name: "createdAt",
          type: "date",
          label: "التاريخ",
        },
      ],
    },
  ],
};
