/**
 * Browser-side helpers shared by the media admin surfaces (library, picker, detail panels).
 *
 * Everything here talks to the same REST endpoints an API client would use — the admin UI is not
 * special-cased. Access control therefore lives in one place (the collection), not in the UI.
 */

export type MediaSize = { url?: string | null; width?: number | null; height?: number | null } | null | undefined;

export type MediaDoc = {
  id: string | number;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  url?: string | null;
  thumbnailURL?: string | null;
  visibility?: "public" | "private" | null;
  decorative?: boolean | null;
  tags?: string[] | null;
  alt?: string | { ar?: string; en?: string } | null;
  caption?: string | { ar?: string; en?: string } | null;
  focalX?: number | null;
  focalY?: number | null;
  contentHash?: string | null;
  sourceFilename?: string | null;
  replacedAt?: string | null;
  duplicateOf?: string | number | { id?: string | number } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sizes?: Record<string, MediaSize> | null;
};

export type AltStatus = "complete" | "ar-only" | "en-only" | "missing";
export type CaptionStatus = AltStatus;

export type LibraryMeta = {
  counts: Record<string, number>;
  altStatus: Record<string, AltStatus>;
  captionStatus: Record<string, CaptionStatus>;
  decorative: Record<string, boolean>;
};

const withBase = (value: string): string => (value.startsWith("/") ? value : `/${value}`);

/** Admin-panel URL of a media document. */
export const mediaAdminURL = (id: string | number): string => `/admin/collections/media/${id}`;

/** Best available preview: Payload's admin thumbnail → card → original. */
export function previewURL(doc: MediaDoc): string | null {
  const sizeURL = doc.sizes?.thumbnail?.url ?? doc.sizes?.card?.url;
  if (sizeURL) return withBase(sizeURL);
  if (doc.url) return withBase(doc.url);
  return null;
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

export const mimeLabel = (mimeType?: string | null): string => {
  switch (mimeType) {
    case "image/jpeg":
      return "JPG";
    case "image/png":
      return "PNG";
    case "image/webp":
      return "WebP";
    case "image/avif":
      return "AVIF";
    case "image/svg+xml":
      return "SVG";
    default:
      return mimeType ?? "—";
  }
};

export const visibilityLabel = (visibility?: string | null): string =>
  visibility === "public" ? "عام" : "خاص";

export const tagLabel = (tag: string): string =>
  ({
    brand: "الهوية",
    website: "الموقع",
    services: "الخدمات",
    projects: "المشاريع",
    articles: "المقالات",
    social: "التواصل الاجتماعي",
    og: "صورة مشاركة",
    team: "الفريق",
    other: "أخرى",
  })[tag] ?? tag;

export const ALT_STATUS_LABEL: Record<AltStatus, string> = {
  complete: "مكتمل",
  "ar-only": "عربي فقط",
  "en-only": "إنجليزي فقط",
  missing: "مفقود",
};

/** One batched request: usage counts + alt/caption completeness for the whole page of tiles. */
export async function fetchLibraryMeta(ids: (string | number)[]): Promise<LibraryMeta> {
  const empty: LibraryMeta = { counts: {}, altStatus: {}, captionStatus: {}, decorative: {} };
  if (ids.length === 0) return empty;
  try {
    const response = await fetch(`/api/media/library-meta?ids=${ids.map(String).join(",")}`, {
      credentials: "include",
    });
    if (!response.ok) return empty;
    return (await response.json()) as LibraryMeta;
  } catch {
    return empty;
  }
}

export type MediaCapabilities = {
  read: boolean;
  upload: boolean;
  update: boolean;
  visibility: boolean;
  delete: boolean;
  svgUpload: boolean;
};

/** What THIS user may do — used only to show/hide affordances. The server re-checks everything. */
export async function fetchCapabilities(): Promise<MediaCapabilities> {
  const deny: MediaCapabilities = {
    read: false, upload: false, update: false, visibility: false, delete: false, svgUpload: false,
  };
  try {
    const response = await fetch("/api/media/capabilities", { credentials: "include" });
    if (!response.ok) return deny;
    return { ...deny, ...((await response.json()) as Partial<MediaCapabilities>) };
  } catch {
    return deny;
  }
}

export type UsageReference = {
  kind: "global" | "collection";
  slug: string;
  label: string;
  fieldPath: string;
  fieldLabel: string;
  href: string;
  documentId?: string | number;
  documentTitle?: string;
};

export async function fetchUsage(id: string | number): Promise<UsageReference[]> {
  try {
    const response = await fetch(`/api/media/${id}/usage`, { credentials: "include" });
    if (!response.ok) return [];
    const body = (await response.json()) as { references?: UsageReference[] };
    return body.references ?? [];
  } catch {
    return [];
  }
}

/**
 * Search for the REST endpoints.
 *
 * The admin's own list view resolves `?search=` server-side, but the REST API ignores it — a
 * subtle difference that silently returns the whole library instead of matches (found in the Phase D
 * browser pass, §13/§15). The equivalent explicit query is built here, once, from the same field list
 * the collection declares in `admin.listSearchableFields`.
 */
export const SEARCHABLE_FIELDS = ["filename", "sourceFilename", "alt", "caption"] as const;

export function applySearchParam(params: URLSearchParams, search: string): void {
  const term = search.trim();
  if (!term) return;
  SEARCHABLE_FIELDS.forEach((field, index) => {
    params.set(`where[or][${index}][${field}][like]`, term);
  });
}

/** Payload error payloads carry a human message; fall back to something an editor can act on. */
export async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { errors?: { message?: string }[]; message?: string };
    return body.errors?.[0]?.message ?? body.message ?? fallback;
  } catch {
    return fallback;
  }
}

/** A duplicate is reported, never blocked (§27) — the chip links to the earlier asset. */
export const duplicateId = (doc: MediaDoc): string | number | null => {
  const value = doc.duplicateOf;
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value.id ?? null;
  return value;
};

export const MEDIA_TAGS: { value: string; label: string }[] = [
  { value: "brand", label: "الهوية" },
  { value: "website", label: "الموقع" },
  { value: "services", label: "الخدمات" },
  { value: "projects", label: "المشاريع" },
  { value: "articles", label: "المقالات" },
  { value: "social", label: "التواصل الاجتماعي" },
  { value: "og", label: "صورة مشاركة" },
  { value: "team", label: "الفريق" },
  { value: "other", label: "أخرى" },
];

export const MEDIA_TYPES: { value: string; label: string }[] = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/avif", label: "AVIF" },
  { value: "image/svg+xml", label: "SVG" },
];
