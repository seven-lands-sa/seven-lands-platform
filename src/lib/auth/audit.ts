/**
 * Audit foundation.
 *
 * The audit collection is write-only for every human: its `create`/`update`/`delete` access is
 * `denyAll`, so the only writer is this module, running as the system (`overrideAccess: true`).
 * That is what makes the history trustworthy — no admin, not even a Super Admin, can edit it
 * through the UI or the API; a Super Admin can only read and export it.
 *
 * Audit writes never break the operation they describe: failures are logged to the server
 * console and swallowed.
 */

import type { Payload, PayloadRequest } from "payload";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "user_created"
  | "user_updated"
  | "user_suspended"
  | "user_reactivated"
  | "user_deleted"
  /** A user's role set changed — the most consequential account edit, so it is audited on its own. */
  | "role_changed"
  | "role_created"
  | "role_updated"
  | "role_deleted"
  /* Phase C — global business configuration. One action per Global so the log can be filtered by
     what was actually touched; the summary carries the meaningful diff. */
  | "settings_updated"
  | "contact_updated"
  | "hours_updated"
  | "social_updated"
  | "navigation_updated"
  | "footer_updated"
  | "media_visibility_changed"
  /* Phase D — media library lifecycle. */
  | "media_uploaded"
  | "media_updated"
  | "media_binary_replaced"
  | "media_deleted"
  | "media_delete_blocked"
  /* Phase E — page composition lifecycle (§23). */
  | "page_created"
  | "page_updated"
  | "page_published"
  | "page_unpublished"
  | "page_archived"
  | "page_restored"
  | "page_slug_changed"
  | "page_blocks_reordered";

export type AuditInput = {
  action: AuditAction;
  /** Short Arabic sentence describing what happened, shown in the admin list. */
  summary: string;
  resourceType?:
    | "users"
    | "roles"
    | "audit"
    | "system"
    | "site-settings"
    | "contact-settings"
    | "business-hours"
    | "social-accounts"
    | "navigation"
    | "footer"
    | "media"
    | "pages";
  resourceId?: string | number | null;
  actorID?: string | number | null;
  actorEmail?: string | null;
  /** When present, request metadata (IP, user agent, method, path) is recorded. */
  req?: PayloadRequest;
  /** Extra non-secret context worth keeping. Never put credentials or tokens here. */
  details?: Record<string, unknown>;
  /**
   * Write this event on its own connection instead of joining the caller's transaction.
   *
   * Use it when the event describes an operation that will be ROLLED BACK — a refused delete is the
   * canonical case: Payload wraps the operation in a transaction, and an audit row inserted inside
   * that transaction disappears with it, which would make refusals the one thing the log never
   * shows. Request metadata is copied into `details` instead, since the request object is what ties
   * the write to the transaction.
   */
  detached?: boolean;
};

const clientIp = (req?: PayloadRequest): string | null => {
  try {
    const headers = req?.headers;
    if (!headers || typeof headers.get !== "function") return null;
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
    return headers.get("x-real-ip") ?? null;
  } catch {
    return null;
  }
};

const userAgent = (req?: PayloadRequest): string | null => {
  try {
    const headers = req?.headers;
    if (!headers || typeof headers.get !== "function") return null;
    return headers.get("user-agent")?.slice(0, 300) ?? null;
  } catch {
    return null;
  }
};

/**
 * The `actor` relationship is typed to the configured database's id type (integer with the
 * Postgres adapter). Ids are normalised here so the audit writer never fails on a shape
 * mismatch; if a future adapter used non-numeric ids, the link would fall back to null while
 * `actorEmail` still records who acted.
 */
const asActorID = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export async function recordAuditEvent(payload: Payload, input: AuditInput): Promise<void> {
  const { action, summary, resourceType, resourceId, actorID, actorEmail, req, details, detached } = input;
  const detachedRequestMeta = detached && req ? { ip: clientIp(req), userAgent: userAgent(req), method: req.method ?? null, path: req.pathname ?? null } : null;

  try {
    await payload.create({
      collection: "audit-events",
      data: {
        action,
        summary,
        resourceType: resourceType ?? "system",
        resourceId: resourceId === null || resourceId === undefined ? null : String(resourceId),
        actor: asActorID(actorID ?? req?.user?.id),
        /* Automated writes (seeds, scripts, hooks without a request user) are attributed to
         * "system" so the log never shows an empty actor for a real change. */
        actorEmail: actorEmail ?? (req?.user as { email?: string } | null)?.email ?? "system",
        occurredAt: new Date().toISOString(),
        context: {
          ip: detachedRequestMeta ? detachedRequestMeta.ip : clientIp(req),
          userAgent: detachedRequestMeta ? detachedRequestMeta.userAgent : userAgent(req),
          method: detachedRequestMeta ? detachedRequestMeta.method : (req?.method ?? null),
          path: detachedRequestMeta ? detachedRequestMeta.path : (req?.pathname ?? null),
          ...(details ? { details } : {}),
        },
      },
      depth: 0,
      overrideAccess: true,
      ...(req && !detached ? { req } : {}),
    });
  } catch (error) {
    console.error("[audit] failed to record event", action, error);
  }
}
