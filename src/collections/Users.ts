import type { CollectionConfig } from "payload";

import { isActiveUser, requirePermission, requireSelfOr } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { assertSuperAdminRemains, isSuperAdminUser } from "@/lib/auth/invariants";
import { publicError } from "@/lib/errors";

/**
 * Secure cookies in production. The sandbox runs a TLS-less production build for verification,
 * so an explicit, clearly-named escape hatch exists for that case only — it must never be set
 * in a real deployment.
 */
const secureCookies =
  process.env.NODE_ENV === "production" && process.env.PAYLOAD_ALLOW_INSECURE_COOKIES !== "true";

/** The fields the audit trail reports on for this collection. */
type AuditedField = "name" | "email" | "status" | "roles" | "preferredAdminLanguage";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "مستخدم", plural: "المستخدمون" },
  auth: {
    /** 2 hours — a compromised session has a bounded life. */
    tokenExpiration: 60 * 60 * 2,
    /** Brute-force protection: 5 failed attempts lock the account for 10 minutes. */
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    /** Server-side sessions, so suspending a user can revoke access immediately. */
    useSessions: true,
    cookies: {
      sameSite: "Lax",
      secure: secureCookies,
    },
    forgotPassword: {
      /** Payload throttles reset requests per account; the default is kept. */
      minRequestInterval: 15_000,
    },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "status", "roles", "lastLoginAt"],
    group: "النظام",
    description: "حسابات الوصول إلى لوحة التحكم والأدوار الممنوحة لكل حساب.",
  },
  access: {
    /** Anyone active may open the admin panel; content-level access decides what they see. */
    admin: ({ req }) => isActiveUser(req.user),
    read: requireSelfOr("users.read"),
    create: requirePermission("users.create"),
    update: requireSelfOr("users.update"),
    delete: requirePermission("users.delete"),
    /** Unlocking a brute-force lockout is an account-security action. */
    unlock: requirePermission("users.suspend"),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "الاسم",
    },
    {
      name: "roles",
      type: "relationship",
      relationTo: "roles",
      hasMany: true,
      required: true,
      label: "الأدوار",
      access: {
        /**
         * Assigning roles is the privilege-escalation path, so it is gated on create as well as
         * update — otherwise `users.create` alone would let someone mint a Super Admin. Payload's
         * first-user bootstrap runs with `overrideAccess: true`, so seeding the initial account is
         * unaffected.
         */
        create: requirePermission("users.update"),
        update: requirePermission("users.update"),
      },
      admin: {
        description: "الأذونات الفعلية تُحسب من مجموع أدوار المستخدم.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "ACTIVE",
      label: "الحالة",
      options: [
        { label: "نشط", value: "ACTIVE" },
        { label: "موقوف", value: "SUSPENDED" },
      ],
      access: {
        /**
         * Suspension is its own high-risk permission, separate from editing a user. Gated on create
         * too, so a user cannot be created pre-suspended by someone who may not suspend.
         */
        create: requirePermission("users.suspend"),
        update: requirePermission("users.suspend"),
      },
      admin: {
        description: "الحساب الموقوف لا يستطيع الدخول، وتُلغى جلساته الحالية فورًا.",
      },
    },
    {
      name: "preferredAdminLanguage",
      type: "select",
      label: "لغة لوحة التحكم",
      defaultValue: "ar",
      options: [
        { label: "العربية", value: "ar" },
        { label: "English", value: "en" },
      ],
      admin: {
        description: "لغة واجهة لوحة التحكم لهذا المستخدم — لا علاقة لها بلغة محتوى الموقع.",
        position: "sidebar",
      },
    },
    {
      name: "lastLoginAt",
      type: "date",
      label: "آخر دخول",
      admin: {
        readOnly: true,
        position: "sidebar",
        date: { displayFormat: "dd/MM/yyyy HH:mm" },
        description: "يُحدَّث تلقائيًا عند كل تسجيل دخول ناجح.",
      },
    },
  ],
  hooks: {
    /**
     * NOTE ON ORDER: Payload runs `beforeLogin` *after* the password has been verified, so
     * refusing a suspended account here cannot be used to discover which emails exist — an
     * attacker without valid credentials receives the same generic error as always.
     */
    beforeLogin: [
      async ({ user }) => {
        if (user.status !== "ACTIVE") {
          throw publicError("هذا الحساب موقوف. تواصل مع مدير النظام لإعادة تنشيطه.", 403);
        }
        return user;
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        await req.payload.update({
          collection: "users",
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          depth: 0,
          overrideAccess: true,
          req,
        });

        await recordAuditEvent(req.payload, {
          action: "login",
          summary: `تسجيل دخول — ${user.email ?? user.id}`,
          resourceType: "users",
          resourceId: user.id,
          actorID: user.id,
          actorEmail: user.email ?? null,
          req,
        });

        return user;
      },
    ],
    afterLogout: [
      async ({ req }) => {
        /**
         * Payload does not pass `user` to this hook (`AfterLogoutHook` = { collection, context, req }),
         * but `req.user` is guaranteed: the logout operation throws before running hooks if the
         * request carries no user.
         */
        const user = req.user as { id: string | number; email?: string | null } | null;
        if (!user) return;
        await recordAuditEvent(req.payload, {
          action: "logout",
          summary: `تسجيل خروج — ${user.email ?? user.id}`,
          resourceType: "users",
          resourceId: user.id,
          actorID: user.id,
          actorEmail: user.email ?? null,
          req,
        });
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        // Suspending an account must end its live sessions, not merely its next login.
        if (operation === "update" && data.status === "SUSPENDED" && originalDoc?.status !== "SUSPENDED") {
          data.sessions = [];
        }

        if (operation === "update" || operation === "create") {
          const wasSuperAdmin =
            operation === "update" ? await isSuperAdminUser(req.payload, originalDoc, req) : false;
          const nextRoles = data.roles ?? originalDoc?.roles ?? [];
          const nextStatus = (data.status ?? originalDoc?.status ?? "ACTIVE") as string;
          const staysSuperAdmin =
            nextStatus === "ACTIVE" &&
            (await isSuperAdminUser(req.payload, { roles: nextRoles }, req));

          await assertSuperAdminRemains(req.payload, {
            req,
            userId: originalDoc?.id,
            wasSuperAdmin,
            staysSuperAdmin,
          });
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === "create") {
          await recordAuditEvent(req.payload, {
            action: "user_created",
            summary: `إنشاء مستخدم — ${doc.email}`,
            resourceType: "users",
            resourceId: doc.id,
            req,
          });
          return doc;
        }

        const changed = (field: AuditedField) =>
          JSON.stringify(previousDoc?.[field] ?? null) !== JSON.stringify(doc?.[field] ?? null);

        if (changed("status")) {
          const suspended = doc.status === "SUSPENDED";
          await recordAuditEvent(req.payload, {
            action: suspended ? "user_suspended" : "user_reactivated",
            summary: `${suspended ? "إيقاف" : "إعادة تنشيط"} المستخدم — ${doc.email}`,
            resourceType: "users",
            resourceId: doc.id,
            req,
          });
        } else if (changed("roles")) {
          await recordAuditEvent(req.payload, {
            action: "role_changed",
            summary: `تغيير أدوار المستخدم — ${doc.email}`,
            resourceType: "users",
            resourceId: doc.id,
            req,
          });
        } else if (changed("name") || changed("email") || changed("preferredAdminLanguage")) {
          await recordAuditEvent(req.payload, {
            action: "user_updated",
            summary: `تعديل بيانات المستخدم — ${doc.email}`,
            resourceType: "users",
            resourceId: doc.id,
            req,
          });
        }

        return doc;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({
          collection: "users",
          id,
          depth: 0,
          overrideAccess: true,
          req,
        });
        const wasSuperAdmin = await isSuperAdminUser(req.payload, user, req);
        await assertSuperAdminRemains(req.payload, {
          req,
          userId: id,
          wasSuperAdmin,
          staysSuperAdmin: false,
        });
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await recordAuditEvent(req.payload, {
          action: "user_deleted",
          summary: `حذف مستخدم — ${doc.email}`,
          resourceType: "users",
          resourceId: doc.id,
          req,
        });
      },
    ],
  },
};
