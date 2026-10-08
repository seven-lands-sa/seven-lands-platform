/**
 * Invariants that protect the system from locking itself out.
 *
 * The single rule implemented here: **the last active Super Admin can never be suspended,
 * deleted, or stripped of the role that grants full access.** Without it, one careless click
 * removes every account able to manage users — an unrecoverable state from inside the product.
 *
 * Deliberately not implemented: multi-person quorum, approvals, "two Super Admins must
 * confirm" flows. Over-engineering a five-seat team's CMS is its own kind of failure.
 */

import type { Payload, PayloadRequest } from "payload";
import { ValidationError } from "payload";



export const LAST_SUPER_ADMIN_MESSAGE =
  "لا يمكن تنفيذ هذه العملية: هذا آخر حساب مدير نظام نشط. أنشئ أو فعّل حساب مدير نظام آخر أولًا.";

/** Role ids that grant full access. Cached per process because roles change rarely. */
const fullAccessRoleIds = async (payload: Payload, req?: PayloadRequest): Promise<(string | number)[]> => {
  const { docs } = await payload.find({
    collection: "roles",
    where: { fullAccess: { equals: true } },
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    ...(req ? { req } : {}),
  });
  return docs.map((role) => role.id as string | number);
};

const roleIdsOf = (roles: unknown): (string | number)[] =>
  Array.isArray(roles)
    ? roles
        .map((role) => (role && typeof role === "object" ? (role as { id?: string | number }).id : role))
        .filter((id): id is string | number => id !== null && id !== undefined)
    : [];

/** How many ACTIVE users, other than `excludeUserId`, hold a full-access role. */
export async function countOtherActiveSuperAdmins(
  payload: Payload,
  excludeUserId?: string | number | null,
  req?: PayloadRequest,
): Promise<number> {
  const roleIds = await fullAccessRoleIds(payload, req);
  if (roleIds.length === 0) return Number.POSITIVE_INFINITY; // nothing to protect yet

  const { totalDocs } = await payload.count({
    collection: "users",
    where: {
      and: [
        { status: { equals: "ACTIVE" } },
        { roles: { in: roleIds } },
        ...(excludeUserId !== null && excludeUserId !== undefined
          ? [{ id: { not_equals: excludeUserId } }]
          : []),
      ],
    },
    overrideAccess: true,
    ...(req ? { req } : {}),
  });

  return totalDocs;
}

/** True when the user currently holds a full-access role. */
export async function isSuperAdminUser(
  payload: Payload,
  user: { roles?: unknown } | null | undefined,
  req?: PayloadRequest,
): Promise<boolean> {
  if (!user) return false;
  const granted = await fullAccessRoleIds(payload, req);
  const held = roleIdsOf(user.roles);
  return held.some((id) => granted.includes(id));
}

/**
 * Called from `beforeChange` on users and from `beforeDelete`.
 * Throws a ValidationError with a human explanation when the operation would remove the
 * last active Super Admin.
 */
export async function assertSuperAdminRemains(
  payload: Payload,
  args: {
    req?: PayloadRequest;
    /** The user being changed or deleted. */
    userId?: string | number | null;
    /** Was the user an active Super Admin before this operation? */
    wasSuperAdmin: boolean;
    /** Will they still be an active Super Admin afterwards? */
    staysSuperAdmin: boolean;
  },
): Promise<void> {
  const { req, userId, wasSuperAdmin, staysSuperAdmin } = args;

  // Nothing to protect: they were not a Super Admin, or they remain one.
  if (!wasSuperAdmin || staysSuperAdmin) return;

  const others = await countOtherActiveSuperAdmins(payload, userId, req);
  if (others === 0) {
    throw new ValidationError({
      errors: [{ message: LAST_SUPER_ADMIN_MESSAGE, path: "status" }],
    });
  }
}
