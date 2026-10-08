import type { GlobalAfterChangeHook } from "payload";

import { recordAuditEvent, type AuditAction } from "@/lib/auth/audit";
import { invalidateTags } from "@/lib/content/invalidate";

/**
 * Audit + cache invalidation for every Phase C global, written once.
 *
 * Two rules the owner asked for, enforced in one place:
 *   · §31 — every meaningful change produces ONE audit event that says what changed, not a dump of
 *     the whole document. Unchanged saves stay silent (no log noise, no false history).
 *   · §37 — the changed global's cache tags are invalidated with the immediate profile, so the
 *     first public request after a save already shows the new value.
 */

export type AuditedGlobalOptions = {
  action: AuditAction;
  resourceType:
    | "site-settings"
    | "contact-settings"
    | "business-hours"
    | "social-accounts"
    | "navigation"
    | "footer";
  /** Human name shown in the log: "بيانات التواصل". */
  label: string;
  /** Cache tags this global owns (+ any global whose view depends on it). */
  tags: string[];
  /** Arabic labels per top-level field, used to describe the change. */
  fieldLabels: Record<string, string>;
};

type AnyRecord = Record<string, unknown>;

const isPlainObject = (value: unknown): value is AnyRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const same = (a: unknown, b: unknown): boolean => {
  try {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  } catch {
    return false;
  }
};

/** Which top-level fields changed, and — for arrays — how many rows were touched. */
export function describeChanges(
  previous: unknown,
  next: unknown,
  fieldLabels: Record<string, string>,
): { labels: string[]; arrays: Record<string, { added: number; removed: number; changed: number }> } {
  const before = isPlainObject(previous) ? previous : {};
  const after = isPlainObject(next) ? next : {};
  const labels: string[] = [];
  const arrays: Record<string, { added: number; removed: number; changed: number }> = {};

  for (const key of Object.keys(after)) {
    if (key === "id" || key === "updatedAt" || key === "createdAt" || key === "globalType") continue;
    const previousValue = before[key];
    const nextValue = after[key];
    if (same(previousValue, nextValue)) continue;

    if (Array.isArray(previousValue) || Array.isArray(nextValue)) {
      const oldRows = Array.isArray(previousValue) ? previousValue : [];
      const newRows = Array.isArray(nextValue) ? nextValue : [];
      const added = Math.max(0, newRows.length - oldRows.length);
      const removed = Math.max(0, oldRows.length - newRows.length);
      const shared = Math.min(oldRows.length, newRows.length);
      let changed = 0;
      for (let index = 0; index < shared; index += 1) {
        const oldRow = oldRows[index] as AnyRecord | undefined;
        const newRow = newRows[index] as AnyRecord | undefined;
        const strip = (row: AnyRecord | undefined) =>
          row ? Object.fromEntries(Object.entries(row).filter(([k]) => !["id", "updatedAt", "createdAt"].includes(k))) : null;
        if (!same(strip(oldRow), strip(newRow))) changed += 1;
      }
      arrays[key] = { added, removed, changed };
    }

    labels.push(fieldLabels[key] ?? key);
  }

  return { labels, arrays };
}

export function auditedGlobal(options: AuditedGlobalOptions): { afterChange: GlobalAfterChangeHook[] } {
  const afterChange: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
    const { labels, arrays } = describeChanges(previousDoc, doc, options.fieldLabels);
    const firstSave = !previousDoc || Object.keys(previousDoc as AnyRecord).length === 0;

    /* Invalidating on an unchanged save is harmless but pointless; skipping it keeps the cache
       semantics honest — the tag expires only when something actually changed. */
    if (!firstSave && labels.length === 0) return doc;

    invalidateTags(options.tags);

    const arraySummary = Object.entries(arrays)
      .map(([key, value]) => {
        const parts: string[] = [];
        if (value.added) parts.push(`إضافة ${value.added}`);
        if (value.removed) parts.push(`حذف ${value.removed}`);
        if (value.changed) parts.push(`تعديل ${value.changed}`);
        return `${options.fieldLabels[key] ?? key}: ${parts.join("، ")}`;
      })
      .join(" • ");

    const summary = firstSave
      ? `تهيئة ${options.label}`
      : [`تعديل ${options.label}`, labels.join("، "), arraySummary].filter(Boolean).join(" — ");

    await recordAuditEvent(req.payload, {
      action: options.action,
      summary,
      resourceType: options.resourceType,
      resourceId: options.resourceType,
      req,
      details: { fields: labels, arrays },
    });

    return doc;
  };

  return { afterChange: [afterChange] };
}
