import type { CollectionConfig } from "payload";

import { requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { CACHE_TAGS } from "@/lib/content/tags";
import { invalidateTags } from "@/lib/content/invalidate";
import { normalizeRedirectPath, validateRedirectDestination } from "@/lib/redirects/normalize";

/**
 * Redirects Collection — إدارة التحويلات (301 / 302 / 307 / 308)
 *
 * RBAC:
 * - read: requires 'seo.read' (or 'settings.read')
 * - create / update: requires 'seo.update'
 * - delete: requires 'seo.update'
 */
export const Redirects: CollectionConfig = {
  slug: "redirects",
  labels: { singular: "تحويل مسار", plural: "إدارة التحويلات" },
  admin: {
    useAsTitle: "from",
    defaultColumns: ["from", "to", "statusCode", "enabled", "createdAt"],
    group: "تحسين الظهور",
    description: "إدارة التحويلات الدائمة والمؤقتة للحفاظ على أرشفة محركات البحث وحماية الروابط القديمة.",
  },
  access: {
    read: requirePermission("seo.read"),
    create: requirePermission("seo.update"),
    update: requirePermission("seo.update"),
    delete: requirePermission("seo.update"),
  },
  endpoints: [
    {
      path: "/match",
      method: "get",
      handler: async (req) => {
        const url = new URL(req.url || "", "http://localhost");
        const pathParam = url.searchParams.get("path");
        if (!pathParam) {
          return Response.json({ match: null }, { headers: { "cache-control": "no-store" } });
        }
        const norm = normalizeRedirectPath(pathParam);
        const result = await req.payload.find({
          collection: "redirects",
          where: {
            and: [
              { from: { equals: norm } },
              { enabled: { equals: true } },
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        });

        if (result.docs.length > 0) {
          const doc = result.docs[0];
          return Response.json({
            match: {
              from: doc.from,
              to: doc.to,
              statusCode: Number(doc.statusCode) || 301,
            },
          }, {
            headers: {
              "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
            },
          });
        }

        return Response.json({ match: null }, { headers: { "cache-control": "public, s-maxage=60" } });
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (data.from) {
          data.from = normalizeRedirectPath(data.from);
        }
        if (typeof data.to === "string") {
          data.to = data.to.trim();
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        invalidateTags([CACHE_TAGS.redirects]);

        if (req?.user) {
          const action = operation === "create" ? "redirect_created" : "redirect_updated";
          await recordAuditEvent(req.payload, {
            action,
            summary: `${operation === "create" ? "إنشاء" : "تعديل"} تحويل من «${doc.from}» إلى «${doc.to}» (${doc.statusCode})`,
            resourceType: "redirects",
            resourceId: doc.id,
            req,
            detached: true,
          });
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        invalidateTags([CACHE_TAGS.redirects]);

        if (req?.user) {
          await recordAuditEvent(req.payload, {
            action: "redirect_deleted",
            summary: `حذف تحويل المسار من «${doc.from}» إلى «${doc.to}»`,
            resourceType: "redirects",
            resourceId: doc.id,
            req,
            detached: true,
          });
        }
      },
    ],
  },
  fields: [
    {
      name: "from",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "المسار السابق (From)",
      admin: {
        description: "المسار القديم المطلوب تحويله (مثال: /services/old-name أو /legacy-page). يُوحّد تلقائيًا.",
      },
      validate: (value: unknown) => {
        if (!value || typeof value !== "string" || !value.trim()) {
          return "المسار السابق مطلوب.";
        }
        const norm = normalizeRedirectPath(value);
        if (!norm || norm === "/") {
          return "لا يمكن تحويل الصفحة الرئيسية كمسار سابق.";
        }
        return true;
      },
    },
    {
      name: "to",
      type: "text",
      required: true,
      label: "الوجهة الجديدة (To)",
      admin: {
        description: "المسار الداخلي الجديد (يبدأ بـ /) أو رابط كامل (يبدأ بـ https://).",
      },
      validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
        const from = (siblingData as { from?: string } | undefined)?.from ?? "";
        const err = validateRedirectDestination(value, from);
        return err ? err : true;
      },
    },
    {
      name: "statusCode",
      type: "select",
      required: true,
      defaultValue: "301",
      label: "رمز التحويل (Status Code)",
      options: [
        { label: "301 — دائم (Moved Permanently)", value: "301" },
        { label: "302 — مؤقت (Found / Temporary)", value: "302" },
        { label: "307 — مؤقت محافظ (Temporary Redirect)", value: "307" },
        { label: "308 — دائم محافظ (Permanent Redirect)", value: "308" },
      ],
    },
    {
      name: "enabled",
      type: "checkbox",
      required: true,
      defaultValue: true,
      label: "مفعل",
      admin: {
        description: "عند التعطيل، يتوقف التحويل دون الحاجة لحذفه.",
      },
    },
    {
      name: "internalNotes",
      type: "text",
      label: "ملاحظات داخلية",
      admin: {
        description: "سبب التحويل أو مرجع التذكرة.",
      },
    },
  ],
};
