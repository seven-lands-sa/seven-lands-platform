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
  /**
   * `global` (one document addressed by slug) or `collection` (many documents). Defaults to
   * `global`, which is what the Phase C registrations are.
   */
  kind?: MediaUsageKind;
  /** Media-bearing fields of that document: Payload field path → Arabic label. `*` walks arrays. */
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
   * Phase E/F content documents. A `*` in a field path walks an array (block compositions), so the
   * hero's stored image is found wherever its block sits in the page.
   */
  {
    slug: "pages",
    label: "الصفحات",
    adminPath: "/admin/collections/pages",
    fields: {
      "sections.*.media": "قسم الهيرو — الخلفية",
      "sections.*.mobileMedia": "قسم الهيرو — صورة الجوال",
      "seo.ogImage": "صورة المشاركة",
    },
  },
  {
    slug: "services",
    label: "المجالات",
    adminPath: "/admin/collections/services",
    fields: {
      cover: "صورة الغلاف",
      "seo.ogImage": "صورة المشاركة",
    },
  },
  {
    slug: "projects",
    label: "الأعمال",
    adminPath: "/admin/collections/projects",
    fields: {
      cover: "صورة الغلاف",
      gallery: "معرض الصور",
      "seo.ogImage": "صورة المشاركة",
    },
  },
  {
    slug: "insights",
    label: "الرؤى",
    adminPath: "/admin/collections/insights",
    fields: {
      cover: "صورة الغلاف",
      "seo.ogImage": "صورة المشاركة",
    },
  },
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

/**
 * Reads a dotted path such as `brand.logo` out of a document, where `*` walks an array
 * (`sections.*.media` → every block's media value, flattened).
 */
const readPath = (doc: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((current, key) => {
    if (key === "*") {
      if (!Array.isArray(current)) return undefined;
      return current;
    }
    if (Array.isArray(current)) return current.flatMap((entry) => readPath(entry, key));
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, doc);

/** All documents of a registration, draft state and every locale included, with a title for the UI. */
async function documentsFor(
  payload: Payload,
  registration: MediaFieldRegistration,
): Promise<{ doc: unknown; documentId?: string | number; documentTitle?: string }[]> {
  if ((registration.kind ?? "global") === "global") {
    try {
      const doc = await payload.findGlobal({ slug: registration.slug as never, depth: 0, overrideAccess: true });
      return [{ doc }];
    } catch {
      /* A global that does not exist in this build is simply not a reference source. */
      return [];
    }
  }

  try {
    /* Drafts included on purpose: an unpublished page still OWNS the image, and deleting it would
       break the editor's work the moment they publish. */
    const found = await payload.find({
      collection: registration.slug as never,
      limit: 200,
      pagination: false,
      depth: 0,
      draft: true,
      overrideAccess: true,
    });
    return (found.docs as unknown[]).map((doc) => {
      const titled = doc as { id?: string | number; title?: unknown; slug?: unknown; name?: unknown };
      const raw = titled.title ?? titled.name ?? titled.slug;
      const documentTitle = typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
      return { doc, documentId: titled.id, ...(documentTitle ? { documentTitle } : {}) };
    });
  } catch {
    /* A collection that does not exist in this build is not a reference source either. */
    return [];
  }
}

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
    const documents = await documentsFor(payload, registration);
    for (const { doc, documentId, documentTitle } of documents) {
      for (const [fieldPath, fieldLabel] of Object.entries(registration.fields)) {
        const referenced = idsIn(readPath(doc, fieldPath));
        if (!referenced.some((id) => String(id) === wanted)) continue;
        const alreadyRecorded = references.some(
          (reference) =>
            reference.slug === registration.slug &&
            reference.documentId === documentId &&
            reference.fieldPath === fieldPath,
        );
        if (alreadyRecorded) continue;
        references.push({
          kind: registration.kind ?? "global",
          slug: registration.slug,
          label: registration.label,
          fieldPath,
          fieldLabel,
          href: registration.adminPath,
          ...(documentId !== undefined ? { documentId } : {}),
          ...(documentTitle ? { documentTitle } : {}),
        });
      }
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
    pages: "pages",
    services: "services",
    projects: "projects",
    insights: "insights",
    "site-settings": "site-settings",
    "contact-settings": "contact-settings",
    "business-hours": "business-hours",
    "social-accounts": "social-accounts",
    navigation: "navigation",
    footer: "footer",
  };
  return [...new Set(references.map((reference) => tagBySlug[reference.slug]).filter(Boolean) as string[])];
}
