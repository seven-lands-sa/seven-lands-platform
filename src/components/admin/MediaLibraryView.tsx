"use client";

import { toast, useListQuery } from "@payloadcms/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Where } from "payload";

import { AdminImage } from "./media/AdminImage";
import {
  ALT_STATUS_LABEL,
  MEDIA_TAGS,
  MEDIA_TYPES,
  fetchCapabilities,
  duplicateId,
  fetchLibraryMeta,
  formatBytes,
  mediaAdminURL,
  mimeLabel,
  previewURL,
  visibilityLabel,
  type LibraryMeta,
  type MediaCapabilities,
  type MediaDoc,
} from "./media/client";
import { MediaUploadDialog } from "./MediaUploadDialog";

/**
 * MEDIA LIBRARY — the browsing surface of the library (§13, §33, §34).
 *
 * Replaces Payload's table for the Media collection only, because a library is browsed by looking
 * at pictures, not at filenames. Everything here is composed from the pieces the admin already
 * provides: the list query lives in Payload's own `ListQueryProvider` (so paging, sorting and
 * filtering stay server-side and respect access control), and the read/upload/update/delete calls
 * go through the ordinary REST API with the editor's own session.
 *
 * Deliberately NOT here: any client-side re-implementation of authorization. The grid shows and
 * hides affordances based on `capabilities`, and every write is re-checked by the collection.
 *
 * Search, filters (visibility / type / tag) and sort (newest, oldest, name, size) are URL state, so
 * a filtered view can be linked, refreshed and shared like any other admin list.
 */

type MediaLibraryViewProps = {
  hasCreatePermission?: boolean;
  newDocumentURL?: string;
};

type SortKey = "newest" | "oldest" | "name" | "size";

const SORT_TO_QUERY: Record<SortKey, string> = {
  newest: "-createdAt",
  oldest: "createdAt",
  name: "filename",
  size: "-filesize",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  flexWrap: "wrap",
};

export function MediaLibraryView({ hasCreatePermission, newDocumentURL }: MediaLibraryViewProps) {
  const router = useRouter();
  const {
    data,
    query,
    handlePageChange: changePage,
    handleSearchChange: changeSearch,
    handleSortChange: changeSort,
    handleWhereChange: changeWhere,
  } = useListQuery();

  /* The provider's handlers are optional by type; the list view always supplies them. */
  const handlePageChange = useCallback((page: number) => void changePage?.(page), [changePage]);
  const handleSearchChange = useCallback((value: string) => void changeSearch?.(value), [changeSearch]);
  const handleSortChange = useCallback((value: string) => void changeSort?.(value), [changeSort]);
  const handleWhereChange = useCallback((value: Where) => void changeWhere?.(value), [changeWhere]);

  const docs = useMemo(() => ((data?.docs ?? []) as unknown as MediaDoc[]), [data]);
  const ids = useMemo(() => docs.map((doc) => doc.id), [docs]);

  const [capabilities, setCapabilities] = useState<MediaCapabilities | null>(null);
  const [meta, setMeta] = useState<LibraryMeta>({ counts: {}, altStatus: {}, captionStatus: {}, decorative: {} });
  const [search, setSearch] = useState<string>(typeof query?.search === "string" ? query.search : "");
  const [visibility, setVisibility] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCapabilities().then((value) => {
      if (alive) setCapabilities(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* One batched request for the tile facts (usage count + locale completeness) of the visible page. */
  useEffect(() => {
    let alive = true;
    fetchLibraryMeta(ids).then((value) => {
      if (alive) setMeta(value);
    });
    return () => {
      alive = false;
    };
  }, [ids]);

  const canUpload = capabilities ? capabilities.upload : Boolean(hasCreatePermission);
  const canDelete = capabilities?.delete ?? false;
  const canUpdate = capabilities?.update ?? false;
  const canChangeVisibility = capabilities?.visibility ?? false;

  /* Any change to what the grid shows invalidates the selection: leaving it alive across a page or
     filter change is how the wrong files get deleted. */
  const onSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setSelected(new Set());
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        handleSearchChange(value);
      }, 350);
    },
    [handleSearchChange],
  );

  const applyWhere = useCallback(
    (next: { visibility?: string; mimeType?: string; tag?: string }) => {
      setSelected(new Set());
      const where: Where = {};
      if (next.visibility) where.visibility = { equals: next.visibility };
      if (next.mimeType) where.mimeType = { equals: next.mimeType };
      if (next.tag) where.tags = { in: [next.tag] };
      handleWhereChange(where);
    },
    [handleWhereChange],
  );

  const clearFilters = useCallback(() => {
    setSelected(new Set());
    setVisibility("");
    setMimeType("");
    setTag("");
    setSort("newest");
    setSearch("");
    handleWhereChange({});
    handleSortChange(SORT_TO_QUERY.newest);
    handleSearchChange("");
  }, [handleSearchChange, handleSortChange, handleWhereChange]);

  const filtersActive = Boolean(search || visibility || mimeType || tag);

  const toggleSelected = useCallback((id: string | number) => {
    setSelected((current) => {
      const next = new Set(current);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    setSelected(new Set());
    router.refresh();
  }, [router]);

  /* ── Bulk actions (§29). Each id is written on its own, so one protected asset can never make a
     bulk operation look like it partially succeeded. ──────────────────────────────────────────── */

  const bulkVisibility = useCallback(
    async (value: "public" | "private") => {
      setBusy(true);
      let done = 0;
      const failures: string[] = [];
      for (const id of selected) {
        const doc = docs.find((candidate) => String(candidate.id) === id);
        if (doc && doc.visibility === value) continue;
        const response = await fetch(`/api/media/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visibility: value }),
        });
        if (response.ok) done += 1;
        else failures.push(String(doc?.filename ?? id));
      }
      setBusy(false);
      if (done > 0) toast.success(`تم تحديث ظهور ${done} ملف.`);
      if (failures.length > 0) toast.error(`تعذّر تحديث: ${failures.join("، ")}`);
      refresh();
    },
    [docs, refresh, selected],
  );

  const bulkTag = useCallback(
    async (value: string, mode: "add" | "remove") => {
      setBusy(true);
      let done = 0;
      const failures: string[] = [];
      for (const id of selected) {
        const doc = docs.find((candidate) => String(candidate.id) === id);
        if (!doc) continue;
        const current = Array.isArray(doc.tags) ? doc.tags : [];
        const nextTags =
          mode === "add" ? [...new Set([...current, value])] : current.filter((entry) => entry !== value);
        if (mode === "add" && current.includes(value)) continue;
        if (mode === "remove" && !current.includes(value)) continue;
        const response = await fetch(`/api/media/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: nextTags }),
        });
        if (response.ok) done += 1;
        else failures.push(String(doc.filename ?? id));
      }
      setBusy(false);
      if (done > 0) toast.success(`تم تحديث الوسوم على ${done} ملف.`);
      if (failures.length > 0) toast.error(`تعذّر التحديث: ${failures.join("، ")}`);
      refresh();
    },
    [docs, refresh, selected],
  );

  const bulkDelete = useCallback(async () => {
    const count = selected.size;
    if (count === 0) return;
    const confirmed =
      typeof window === "undefined"
        ? false
        : window.confirm(`سيتم حذف ${count} ملف من المكتبة نهائيًا. الملفات المستخدمة في الموقع لن تُحذف.`);
    if (!confirmed) return;

    setBusy(true);
    let done = 0;
    const blocked: string[] = [];
    for (const id of selected) {
      const doc = docs.find((candidate) => String(candidate.id) === id);
      const response = await fetch(`/api/media/${id}`, { method: "DELETE", credentials: "include" });
      if (response.ok) done += 1;
      else blocked.push(String(doc?.filename ?? id));
    }
    setBusy(false);
    if (done > 0) toast.success(`تم حذف ${done} ملف.`);
    if (blocked.length > 0) {
      toast.error(`لم تُحذف ${blocked.length} ملفات لأنها مستخدمة في الموقع: ${blocked.join("، ")}`);
    }
    refresh();
  }, [docs, refresh, selected]);

  const goToPage = useCallback(
    (target: number) => {
      setSelected(new Set());
      handlePageChange(target);
    },
    [handlePageChange],
  );

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      if (current.size === ids.length) return new Set();
      return new Set(ids.map(String));
    });
  }, [ids]);

  /* ── Rendering ─────────────────────────────────────────────────────────────────────────────── */

  const totalDocs = data?.totalDocs ?? 0;
  const page = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="sl-library">
      {/* Header: identity, search, upload */}
      <div className="sl-library__header">
        <div>
          <h1 className="sl-library__title">مكتبة الوسائط</h1>
          <p className="sl-library__subtitle">
            {totalDocs > 0 ? `${totalDocs} ملف` : "لا توجد ملفات بعد"}
            {filtersActive ? " — نتيجة بعد الفلترة" : ""}
          </p>
        </div>

        <div className="sl-library__header-actions" style={rowStyle}>
          <label className="sl-library__search">
            <span className="sl-visually-hidden">ابحث في المكتبة</span>
            <input
              type="search"
              className="sl-input"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث بالاسم أو النص البديل…"
            />
          </label>
          {canUpload && (
            <button type="button" className="btn btn--style-primary" onClick={() => setUploadOpen(true)}>
              رفع صورة
            </button>
          )}
          {canUpload && newDocumentURL && (
            <Link className="btn btn--style-secondary" href={newDocumentURL}>
              رفع مع تفاصيل كاملة
            </Link>
          )}
        </div>
      </div>

      {/* Filters + sort */}
      <div className="sl-library__filters">
        <label className="sl-field">
          <span className="sl-field__label">الظهور</span>
          <select
            className="sl-select"
            value={visibility}
            onChange={(event) => {
              setVisibility(event.target.value);
              applyWhere({ visibility: event.target.value, mimeType, tag });
            }}
          >
            <option value="">الكل</option>
            <option value="public">عام</option>
            <option value="private">خاص</option>
          </select>
        </label>

        <label className="sl-field">
          <span className="sl-field__label">النوع</span>
          <select
            className="sl-select"
            value={mimeType}
            onChange={(event) => {
              setMimeType(event.target.value);
              applyWhere({ visibility, mimeType: event.target.value, tag });
            }}
          >
            <option value="">الكل</option>
            {MEDIA_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sl-field">
          <span className="sl-field__label">الوسم</span>
          <select
            className="sl-select"
            value={tag}
            onChange={(event) => {
              setTag(event.target.value);
              applyWhere({ visibility, mimeType, tag: event.target.value });
            }}
          >
            <option value="">الكل</option>
            {MEDIA_TAGS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sl-field">
          <span className="sl-field__label">الترتيب</span>
          <select
            className="sl-select"
            value={sort}
            onChange={(event) => {
              const value = event.target.value as SortKey;
              setSort(value);
              setSelected(new Set());
              handleSortChange(SORT_TO_QUERY[value]);
            }}
          >
            <option value="newest">الأحدث أولًا</option>
            <option value="oldest">الأقدم أولًا</option>
            <option value="name">الاسم (أ - ي)</option>
            <option value="size">الأكبر حجمًا</option>
          </select>
        </label>

        {filtersActive && (
          <button type="button" className="btn btn--style-secondary btn--size-small" onClick={clearFilters}>
            إزالة الفلاتر
          </button>
        )}
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="sl-library__bulk" role="region" aria-label="إجراءات جماعية">
          <span className="sl-library__bulk-count">{selected.size} ملف محدد</span>
          <div style={rowStyle}>
            {canChangeVisibility && (
              <>
                <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={() => bulkVisibility("public")}>
                  اجعله عامًا
                </button>
                <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={() => bulkVisibility("private")}>
                  اجعله خاصًا
                </button>
              </>
            )}
            {canUpdate && (
              <label className="sl-field sl-field--inline">
                <span className="sl-field__label">وسم</span>
                <select
                  className="sl-select"
                  defaultValue=""
                  disabled={busy}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    void bulkTag(value, "add");
                    event.target.value = "";
                  }}
                >
                  <option value="">إضافة…</option>
                  {MEDIA_TAGS.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {canUpdate && (
              <label className="sl-field sl-field--inline">
                <span className="sl-field__label">إزالة</span>
                <select
                  className="sl-select"
                  defaultValue=""
                  disabled={busy}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) return;
                    void bulkTag(value, "remove");
                    event.target.value = "";
                  }}
                >
                  <option value="">وسم…</option>
                  {MEDIA_TAGS.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {canDelete && (
              <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={bulkDelete}>
                حذف المحدد
              </button>
            )}
            <button type="button" className="btn btn--style-secondary btn--size-small" onClick={() => setSelected(new Set())}>
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {docs.length === 0 ? (
        <div className="sl-library__empty">
          <h3>{filtersActive ? "لا توجد نتائج مطابقة" : "المكتبة فارغة"}</h3>
          <p className="description">
            {filtersActive
              ? "جرّب إزالة الفلاتر أو البحث بكلمة أخرى."
              : "ارفع أول صورة، وستظهر هنا مع بياناتها وحالة استخدامها."}
          </p>
          {filtersActive ? (
            <button type="button" className="btn btn--style-secondary" onClick={clearFilters}>
              إزالة الفلاتر
            </button>
          ) : (
            canUpload && (
              <button type="button" className="btn btn--style-primary" onClick={() => setUploadOpen(true)}>
                رفع صورة
              </button>
            )
          )}
        </div>
      ) : (
        <>
          <div className="sl-library__select-all">
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selected.size === ids.length && ids.length > 0}
                onChange={toggleAll}
                aria-label="تحديد كل الملفات في الصفحة"
              />
              <span className="description">تحديد الكل في هذه الصفحة</span>
            </label>
          </div>
          <ul className="sl-grid" aria-label="ملفات المكتبة">
            {docs.map((doc) => {
              const key = String(doc.id);
              const src = previewURL(doc);
              const altStatus = meta.altStatus[key] ?? "missing";
              const decorative = meta.decorative[key] === true;
              const usage = meta.counts[key] ?? 0;
              const isSelected = selected.has(key);
              return (
                <li key={key} className={`sl-card${isSelected ? " sl-card--selected" : ""}`}>
                  <div className="sl-card__top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(doc.id)}
                      aria-label={`تحديد ${doc.filename ?? "ملف"}`}
                    />
                    <span className={`sl-chip sl-chip--${doc.visibility === "public" ? "public" : "private"}`}>
                      {visibilityLabel(doc.visibility)}
                    </span>
                  </div>
                  <Link className="sl-card__preview" href={mediaAdminURL(doc.id)} aria-label={`فتح ${doc.filename ?? "الملف"}`}>
                    {src ? (
                      <AdminImage src={src} alt={doc.filename ?? "معاينة"} className="sl-card__image" />
                    ) : (
                      <span className="sl-card__placeholder">لا معاينة</span>
                    )}
                  </Link>
                  <div className="sl-card__body">
                    <Link className="sl-card__name" href={mediaAdminURL(doc.id)}>
                      {doc.filename ?? `#${doc.id}`}
                    </Link>
                    <p className="sl-card__facts">
                      {mimeLabel(doc.mimeType)}
                      {doc.width && doc.height ? ` · ${doc.width}×${doc.height}` : ""}
                      {` · ${formatBytes(doc.filesize)}`}
                    </p>
                    <p className="sl-card__meta">
                      <span
                        className={`sl-chip sl-chip--alt-${decorative ? "decorative" : altStatus}`}
                        title="حالة النص البديل بالعربية والإنجليزية"
                      >
                        {decorative ? "زخرفية" : `النص البديل: ${ALT_STATUS_LABEL[altStatus]}`}
                      </span>
                      <span className="sl-chip sl-chip--usage">
                        {usage > 0 ? `مستخدمة في ${usage} موضع` : "غير مستخدمة"}
                      </span>
                      {duplicateId(doc) !== null && (
                        <Link className="sl-chip sl-chip--duplicate" href={mediaAdminURL(duplicateId(doc) as string)}>
                          نسخة مكررة من ملف سابق
                        </Link>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="sl-library__pager" aria-label="تنقل بين الصفحات">
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            السابق
          </button>
          <span className="sl-library__pager-status">
            صفحة {page} من {totalPages}
          </span>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            التالي
          </button>
        </nav>
      )}

      <p className="sl-visually-hidden" role="status" aria-live="polite">
        {busy ? "جارٍ تنفيذ الإجراء…" : ""}
      </p>

      {uploadOpen && (
        <MediaUploadDialog
          canSvg={capabilities?.svgUpload ?? false}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

export default MediaLibraryView;
