"use client";

import { toast } from "@payloadcms/ui";
import { useRef, useState } from "react";

import {
  MEDIA_TAGS,
  errorMessage,
  type MediaCapabilities,
} from "./media/client";

/**
 * UPLOAD (§6, §36, §37) — one file at a time, with the metadata that makes it usable.
 *
 * Why single-file: alt text and captions are per-image editorial decisions, and a queue that asks
 * for them afterwards is how libraries end up with fifty undocumented files. One file, four fields,
 * done.
 *
 * Progress is honest about phases: "uploading" is the browser's own byte counter (XHR progress);
 * "processing" is the server stripping EXIF, re-encoding and generating derivatives — for a large
 * photo that is the slower half, and an editor who doesn't see it thinks the dialog froze.
 *
 * Two writes, both deterministic: create with the Arabic locale, then a targeted `locale=en` patch
 * only when English text was typed. There is no AR→EN inheritance anywhere in this flow (§12).
 */
export function MediaUploadDialog({
  onClose,
  onUploaded,
  canSvg,
}: {
  onClose: () => void;
  onUploaded: () => void;
  canSvg: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [decorative, setDecorative] = useState(false);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [tags, setTags] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing" | "done">("idle");
  const [percent, setPercent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const busy = phase === "uploading" || phase === "processing";

  const pick = (candidate: File | null | undefined) => {
    if (!candidate) return;
    setFile(candidate);
    setPhase("idle");
    setPercent(0);
  };

  const submit = async () => {
    if (!file || busy) return;
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    if (isSvg && !canSvg) {
      toast.error("رفع ملفات SVG يحتاج صلاحية خاصة. اطلب من مدير النظام رفع الملف.");
      return;
    }

    setPhase("uploading");
    setPercent(0);

    /* Arabic locale create — multipart so the binary and the metadata arrive together. */
    const form = new FormData();
    form.append("file", file, file.name);
    const payload: Record<string, unknown> = { visibility, tags };
    if (altAr.trim()) payload.alt = altAr.trim();
    if (captionAr.trim()) payload.caption = captionAr.trim();
    if (decorative) payload.decorative = true;
    form.append("_payload", JSON.stringify(payload));

    const created = await new Promise<{ ok: boolean; status: number; body: unknown }>((resolve) => {
      const request = new XMLHttpRequest();
      request.open("POST", "/api/media?locale=ar");
      request.withCredentials = true;
      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const ratio = Math.round((event.loaded / event.total) * 100);
        setPercent(ratio);
        /* Bytes are in; what follows is the server pipeline. Say so instead of freezing at 100%. */
        if (ratio >= 100) setPhase("processing");
      };
      request.upload.onload = () => setPhase("processing");
      request.onload = () => {
        let body: unknown = null;
        try {
          body = JSON.parse(request.responseText);
        } catch {
          body = null;
        }
        resolve({ ok: request.status >= 200 && request.status < 300, status: request.status, body });
      };
      request.onerror = () => resolve({ ok: false, status: 0, body: null });
      request.send(form);
    });

    if (!created.ok) {
      setPhase("idle");
      const message =
        (created.body as { errors?: { message?: string }[]; message?: string } | null)?.errors?.[0]?.message ??
        (created.body as { message?: string } | null)?.message ??
        "تعذّر رفع الملف. تأكد من نوعه وحجمه ثم أعد المحاولة.";
      toast.error(message);
      return;
    }

    const doc = (created.body as { doc?: { id?: string | number } } | null)?.doc;
    const id = doc?.id;

    /* English text, when provided, is written as its own locale. Never inherited from Arabic. */
    if (id !== undefined && (altEn.trim() || captionEn.trim())) {
      setPhase("processing");
      const patch: Record<string, unknown> = {};
      if (altEn.trim()) patch.alt = altEn.trim();
      if (captionEn.trim()) patch.caption = captionEn.trim();
      const response = await fetch(`/api/media/${id}?locale=en`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        toast.error(await errorMessage(response, "تم رفع الملف، لكن تعذّر حفظ النص الإنجليزي."));
      }
    }

    setPhase("done");
    toast.success("تم رفع الملف وإضافته إلى المكتبة.");
    onUploaded();
  };

  return (
    <div className="sl-modal" role="dialog" aria-modal="true" aria-labelledby="sl-upload-title">
      <div className="sl-modal__panel">
        <div className="sl-modal__head">
          <h2 id="sl-upload-title">رفع صورة إلى المكتبة</h2>
          <button type="button" className="btn btn--style-secondary btn--size-small" onClick={onClose} disabled={busy}>
            إغلاق
          </button>
        </div>

        <div
          className={`sl-dropzone${dragging ? " sl-dropzone--active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer?.files?.[0]);
          }}
        >
          {/* The file input is always present — drag and drop is a shortcut, never the only way (§35). */}
          <input
            ref={inputRef}
            id="sl-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="sl-visually-hidden"
            onChange={(event) => pick(event.target.files?.[0])}
          />
          <label htmlFor="sl-upload-input" className="btn btn--style-secondary">
            اختر ملفًا
          </label>
          <p className="description" style={{ margin: "0.5rem 0 0" }}>
            أو اسحب الصورة وأفلتها هنا. الأنواع المسموحة: JPG، PNG، WebP، AVIF{canSvg ? "، SVG" : ""}.
            الحد الأقصى 10 ميجابايت.
          </p>
          {file && (
            <p className="sl-dropzone__file">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} م.ب
            </p>
          )}
        </div>

        {busy && (
          <div className="sl-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="sl-progress__bar" style={{ width: `${phase === "uploading" ? percent : 100}%` }} />
            <p className="sl-progress__label" aria-live="polite">
              {phase === "uploading" ? `جارٍ الرفع… ${percent}%` : "جارٍ المعالجة وإنشاء النسخ…"}
            </p>
          </div>
        )}

        <div className="sl-form">
          <div className="sl-form__row">
            <label className="sl-field sl-field--grow">
              <span className="sl-field__label">النص البديل (عربي)</span>
              <input
                className="sl-input"
                value={altAr}
                onChange={(event) => setAltAr(event.target.value)}
                placeholder="مثال: واجهة المتجر الرئيسية في بريدة"
                disabled={busy}
              />
            </label>
            <label className="sl-field sl-field--grow">
              <span className="sl-field__label">النص البديل (إنجليزي)</span>
              <input
                className="sl-input"
                value={altEn}
                onChange={(event) => setAltEn(event.target.value)}
                placeholder="Example: the main retail façade in Buraydah"
                dir="ltr"
                disabled={busy}
              />
            </label>
          </div>

          <div className="sl-form__row">
            <label className="sl-field sl-field--grow">
              <span className="sl-field__label">التعليق (عربي) — اختياري</span>
              <input className="sl-input" value={captionAr} onChange={(event) => setCaptionAr(event.target.value)} disabled={busy} />
            </label>
            <label className="sl-field sl-field--grow">
              <span className="sl-field__label">التعليق (إنجليزي) — اختياري</span>
              <input
                className="sl-input"
                value={captionEn}
                onChange={(event) => setCaptionEn(event.target.value)}
                dir="ltr"
                disabled={busy}
              />
            </label>
          </div>

          <div className="sl-form__row">
            <label className="sl-field">
              <span className="sl-field__label">الظهور</span>
              <select
                className="sl-select"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as "private" | "public")}
                disabled={busy}
              >
                <option value="private">خاص — لا يظهر للزوار</option>
                <option value="public">عام — يمكن استخدامه في الموقع</option>
              </select>
            </label>

            <label className="sl-field" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={decorative} onChange={(event) => setDecorative(event.target.checked)} disabled={busy} />
              <span className="sl-field__label" style={{ margin: 0 }}>
                صورة زخرفية (لا تحتاج نصًا بديلًا)
              </span>
            </label>
          </div>

          <fieldset className="sl-field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sl-field__label">الوسوم</legend>
            <div className="sl-chips">
              {MEDIA_TAGS.map((entry) => {
                const active = tags.includes(entry.value);
                return (
                  <button
                    key={entry.value}
                    type="button"
                    aria-pressed={active}
                    className={`sl-chip sl-chip--toggle${active ? " sl-chip--on" : ""}`}
                    onClick={() =>
                      setTags((current) =>
                        current.includes(entry.value)
                          ? current.filter((value) => value !== entry.value)
                          : [...current, entry.value],
                      )
                    }
                    disabled={busy}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="sl-modal__actions">
          <button type="button" className="btn btn--style-primary" onClick={() => void submit()} disabled={!file || busy}>
            رفع الملف
          </button>
          <button type="button" className="btn btn--style-secondary" onClick={onClose} disabled={busy}>
            إلغاء
          </button>
          <span className="description">
            الملف يُرفع «خاصًا» افتراضيًا. النص البديل مهم لظهور الصورة في محركات البحث وقارئات الشاشة.
          </span>
        </div>
      </div>
    </div>
  );
}

export type { MediaCapabilities };
export default MediaUploadDialog;
