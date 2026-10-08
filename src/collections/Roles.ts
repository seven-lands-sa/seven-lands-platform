import type { CollectionConfig, Field } from "payload";

import { permissionsFor, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { PERMISSION_GROUPS, PERMISSIONS } from "@/lib/auth/permissions";
import { permissionFieldName } from "@/lib/auth/roles";

/**
 * Permission checkboxes, generated from the catalogue and shown grouped by domain.
 * `collapsible` is a presentation wrapper only — every checkbox stays at the document root,
 * so a role's permissions remain a flat, queryable set.
 */
const permissionFields: Field[] = PERMISSION_GROUPS.flatMap((group) => [
  {
    type: "collapsible" as const,
    label: `${group.label} — ${group.permissions.length} أذونات`,
    admin: {
      initCollapsed: true,
      description: group.description,
    },
    fields: group.permissions.map((permission) => ({
      name: permissionFieldName(permission.key),
      type: "checkbox" as const,
      label: permission.label,
      defaultValue: false,
      admin: {
        description: permission.highRisk ? `⚠️ صلاحية حساسة — ${permission.description}` : permission.description,
      },
    })),
  },
]);

const permissionKeysOf = (doc: Record<string, unknown> | undefined): string[] =>
  PERMISSIONS.filter((permission) => doc?.[permissionFieldName(permission.key)] === true).map((p) => p.key);

export const Roles: CollectionConfig = {
  slug: "roles",
  labels: { singular: "دور", plural: "الأدوار والصلاحيات" },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "key", "fullAccess", "isSystem"],
    group: "النظام",
    description:
      "الأذونات تُمنح للأدوار، والأدوار تُمنح للمستخدمين. لا يعتمد النظام على أسماء الأدوار، بل على الأذونات الممنوحة لها.",
  },
  access: {
    read: requirePermission("roles.read"),
    create: requirePermission("roles.manage"),
    update: requirePermission("roles.manage"),
    /** System roles are part of the architecture and cannot be deleted, only edited. */
    delete: async ({ req, id }) => {
      const effective = await permissionsFor(req);
      if (!effective.has("roles.manage")) return false;
      if (id === undefined) return true;
      const role = await req.payload.findByID({
        collection: "roles",
        id,
        depth: 0,
        overrideAccess: true,
        req,
      });
      return role?.isSystem !== true;
    },
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      label: "اسم الدور",
      admin: { description: "الاسم الظاهر في لوحة التحكم." },
    },
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "المعرّف",
      admin: {
        description: "معرّف تقني ثابت. الأدوار الأساسية لا يمكن تغيير معرّفها.",
        position: "sidebar",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "الوصف",
      admin: { description: "شرح مختصر لمن يُمنح هذا الدور ولماذا." },
    },
    {
      name: "fullAccess",
      type: "checkbox",
      label: "صلاحية كاملة على كل النظام",
      defaultValue: false,
      admin: {
        description:
          "⚠️ يمنح كل الأذونات الحالية والمستقبلية تلقائيًا، بما فيها العمليات الحساسة. لا تُفعّلها إلا لدور مدير النظام.",
        position: "sidebar",
      },
    },
    {
      name: "isSystem",
      type: "checkbox",
      label: "دور أساسي في النظام",
      defaultValue: false,
      admin: {
        description: "الأدوار الأساسية تُنشأ مع النظام ولا يمكن حذفها.",
        readOnly: true,
        position: "sidebar",
      },
    },
    ...permissionFields,
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        // Identity of a system role is immutable: only its permissions may be tuned.
        if (operation === "update" && originalDoc?.isSystem === true) {
          data.key = originalDoc.key;
          data.isSystem = true;
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const role = await req.payload.findByID({
          collection: "roles",
          id,
          depth: 0,
          overrideAccess: true,
          req,
        });
        if (role?.isSystem === true) {
          throw new Error("لا يمكن حذف دور أساسي في النظام.");
        }
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === "create") {
          await recordAuditEvent(req.payload, {
            action: "role_created",
            summary: `إنشاء دور — ${doc.label}`,
            resourceType: "roles",
            resourceId: doc.id,
            req,
          });
          return doc;
        }

        const before = permissionKeysOf(previousDoc as Record<string, unknown> | undefined);
        const after = permissionKeysOf(doc as Record<string, unknown>);
        const added = after.filter((permission) => !before.includes(permission));
        const removed = before.filter((permission) => !after.includes(permission));
        const fullAccessChanged = (previousDoc as { fullAccess?: boolean } | undefined)?.fullAccess !== doc.fullAccess;

        if (added.length || removed.length || fullAccessChanged) {
          await recordAuditEvent(req.payload, {
            action: "role_updated",
            summary: `تعديل أذونات الدور — ${doc.label} (إضافة ${added.length}، إزالة ${removed.length})`,
            resourceType: "roles",
            resourceId: doc.id,
            req,
            details: { added, removed, fullAccess: doc.fullAccess === true },
          });
        }

        return doc;
      },
    ],
  },
};
