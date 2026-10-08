/**
 * Access-control helpers for Payload collections, Local API calls and custom endpoints.
 *
 * Every rule funnels through `resolvePermissions`, so there is exactly one place where
 * "user → roles → permissions" happens. Collections stay readable: they declare
 * `requirePermission("pages.publish")`, not an authorization algorithm.
 */

import type { Payload, PayloadRequest, TypedUser } from "payload";

import { type Permission } from "./permissions";
import { permissionsFromRoleDocs, type RoleLike } from "./roles";

/** The subset of a user document this module needs. */
export type AuthUser = {
  id?: string | number;
  email?: string | null;
  status?: string | null;
  roles?: (string | number | RoleLike)[] | null;
};

const EMPTY: ReadonlySet<Permission> = new Set<Permission>();

/** A user may act only while ACTIVE — suspending someone revokes their authority immediately. */
export function isActiveUser(user: unknown): boolean {
  return Boolean(user) && (user as AuthUser).status === "ACTIVE";
}

type PermissionCache = Map<string, ReadonlySet<Permission>>;

const cacheOf = (context: unknown): PermissionCache => {
  const holder = context as { __permissions?: PermissionCache } | undefined;
  if (!holder) return new Map();
  holder.__permissions ??= new Map();
  return holder.__permissions;
};

/**
 * The one authoritative resolution path: user → roles → permissions.
 *
 * `overrideAccess: true` here is deliberate and documented (see AUTH_ARCHITECTURE.md §Local
 * API audit): role *definitions* must never be unreadable, otherwise a roles.read restriction
 * would lock every administrator out of their own system. The read is limited to the caller's
 * own role ids, at depth 0, and the result is memoised per request.
 */
export async function resolvePermissions(
  payload: Payload,
  user: AuthUser | null | undefined,
  cache?: PermissionCache,
  req?: PayloadRequest,
): Promise<ReadonlySet<Permission>> {
  if (!isActiveUser(user)) return EMPTY;

  const key = String(user?.id ?? "anonymous");
  const cached = cache?.get(key);
  if (cached) return cached;

  const roleIds = (user?.roles ?? [])
    .map((role) => (role && typeof role === "object" ? role.id : role))
    .filter((id): id is string | number => id !== null && id !== undefined);

  let effective: ReadonlySet<Permission> = EMPTY;

  if (roleIds.length > 0) {
    const { docs } = await payload.find({
      collection: "roles",
      where: { id: { in: roleIds } },
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
      ...(req ? { req } : {}),
    });
    effective = permissionsFromRoleDocs(docs as unknown as Record<string, unknown>[]);
  }

  cache?.set(key, effective);
  return effective;
}

/** Permissions of the user attached to the current request (memoised per request). */
export async function permissionsFor(req: PayloadRequest): Promise<ReadonlySet<Permission>> {
  return resolvePermissions(req.payload, req.user as AuthUser | null, cacheOf(req.context), req);
}

/**
 * Structural shape shared by Payload's collection-level `AccessArgs` and field-level
 * `FieldAccessArgs` — their `id` types differ (`number` vs `string | number`), so a helper typed
 * against one cannot be assigned to the other. Typing the argument structurally lets a single
 * helper guard a whole collection *and* one field, which §11 (server-side enforcement everywhere)
 * needs: hiding a field in the UI is not authorization.
 */
type AccessArgsLike = { req: PayloadRequest; id?: string | number };

/** True when the request carries an active, authenticated user. */
export const requireAuthenticated = async ({ req }: AccessArgsLike): Promise<boolean> =>
  isActiveUser(req.user);

/** Requires one specific permission. Use this for every protected operation. */
export const requirePermission =
  (permission: Permission) =>
  async ({ req }: AccessArgsLike): Promise<boolean> =>
    (await permissionsFor(req)).has(permission);

/** Requires at least one of the listed permissions. */
export const requireAnyPermission =
  (...permissions: Permission[]) =>
  async ({ req }: AccessArgsLike): Promise<boolean> => {
    const effective = await permissionsFor(req);
    return permissions.some((permission) => effective.has(permission));
  };

/** Requires every listed permission. */
export const requireAllPermissions =
  (...permissions: Permission[]) =>
  async ({ req }: AccessArgsLike): Promise<boolean> => {
    const effective = await permissionsFor(req);
    return permissions.every((permission) => effective.has(permission));
  };

/**
 * Allows a user to act on their own document (id matches), or anyone holding `permission`.
 * Used for "edit my own profile" without granting `users.update`.
 */
export const requireSelfOr =
  (permission: Permission) =>
  async ({ req, id }: AccessArgsLike): Promise<boolean> => {
    const user = req.user as AuthUser | null;
    if (isActiveUser(user) && id !== undefined && String(user?.id) === String(id)) return true;
    return (await permissionsFor(req)).has(permission);
  };

/**
 * Access block for a global (singleton) document, e.g. site settings.
 *
 * `read` is staff-only on purpose: the public website reads globals **server-side** through the
 * content adapter (`src/lib/content`), never over the REST API, so nothing anonymous needs this
 * door. That keeps one authenticated API surface for configuration instead of two.
 */
export const globalAccess = (read: Permission, update: Permission) => ({
  read: requirePermission(read),
  update: requirePermission(update),
});

/** Denies everyone. Used for collections that are system-written only (e.g. the audit log). */
export const denyAll = (): boolean => false;

/** Allows everyone, including anonymous visitors. Reserve for genuinely public reads. */
export const allowAll = (): boolean => true;

export type { TypedUser };
