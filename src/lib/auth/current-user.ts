/**
 * Request-scoped authorization for Server Components, Server Actions and route handlers.
 *
 * Nothing in Phase B needs this yet — it exists so that Phase C's publishing actions and any
 * custom endpoint have one obvious place to ask "may this request do X?", instead of each
 * writer inventing their own check. Hiding a button in the admin UI is presentation; this
 * function is authorization.
 *
 * IMPORTANT (carried from Phase A): reading request headers is uncached runtime data. Under
 * `cacheComponents`, any page calling this must stream it inside `<Suspense>` or declare
 * `export const instant = false`. Do not call it from a prerendered page body.
 */

import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";

import config from "@payload-config";

import { isActiveUser, resolvePermissions, type AuthUser } from "./access";
import type { Permission } from "./permissions";

export type CurrentUser = AuthUser & { name?: string | null };

/** The authenticated user for the current request, or null. Suspended users return null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const payload = await getPayload({ config });
  const requestHeaders = await nextHeaders();
  const { user } = await payload.auth({ headers: requestHeaders });
  if (!user || !isActiveUser(user)) return null;
  return user as CurrentUser;
}

/** Every permission the current user holds. Empty for anonymous or suspended visitors. */
export async function getCurrentPermissions(): Promise<ReadonlySet<Permission>> {
  const payload = await getPayload({ config });
  const requestHeaders = await nextHeaders();
  const { user } = await payload.auth({ headers: requestHeaders });
  return resolvePermissions(payload, user as AuthUser | null);
}

/** The single question call sites should ask before a privileged operation. */
export async function can(permission: Permission): Promise<boolean> {
  const effective = await getCurrentPermissions();
  return effective.has(permission);
}

/** Requires a permission or throws — for Server Actions that must fail closed. */
export async function requireCan(permission: Permission): Promise<void> {
  if (!(await can(permission))) {
    throw new Error("FORBIDDEN: الصلاحية المطلوبة غير متوفرة لهذا الحساب.");
  }
}
