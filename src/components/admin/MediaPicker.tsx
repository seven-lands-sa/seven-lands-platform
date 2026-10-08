"use client";

import { useField } from "@payloadcms/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdminImage } from "./media/AdminImage";
import {
  ALT_STATUS_LABEL,
  applySearchParam,
  MEDIA_TAGS,
  MEDIA_TYPES,
  duplicateId,
  fetchCapabilities,
  fetchLibraryMeta,
  formatBytes,
  mimeLabel,
  previewURL,
  type LibraryMeta,
  type MediaDoc,
} from "./media/client";
import { MediaUploadDialog } from "./MediaUploadDialog";

/**
 * MEDIA PICKER (§15) — how a future content editor chooses an image.
 *
 * The contract: browse, search, filter, preview, upload a new one, pick an existing one, and see
 * whether it is suitable for a public page (visibility + alt completeness in both languages). No
 * filenames to remember, no ids to paste, no developer in the loop — and no second upload of an
 * asset that already exists, because the library is right there.
 *
 * Two exports:
 *   • `MediaPickerDialog` — the surface itself, fully controlled.
 *   • `MediaPickerField` — a drop-in Payload field component (`admin.components.Field`) for the
 *     upload/relationship fields of later phases. Wire-up is one line in the field config; see
 *     docs/admin-control-center/phase-d/MEDIA_LIBRARY_UX.md.
 */

type PickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (doc: MediaDoc) => void;
  /** Shown in the footer hint — e.g. "لصورة الغلاف في صفحة الخدمات". */
  purposeLabel?: string;
  canSvg?: boolean;
};

const PAGE_SIZE = 24;

export function MediaPickerDialog({ open, onClose, onSelect, purposeLabel, canSvg = false }: PickerProps) {
  const [docs, setDocs] = useState<MediaDoc[]>([]);
  const [meta, setMeta] = useState<LibraryMeta>({ counts: {}, altStatus: {}, captionStatus: {}, decorative: {} });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"" | "public" | "private">("");
  const [mimeType, setMimeType] = useState("");
  const [tag, setTag] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetchCapabilities().then((value) => {
      if (alive) setCanUpload(value.upload);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  /* Fetch the page whenever the dialog opens or the query changes. State updates live in the
     promise callbacks, so no render is triggered synchronously by the effect itself. */
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const controller = new AbortController();

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
      sort: "-createdAt",
      depth: "0",
    });
    applySearchParam(params, search);
    if (visibility) params.set("where[visibility][equals]", visibility);
    if (mimeType) params.set("where[mimeType][equals]", mimeType);
    if (tag) params.set("where[tags][in]", tag);

    /* One microtask of breathing room: the first state update then happens outside the effect's
       synchronous pass, which keeps React from scheduling a cascading render. */
    const run = async () => {
      await Promise.resolve();
      if (!alive) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/media?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("request failed");
        const body = (await response.json()) as { docs?: MediaDoc[]; totalDocs?: number; totalPages?: number };
        const nextDocs = body.docs ?? [];
        const nextMeta = await fetchLibraryMeta(nextDocs.map((doc) => doc.id));
        if (!alive) return;
        setDocs(nextDocs);
        setTotal(body.totalDocs ?? 0);
        setPages(body.totalPages ?? 1);
        setMeta(nextMeta);
        setLoading(false);
      } catch {
        if (!alive) return;
        setDocs([]);
        setTotal(0);
        setPages(1);
        setLoading(false);
      }
    };
    void run();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [open, page, search, visibility, mimeType, tag, reloadKey]);

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(value), 300);
  }, []);

  const isEmpty = !loading && docs.length === 0;

  const summary = useMemo(() => (total > 0 ? `${total} ملف` : "لا نتائج"), [total]);

  if (!open) return null;

  return (
    <div className="sl-modal" role="dialog" aria-modal="true" aria-labelledby="sl-picker-title">
      <div className="sl-modal__panel sl-modal__panel--wide">
        <div className="sl-modal__head">
          <h2 id="sl-picker-title">اختيار صورة من المكتبة</h2>
          <button type="button" className="btn btn--style-secondary btn--size-small" onClick={onClose}>
            إغلاق
          </button>
        </div>

        <div className="sl-library__header-actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="search"
            className="sl-input"
            placeholder="ابحث بالاسم أو النص البديل…"
            aria-label="بحث في المكتبة"
            onChange={(event) => onSearch(event.target.value)}
          />
          <select className="sl-select" aria-label="فلترة الظهور" value={visibility} onChange={(event) => { setPage(1); setVisibility(event.target.value as "" | "public" | "private"); }}>
            <option value="">كل الملفات</option>
            <option value="public">العام فقط</option>
            <option value="private">الخاص فقط</option>
          </select>
          <select className="sl-select" aria-label="فلترة النوع" value={mimeType} onChange={(event) => { setPage(1); setMimeType(event.target.value); }}>
            <option value="">كل الأنواع</option>
            {MEDIA_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select className="sl-select" aria-label="فلترة الوسم" value={tag} onChange={(event) => { setPage(1); setTag(event.target.value); }}>
            <option value="">كل الوسوم</option>
            {MEDIA_TAGS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          {canUpload && (
            <button type="button" className="btn btn--style-primary" onClick={() => setUploadOpen(true)}>
              رفع صورة جديدة
            </button>
          )}
        </div>

        <p className="description" style={{ margin: "0.25rem 0" }}>
          {summary}
          {loading ? " — جارٍ التحديث…" : ""}
          {purposeLabel ? ` · ${purposeLabel}` : ""}
        </p>

        {isEmpty ? (
          <p className="description" style={{ padding: "1rem 0" }}>
            لا توجد صور مطابقة. جرّب كلمة أخرى، أو ارفع صورة جديدة.
          </p>
        ) : (
          <ul className="sl-grid sl-grid--picker" aria-label="صور المكتبة">
            {docs.map((doc) => {
              const key = String(doc.id);
              const src = previewURL(doc);
              const altStatus = meta.altStatus[key] ?? "missing";
              const decorative = meta.decorative[key] === true;
              const usage = meta.counts[key] ?? 0;
              const publicReady = doc.visibility === "public" && (decorative || altStatus === "complete");
              return (
                <li key={key} className="sl-card">
                  <button
                    type="button"
                    className="sl-card__pick"
                    onClick={() => onSelect(doc)}
                    aria-label={`اختيار ${doc.filename ?? "الملف"}`}
                  >
                    <span className="sl-card__top">
                      <span className={`sl-chip sl-chip--${doc.visibility === "public" ? "public" : "private"}`}>
                        {doc.visibility === "public" ? "عام" : "خاص"}
                      </span>
                    </span>
                    {src ? (
                      <AdminImage src={src} alt={doc.filename ?? "معاينة"} className="sl-card__image" />
                    ) : (
                      <span className="sl-card__placeholder">لا معاينة</span>
                    )}
                    <span className="sl-card__body">
                      <span className="sl-card__name">{doc.filename ?? `#${doc.id}`}</span>
                      <span className="sl-card__facts">
                        {mimeLabel(doc.mimeType)}
                        {doc.width && doc.height ? ` · ${doc.width}×${doc.height}` : ""}
                        {` · ${formatBytes(doc.filesize)}`}
                      </span>
                      <span className="sl-card__meta">
                        <span className={`sl-chip sl-chip--alt-${decorative ? "decorative" : altStatus}`}>
                          {decorative ? "زخرفية" : `النص البديل: ${ALT_STATUS_LABEL[altStatus]}`}
                        </span>
                        <span className="sl-chip sl-chip--usage">{usage > 0 ? `مستخدمة في ${usage}` : "غير مستخدمة"}</span>
                        {duplicateId(doc) !== null && <span className="sl-chip sl-chip--duplicate">نسخة مكررة</span>}
                      </span>
                      {!publicReady && (
                        <span className="sl-card__warning">
                          {doc.visibility !== "public"
                            ? "ملف خاص: لن يظهر للزوار حتى تجعله عامًا."
                            : "النص البديل ناقص: أكمله بالعربية والإنجليزية قبل النشر."}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 && (
          <nav className="sl-library__pager" aria-label="تنقل بين الصفحات">
            <button type="button" className="btn btn--style-secondary btn--size-small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              السابق
            </button>
            <span className="sl-library__pager-status">
              صفحة {page} من {pages}
            </span>
            <button type="button" className="btn btn--style-secondary btn--size-small" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              التالي
            </button>
          </nav>
        )}

        <p className="description" style={{ marginBottom: 0 }}>
          الصور الخاصة لا يمكن استخدامها في صفحات الموقع العامة. النص البديل بالعربية والإنجليزية يُعد شرطًا لصورة
          ذات معنى.
        </p>
      </div>

      {uploadOpen && (
        <MediaUploadDialog
          canSvg={canSvg}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            setPage(1);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}

/**
 * Drop-in field component for future upload/relationship fields.
 *
 * Integration (Phase E and later):
 *   fields: [{ name: "coverImage", type: "upload", relationTo: "media",
 *              admin: { components: { Field: "/components/admin/MediaPicker#MediaPickerField" } } }]
 */
export function MediaPickerField({
  path,
  field,
}: {
  path: string;
  field?: { label?: unknown; admin?: { description?: string } };
}) {
  const { value, setValue } = useField<string | number | null>({ path });
  const [open, setOpen] = useState(false);

  const labelText = (() => {
    const label = field?.label;
    if (typeof label === "string") return label;
    if (label && typeof label === "object" && typeof (label as { ar?: string }).ar === "string") {
      return (label as { ar: string }).ar;
    }
    return "الصورة";
  })();

  /* The fetched document is tagged with the id it belongs to, so clearing the value needs no
     state update — a stale response simply stops matching. */
  const [fetched, setFetched] = useState<{ id: string; doc: MediaDoc } | null>(null);

  useEffect(() => {
    if (value === null || value === undefined || value === "") return;
    let alive = true;
    fetch(`/api/media/${value}?depth=0`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (alive && body) setFetched({ id: String(value), doc: body as MediaDoc });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [value]);

  const doc = value === null || value === undefined || value === "" ? null : (fetched?.id === String(value) ? fetched.doc : null);

  return (
    <div className="field-type" style={{ marginBottom: "1.25rem" }}>
      <span className="field-label" style={{ display: "block", marginBottom: "0.5rem" }}>
        {labelText}
      </span>

      <div className="sl-picker-field">
        <div className="sl-picker-field__preview">
          {doc && previewURL(doc) ? (
            <AdminImage src={previewURL(doc) as string} alt={doc.filename ?? "الصورة المختارة"} className="sl-picker-field__image" />
          ) : (
            <span className="sl-card__placeholder">لا صورة مختارة</span>
          )}
        </div>
        <div className="sl-picker-field__body">
          <p style={{ margin: "0 0 0.35rem" }}>{doc?.filename ?? "لم تُختر أي صورة بعد."}</p>
          {doc && (
            <p className="description" style={{ margin: "0 0 0.35rem" }}>
              {doc.visibility === "public" ? "عام" : "خاص"} · {mimeLabel(doc.mimeType)}
              {doc.width && doc.height ? ` · ${doc.width}×${doc.height}` : ""}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn--style-primary btn--size-small" onClick={() => setOpen(true)}>
              {doc ? "تغيير الصورة" : "اختر صورة"}
            </button>
            {doc && (
              <button
                type="button"
                className="btn btn--style-secondary btn--size-small"
                onClick={() => setValue(null)}
              >
                إزالة
              </button>
            )}
          </div>
        </div>
      </div>

      {field?.admin?.description && <p className="description" style={{ marginTop: "0.5rem" }}>{field.admin.description}</p>}

      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(selected) => {
          setValue(selected.id);
          setFetched({ id: String(selected.id), doc: selected });
          setOpen(false);
        }}
      />
    </div>
  );
}

export default MediaPickerField;
