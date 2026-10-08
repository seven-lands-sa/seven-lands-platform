import { revalidateTag } from "next/cache";

/**
 * Immediate tag invalidation (§37).
 *
 * Phase A measured both forms on this exact stack: `revalidateTag(tag, 'max')` leaves exactly ONE
 * stale response (stale-while-revalidate) before the new value appears, while
 * `revalidateTag(tag, { expire: 0 })` is fresh on the very first public request. An owner who
 * corrects a phone number must see it immediately, so every write path uses the immediate form.
 *
 * Why the try/catch: the same hooks run under `npx payload run` (seeders, verification scripts)
 * where there is no Next request scope — invalidation is meaningless there but must not fail the
 * write. Failures are logged, never swallowed silently in the app.
 */
export function invalidateTags(tags: readonly string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[cache] could not invalidate "${tag}" (${message}) — expected outside a request scope`);
    }
  }
}
