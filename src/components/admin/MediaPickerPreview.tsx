"use client";

import { useState } from "react";

import { MediaPickerDialog } from "./MediaPicker";
import { AdminImage } from "./media/AdminImage";
import { previewURL, visibilityLabel, type MediaDoc } from "./media/client";

/**
 * PICKER PREVIEW — the review surface for the media picker (§15).
 *
 * Reachable at `/admin/media-picker` for authenticated staff and NOT linked in the navigation. Its
 * job is to make the picker inspectable before the phases that own content fields (Pages, Services,
 * Projects, Articles) exist: the owner and the QA suite can browse, search, filter, upload and pick
 * here, and see exactly what an editor will see.
 *
 * When Phase E wires `MediaPickerField` into real fields, this view becomes redundant and can be
 * deleted in one line (its registration lives in `payload.config.ts`).
 */
export function MediaPickerPreview() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<MediaDoc | null>(null);

  return (
    <div className="sl-library" style={{ padding: "1.5rem", maxWidth: "72rem", margin: "0 auto" }}>
      <h1 className="sl-library__title">اختيار صورة — معاينة</h1>
      <p className="sl-library__subtitle">
        هذه صفحة معاينة لأداة اختيار الوسائط. نفس الأداة ستظهر داخل حقول المحتوى في المراحل القادمة، بحيث لا
        يحتاج المحرر إلى معرفة مسار ملف أو معرّف صورة.
      </p>

      <div className="sl-panel" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn--style-primary" onClick={() => setOpen(true)}>
            اختر صورة
          </button>
          {picked && (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {previewURL(picked) && (
                <AdminImage
                  src={previewURL(picked) as string}
                  alt={picked.filename ?? "الصورة المختارة"}
                  style={{ width: "96px", height: "72px", objectFit: "cover", borderRadius: "10px" }}
                />
              )}
              <div>
                <p style={{ margin: 0 }}>{picked.filename}</p>
                <p className="description" style={{ margin: 0 }}>
                  {visibilityLabel(picked.visibility)}
                  {picked.width && picked.height ? ` · ${picked.width}×${picked.height}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="description" style={{ marginBottom: 0 }}>
          القيمة المحفوظة في حقول المحتوى هي معرّف الملف فقط — ولا يُطلب من المحرر كتابته أو نسخه مطلقًا.
        </p>
      </div>

      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(doc) => { setPicked(doc); setOpen(false); }} />
    </div>
  );
}

export default MediaPickerPreview;
