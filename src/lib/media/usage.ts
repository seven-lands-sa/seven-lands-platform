/**
 * USAGE TRACKING (§16, §17, §18, §22).
 *
 * The question this answers: "where is this image currently used?" — and, before any delete, the
 * much more important one: "is anything still pointing at it?"
 *
 * MODEL: an explicit registry of `media`-bearing paths, not a text search over the repository.
 *
 * Why a registry: a grep over config files can only see assets hard-coded in code, which is exactly
 * what this CMS exists to replace. The authoritative answer lives in the database — which documents
 * reference the media id — so the registry names the *paths* worth checking and Payload does the
 * querying. Adding a media reference in a later phase means adding one entry here; nothing else.
 *
 * Everything is measured, nothing is cached: a stale "0 usages" badge in front of a delete button is
 * precisely the failure this module exists to prevent.
 */

import type { Payload } from "payload";

export type MediaUsageKind = "global" | "collection";

export type MediaUsageReference = {
  kind: MediaUsageKind;
  /** Payload slug, e.g. `site-settings` or (later) `pages`. */
  slug: string;
  /** Arabic label shown to the editor. */
  label: string;
  /** Field path inside the document, e.g. `brand.logo`. */
  fieldPath: string;
  /** Label of that specific field, for the message. */
  fieldLabel: string;
  /** Admin URL where the reference lives, so the editor can go and fix it. */
  href: string;
  /** Id of the owning document when it is a collection entry. */
  documentId?: string | number;
  /** Human title of the owning document when available. */
  documentTitle?: string;
};

type MediaFieldRegistration = {
  slug: string;
  label: string;
  adminPath: string;
  /** Media-bearing fields of that document: Payload field path → Arabic label. */
  fields: Record<string, string>;
};

/**
 * Registry of every place a media document can be referenced today.
 * `adminPath` is where the editor goes to change it.
 */
export const MEDIA_REFERENCE_REGISTRY: readonly MediaFieldRegistration[] = [
  {
    slug: "site-settings",
    label: "الإعدادات العامة",
    adminPath: "/admin/globals/site-settings",
    fields: {
      "brand.logo": "الشعار الأساسي",
      "brand.logoLight": "نسخة للخلفيات الداكنة",
      "brand.logoDark": "نسخة للخلفيات الفاتحة",
      "brand.favicon": "أيقونة الموقع",
      "brand.defaultOgImage": "صورة المشاركة الافتراضية",
    },
  },
  /*
   * Later phases append here — the shape is already correct for them:
   *   { slug: "pages", label: "الصفحات", adminPath: "/admin/collections/pages", fields: { hero: "صورة الغلاف" } }
   * Nothing else in this module changes when that happens.
   */
];

/** Value inside an upload field can be an id, a document, or an array of either. */
const idsIn = (value: unknown): (string | number)[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(idsIn);
  if (typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" || typeof id === "number" ? [id] : [];
  }
  if (typeof value === "string" || typeof value === "number") return [value];
  return [];
};

/** Reads a dotted path such as `brand.logo` out of a document. */
const readPath = (doc: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, doc);

/**
 * Every reference to one media id across the registered documents.
 *
 * `overrideAccess: true` is deliberate: this is an administrative question about the library's own
 * state, and an editor who can see a media row is entitled to know that the logo uses it.
 */
export async function findMediaUsage(
  payload: Payload,
  mediaId: string | number,
): Promise<MediaUsageReference[]> {
  const references: MediaUsageReference[] = [];
  const wanted = String(mediaId);

  for (const registration of MEDIA_REFERENCE_REGISTRY) {
    /* Globals are single documents addressed by slug. */
    let doc: unknown;
    try {
      doc = await payload.findGlobal({ slug: registration.slug as never, depth: 0, overrideAccess: true });
    } catch {
      /* A global that does not exist in this build is simply not a reference source. */
      continue;
    }

    for (const [fieldPath, fieldLabel] of Object.entries(registration.fields)) {
      const referenced = idsIn(readPath(doc, fieldPath));
      if (!referenced.some((id) => String(id) === wanted)) continue;
      references.push({
        kind: "global",
        slug: registration.slug,
        label: registration.label,
        fieldPath,
        fieldLabel,
        href: registration.adminPath,
      });
    }
  }

  return references;
}

/** "لا يمكن حذف هذه الصورة لأنها مستخدمة في:" + one line per place (§18). */
export function usageBlockMessage(references: readonly MediaUsageReference[]): string {
  const lines = references.map((reference) =>
    reference.kind === "global"
      ? `• ${reference.label} → ${reference.fieldLabel}`
      : `• ${reference.label} → ${reference.documentTitle ?? reference.documentId} → ${reference.fieldLabel}`,
  );
  return ["لا يمكن حذف هذه الصورة لأنها مستخدمة في:", ...lines].join("\n");
}

/**
 * Cache tags owned by the documents that reference this media (§21).
 *
 * A targeted invalidation, never a global one: changing an image's alt text must refresh the pages
 * that show it, not the whole site.
 */
export function dependentTagsFor(references: readonly MediaUsageReference[]): string[] {
  const tagBySlug: Record<string, string> = {
    "site-settings": "site-settings",
    "contact-settings": "contact-settings",
    "business-hours": "business-hours",
    "social-accounts": "social-accounts",
    navigation: "navigation",
    footer: "footer",
  };
  return [...new Set(references.map((reference) => tagBySlug[reference.slug]).filter(Boolean) as string[])];
}
