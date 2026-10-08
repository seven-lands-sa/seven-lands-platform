/**
 * The public media resolver (§39) and the storage seam (§4).
 *
 * ONE PLACE decides whether a media document may be shown publicly and what URL it resolves to.
 * Components ask for a `MediaRef`; they never learn whether the bytes live on local disk, behind
 * Payload's route, or (later) in an R2/S3 bucket.
 *
 * VISIBILITY (§1): `private` media is refused for public/anonymous use, regardless of who knows the
 * filename. The binary layer enforces the same rule independently — see `src/collections/Media.ts`
 * (`read` returns a query constraint for anyone who is not authorised staff), which Payload applies
 * to the original file *and* every derivative, because `checkFileAccess` matches
 * `sizes.<name>.filename` against the same constraint.
 *
 * DRAFT PREVIEW (§3): public visibility and editing visibility are different questions. A trusted
 * server context (the authenticated admin, a future draft preview) passes `allowPrivate: true` and
 * receives private media too — without that media ever becoming public.
 */

import type { MediaRef } from "./views";
import type { AppLocale } from "@/i18n/routing";

export type MediaDocLike = {
  id: string | number;
  url?: string | null;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  visibility?: string | null;
  focalX?: number | null;
  focalY?: number | null;
  alt?: unknown;
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null }> | null;
};

export type MediaFocal = { x: number; y: number };

/**
 * Focal point, normalised to 0–1 (§9).
 *
 * The stored fields are Payload's `focalX` / `focalY`: the admin's focal editor writes percentages
 * (0–100, its own convention), while programmatic writes in this project use fractions (0–1, as the
 * Phase D brief specifies). Both are accepted here and normalised exactly once, so no downstream
 * component can be caught dividing twice — and no component ever sees a CSS string, only numbers it
 * turns into its own crop maths.
 */
export function focalPointOf(doc: MediaDocLike): MediaFocal | null {
  const rawX = typeof doc.focalX === "number" && Number.isFinite(doc.focalX) ? doc.focalX : null;
  const rawY = typeof doc.focalY === "number" && Number.isFinite(doc.focalY) ? doc.focalY : null;
  if (rawX === null || rawY === null) return null;
  const normalise = (value: number) => {
    const fraction = value > 1 ? value / 100 : value;
    return Math.min(1, Math.max(0, Number(fraction.toFixed(4))));
  };
  return { x: normalise(rawX), y: normalise(rawY) };
}

export const MEDIA_VISIBILITIES = ["private", "public"] as const;
export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[number];

/** Anonymous/public use sees ONLY public media; `private` is the default state of every upload. */
export function isPubliclyVisible(doc: MediaDocLike): boolean {
  return doc.visibility === "public";
}

/**
 * The storage seam. Today this is Payload's local file route; after the owner-gated move to
 * object storage this becomes the bucket/CDN URL (public prefix for public objects, a signed URL
 * for private ones) and nothing else in the codebase changes.
 */
export function mediaUrl(doc: MediaDocLike, size?: string): string | null {
  const raw = (size && doc.sizes?.[size]?.url) || doc.url || null;
  if (raw) return asPublicPath(raw);
  if (doc.filename) return `/api/media/file/${encodeURIComponent(doc.filename)}`;
  return null;
}

/**
 * Payload returns ABSOLUTE media URLs built from the runtime `serverURL` (the origin THIS process is
 * reachable on — a preview bridge host, a staging alias, localhost). Publishing that value would
 * stamp the preview host into canonical public markup and into structured data.
 *
 * So the public layer keeps only the path: `/api/media/file/…` is origin-independent, correct on the
 * preview, on staging and on the production domain, and can never leak where the site currently runs.
 * Anything that genuinely needs an absolute URL (og:image, JSON-LD) is absolutised against the
 * canonical origin in `src/lib/seo.ts` / `src/lib/schema.ts` — never against the runtime host.
 */
export function asPublicPath(url: string): string {
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

/** Canonical absolute URL for a path that must be fully qualified (share images, structured data). */
export function absoluteFromCanonical(path: string | null, canonicalOrigin: string): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${canonicalOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
}

function altFor(doc: MediaDocLike, locale: AppLocale): string | null {
  const alt = doc.alt;
  if (!alt) return null;
  if (typeof alt === "string") return alt;
  if (typeof alt === "object") {
    const value = (alt as Record<string, unknown>)[locale];
    return typeof value === "string" && value.trim() ? value : null;
  }
  return null;
}

/**
 * Public/anonymous resolution. Returns null — never a placeholder URL — when the document is
 * private, missing its URL, or not a document at all.
 */
export function resolvePublicMedia(
  doc: MediaDocLike | null | undefined,
  options: { locale: AppLocale; allowPrivate?: boolean; size?: string },
): MediaRef | null {
  if (!doc || (typeof doc !== "object" && typeof doc !== "number")) return null;
  if (typeof doc === "number" || typeof doc === "string") return null;
  if (!options.allowPrivate && !isPubliclyVisible(doc)) return null;

  const url = mediaUrl(doc, options.size);
  if (!url) return null;

  return {
    id: doc.id,
    url,
    width: doc.width ?? null,
    height: doc.height ?? null,
    alt: altFor(doc, options.locale),
    focal: focalPointOf(doc),
  };
}

/**
 * Responsive candidates for a `srcset` (§46 of Phase D), smallest derivative first, the original last.
 *
 * The point is that a phone never has to download the 2400px original: the derivatives the pipeline
 * already generates (thumbnail 400, card 768, content 1200) are the small end of the set, and the
 * original is the top end for large screens and for zoom/print. Returns `null` when there is nothing
 * worth choosing between — the caller falls back to a plain `src`.
 *
 * Width comes from what was actually stored, never from a guess, so the `w` descriptors cannot lie.
 */
export function mediaSrcSet(
  doc: MediaDocLike,
  sizes: readonly string[] = ["thumbnail", "card", "content"],
): string | null {
  const candidates: { url: string; width: number }[] = [];
  for (const name of sizes) {
    const size = doc.sizes?.[name];
    if (size?.url && typeof size.width === "number" && size.width > 0) {
      candidates.push({ url: asPublicPath(size.url), width: size.width });
    }
  }
  const originalURL = doc.url ? asPublicPath(doc.url) : null;
  if (originalURL && typeof doc.width === "number" && doc.width > 0 && !candidates.some((c) => c.url === originalURL)) {
    candidates.push({ url: originalURL, width: doc.width });
  }

  const ordered = [...candidates].sort((a, b) => a.width - b.width);
  if (ordered.length < 2) return null;
  return ordered.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
}

/**
 * Collects media ids referenced by an arbitrary document graph — the contract Phase D's publishing
 * validation uses for §2 (`public page + private referenced media = PUBLISH BLOCKED`).
 */
export function collectMediaIds(value: unknown, found: Set<string | number> = new Set()): Set<string | number> {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectMediaIds(entry, found));
    return found;
  }
  if (!value || typeof value !== "object") return found;

  const record = value as Record<string, unknown>;
  if (record.relationTo === "media" || record.relationTo === "media" ) {
    const relation = record.value;
    if (Array.isArray(relation)) {
      relation.forEach((entry) => {
        const id = typeof entry === "object" && entry !== null ? (entry as { id?: unknown }).id : entry;
        if (typeof id === "string" || typeof id === "number") found.add(id);
      });
    } else {
      const id = typeof relation === "object" && relation !== null ? (relation as { id?: unknown }).id : relation;
      if (typeof id === "string" || typeof id === "number") found.add(id);
    }
  }

  for (const entry of Object.values(record)) collectMediaIds(entry, found);
  return found;
}
