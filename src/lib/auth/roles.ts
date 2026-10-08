/**
 * Roles: the bridge between a user and the permission catalogue.
 *
 * A role is data, not a TypeScript enum. The five system roles below are seeded as ordinary
 * documents — the authorization code never switches on their `key`, it only reads
 * `fullAccess` + `permissions`. That is what keeps custom roles possible later without
 * touching a single access rule.
 */

import { ALL_PERMISSIONS, HIGH_RISK_PERMISSIONS, PERMISSIONS, type Permission } from "./permissions";

export type RoleLike = {
  id?: string | number;
  key?: string | null;
  label?: string | null;
  fullAccess?: boolean | null;
  permissions?: (Permission | null)[] | null;
};

export type SystemRoleKey = "super_admin" | "admin" | "editor" | "marketing" | "viewer";

export type SystemRoleSeed = {
  key: SystemRoleKey;
  label: string;
  description: string;
  /** Grants every permission, including ones added by later phases. */
  fullAccess: boolean;
  permissions: Permission[];
};

/**
 * High-risk permissions that are nevertheless part of the ADMIN brief, so they are granted by
 * default. Each one is a deliberate delegation, not an oversight:
 *
 *   · leads.read / leads.export — the Admin role's description covers customers, and these stay
 *     inside the mini-CRM scope; every export is recorded in the audit log.
 *   · settings.update — retained for system-level website settings that are not implemented yet
 *     (SEO defaults, analytics, custom scripts). Phase C's business settings are separate,
 *     lower-risk permissions and reach ADMIN automatically through the catalogue, not through
 *     this list — see `ADMIN_WITHHELD` below.
 *
 * Everything else that the catalogue flags `highRisk` is withheld from ADMIN by default (§10):
 * it can weaken security, run third-party code, destroy content or expose the security record.
 * A Super Admin can still grant any of them through a custom role.
 */
const ADMIN_HIGH_RISK_ALLOWED: Permission[] = ["leads.read", "leads.export", "settings.update"];

/**
 * Derived, not hand-written: every permission the catalogue marks `highRisk` is Super-Admin-only
 * unless it appears above. A future phase that adds a high-risk permission therefore cannot
 * silently grant it to ADMIN.
 */
const ADMIN_WITHHELD: Permission[] = HIGH_RISK_PERMISSIONS.filter(
  (permission) => !ADMIN_HIGH_RISK_ALLOWED.includes(permission),
);

export const SYSTEM_ROLES: readonly SystemRoleSeed[] = [
  {
    key: "super_admin",
    label: "مدير النظام",
    description:
      "صلاحية كاملة على كل أجزاء النظام، بما فيها العمليات الحساسة وإدارة المستخدمين والأدوار.",
    fullAccess: true,
    permissions: [],
  },
  {
    key: "admin",
    label: "مدير",
    description:
      "إدارة كاملة لمحتوى الموقع والتسويق والعملاء المحتملين والإعدادات، دون صلاحيات النظام والأمان الحساسة.",
    fullAccess: false,
    permissions: ALL_PERMISSIONS.filter((permission) => !ADMIN_WITHHELD.includes(permission)),
  },
  {
    key: "editor",
    label: "محرر",
    description: "تحرير المحتوى ونشره: الصفحات والخدمات والأعمال والمقالات والوسائط.",
    fullAccess: false,
    permissions: [
      "pages.read",
      "pages.create",
      "pages.update",
      "pages.publish",
      "services.read",
      "services.update",
      "services.publish",
      "projects.read",
      "projects.update",
      "projects.publish",
      "insights.read",
      "insights.update",
      "insights.publish",
      "media.read",
      "media.upload",
      /* Phase D (§30): an editor must be able to finish the job they started — describe an asset and
         decide whether it is part of the published site. Uploads still default to private, and a
         public asset only becomes reachable once content references it. */
      "media.update",
      "media.visibility",
      /* NOT granted: media.delete (high risk, Super Admin) and media.svg_upload (high risk). */
      "seo.read",
      "analytics.read",
      "settings.read",
    ],
  },
  {
    key: "marketing",
    label: "تسويق",
    description:
      "المحتوى والظهور في محركات البحث والتحليلات وأدوات التتبع والبكسل، مع قراءة نتائج الحملات.",
    fullAccess: false,
    permissions: [
      "pages.read",
      "services.read",
      "projects.read",
      "insights.read",
      "insights.update",
      "insights.publish",
      "media.read",
      "media.upload",
      "media.update",
      "media.visibility",
      "seo.read",
      "seo.update",
      "analytics.read",
      "tracking.read",
      "tracking.manage",
      "leads.read",
      "leads.export",
      "settings.read",
      /* Phase C (§30): marketing owns how the business is reachable and followed. Scope is
         limited to contact channels and social accounts — identity, navigation, footer and
         business hours stay with Admin. */
      "settings.contact.update",
      "settings.social.update",
    ],
  },
  {
    key: "viewer",
    label: "مشاهد",
    description: "اطّلاع فقط على المحتوى والتقارير، دون أي تعديل.",
    fullAccess: false,
    permissions: [
      "pages.read",
      "services.read",
      "projects.read",
      "insights.read",
      "media.read",
      "seo.read",
      "analytics.read",
      "settings.read",
    ],
  },
] as const;

/** True when a role grants everything, including permissions introduced by later phases. */
export function isFullAccessRole(role: { fullAccess?: boolean | null } | null | undefined): boolean {
  return role?.fullAccess === true;
}

/**
 * Payload field names cannot contain dots (dot notation means "nested path"), so each
 * permission is stored as a boolean checkbox named `resource_action`. This mapping is the only
 * place that translation happens.
 */
/**
 * Payload field names may not contain dots, so a permission key becomes a column name:
 * `settings.read` → `settings_read`, `settings.contact.update` → `settings_contact_update`.
 *
 * EVERY dot is replaced (Phase C introduced three-part keys). Single-dot keys are unaffected, so
 * role documents written by Phase B keep resolving to the same permissions.
 */
export function permissionFieldName(permission: Permission): string {
  return permission.replace(/\./g, "_");
}

/**
 * Resolves the effective permission set from real `roles` documents.
 * A full-access role short-circuits to every permission in the catalogue.
 */
export function permissionsFromRoleDocs(docs: readonly Record<string, unknown>[]): Set<Permission> {
  const effective = new Set<Permission>();
  if (!docs.length) return effective;

  if (docs.some((doc) => doc.fullAccess === true)) {
    for (const permission of ALL_PERMISSIONS) effective.add(permission);
    return effective;
  }

  for (const doc of docs) {
    for (const permission of PERMISSIONS) {
      if (doc[permissionFieldName(permission.key)] === true) effective.add(permission.key);
    }
  }
  return effective;
}

/**
 * Resolves the effective permission set for a set of roles.
 * A full-access role short-circuits to every permission in the catalogue.
 */
export function permissionsFromRoles(roles: readonly RoleLike[] | null | undefined): Set<Permission> {
  const effective = new Set<Permission>();
  if (!roles?.length) return effective;

  if (roles.some(isFullAccessRole)) {
    for (const permission of ALL_PERMISSIONS) effective.add(permission);
    return effective;
  }

  for (const role of roles) {
    for (const permission of role.permissions ?? []) {
      if (permission) effective.add(permission);
    }
  }
  return effective;
}

/** Convenience for tests and documentation: the permission list a system role grants. */
export function systemRolePermissions(key: SystemRoleKey): Permission[] {
  const role = SYSTEM_ROLES.find((candidate) => candidate.key === key);
  if (!role) return [];
  return role.fullAccess ? [...ALL_PERMISSIONS] : [...role.permissions];
}
