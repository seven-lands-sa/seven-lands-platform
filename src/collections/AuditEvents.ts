import type { CollectionConfig } from "payload";

import { denyAll, requirePermission } from "@/lib/auth/access";

/**
 * The audit log is intentionally write-once.
 *
 * `create`, `update` and `delete` are denied for *every* caller — including a Super Admin —
 * so the history cannot be rewritten from the UI or the API. The only writer is
 * `recordAuditEvent()`, which runs as the system. A Super Admin can read and export it.
 */
export const AuditEvents: CollectionConfig = {
  slug: "audit-events",
  labels: { singular: "حدث", plural: "سجل الأحداث" },
  admin: {
    useAsTitle: "summary",
    defaultColumns: ["occurredAt", "action", "actorEmail", "summary"],
    group: "النظام",
    description:
      "سجل غير قابل للتعديل: من فعل ماذا ومتى. لا يحتوي على كلمات المرور أو الرموز السرية.",
    /** No create button: entries are produced by the system only. */
    enableRichTextRelationship: false,
  },
  access: {
    read: requirePermission("audit.read"),
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    {
      name: "action",
      type: "select",
      required: true,
      index: true,
      label: "الحدث",
      options: [
        { label: "تسجيل دخول", value: "login" },
        { label: "محاولة دخول فاشلة", value: "login_failed" },
        { label: "تسجيل خروج", value: "logout" },
        { label: "إنشاء مستخدم", value: "user_created" },
        { label: "تعديل مستخدم", value: "user_updated" },
        { label: "إيقاف مستخدم", value: "user_suspended" },
        { label: "إعادة تنشيط مستخدم", value: "user_reactivated" },
        { label: "حذف مستخدم", value: "user_deleted" },
        { label: "تغيير أدوار مستخدم", value: "role_changed" },
        { label: "إنشاء دور", value: "role_created" },
        { label: "تعديل أذونات دور", value: "role_updated" },
        { label: "حذف دور", value: "role_deleted" },
        { label: "تعديل إعدادات الموقع", value: "settings_updated" },
        { label: "تعديل بيانات التواصل", value: "contact_updated" },
        { label: "تعديل مواعيد العمل", value: "hours_updated" },
        { label: "تعديل حسابات التواصل الاجتماعي", value: "social_updated" },
        { label: "تعديل الهيدر والتنقل", value: "navigation_updated" },
        { label: "تعديل الفوتر", value: "footer_updated" },
        { label: "تغيير ظهور وسيط", value: "media_visibility_changed" },
        /* Phase D — media library lifecycle. */
        { label: "رفع وسيط", value: "media_uploaded" },
        { label: "تعديل بيانات وسيط", value: "media_updated" },
        { label: "استبدال ملف وسيط", value: "media_binary_replaced" },
        { label: "حذف وسيط", value: "media_deleted" },
        { label: "منع حذف وسيط مستخدم", value: "media_delete_blocked" },
        /* Phase E — page composition lifecycle. */
        { label: "إنشاء صفحة", value: "page_created" },
        { label: "تعديل صفحة", value: "page_updated" },
        { label: "نشر صفحة", value: "page_published" },
        { label: "إلغاء نشر صفحة", value: "page_unpublished" },
        { label: "أرشفة صفحة", value: "page_archived" },
        { label: "استعادة نسخة صفحة", value: "page_restored" },
        { label: "تغيير رابط صفحة", value: "page_slug_changed" },
        { label: "إعادة ترتيب أقسام صفحة", value: "page_blocks_reordered" },
        { label: "إنشاء مجال", value: "service_created" },
        { label: "تعديل مجال", value: "service_updated" },
        { label: "نشر مجال", value: "service_published" },
        { label: "إلغاء نشر مجال", value: "service_unpublished" },
        { label: "إنشاء عمل", value: "project_created" },
        { label: "تعديل عمل", value: "project_updated" },
        { label: "نشر عمل", value: "project_published" },
        { label: "إلغاء نشر عمل", value: "project_unpublished" },
        { label: "إنشاء مقال", value: "insight_created" },
        { label: "تعديل مقال", value: "insight_updated" },
        { label: "نشر مقال", value: "insight_published" },
        { label: "إلغاء نشر مقال", value: "insight_unpublished" },
        /* Phase H — leads lifecycle. */
        { label: "تسجيل عميل محتمل", value: "lead_created" },
        { label: "تغيير حالة عميل محتمل", value: "lead_status_changed" },
        { label: "إضافة ملاحظة على عميل محتمل", value: "lead_note_added" },
        { label: "تصدير العملاء المحتملين", value: "lead_exported" },
      ],
    },
    {
      name: "summary",
      type: "text",
      required: true,
      label: "الملخّص",
    },
    {
      name: "occurredAt",
      type: "date",
      required: true,
      index: true,
      label: "التوقيت",
      admin: { date: { displayFormat: "dd/MM/yyyy HH:mm:ss" } },
    },
    {
      name: "actor",
      type: "relationship",
      relationTo: "users",
      label: "المنفّذ",
      admin: { description: "الحساب الذي نفّذ العملية (قد يكون فارغًا للعمليات الآلية)." },
    },
    {
      name: "actorEmail",
      type: "text",
      label: "بريد المنفّذ",
      admin: { description: "نسخة ثابتة من البريد وقت الحدث، تبقى صحيحة حتى لو حُذف الحساب." },
    },
    {
      name: "resourceType",
      type: "select",
      label: "نوع المورد",
      options: [
        { label: "مستخدم", value: "users" },
        { label: "دور", value: "roles" },
        { label: "سجل", value: "audit" },
        { label: "النظام", value: "system" },
        { label: "إعدادات الموقع", value: "site-settings" },
        { label: "بيانات التواصل", value: "contact-settings" },
        { label: "مواعيد العمل", value: "business-hours" },
        { label: "حسابات التواصل", value: "social-accounts" },
        { label: "الهيدر والتنقل", value: "navigation" },
        { label: "الفوتر", value: "footer" },
        { label: "وسيط", value: "media" },
        { label: "صفحة", value: "pages" },
        { label: "مجال", value: "services" },
        { label: "عمل", value: "projects" },
        { label: "مقال", value: "insights" },
        { label: "عميل محتمل", value: "leads" },
      ],
    },
    {
      name: "resourceId",
      type: "text",
      label: "معرّف المورد",
    },
    {
      name: "context",
      type: "json",
      label: "سياق الطلب",
      admin: { description: "IP، المتصفح، المسار. لا تُخزَّن هنا أي بيانات سرية." },
    },
  ],
  timestamps: true,
};
