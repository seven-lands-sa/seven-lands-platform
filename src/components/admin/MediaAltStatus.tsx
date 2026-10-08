"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useEffect, useState } from "react";

import { fetchLibraryMeta, type AltStatus } from "./media/client";

/**
 * ALT COMPLETENESS (§11, §12) — the panel that makes the bilingual requirement visible before
 * publication, not after.
 *
 * The rule the site will enforce in a later phase: a meaningful image cannot be published without
 * Arabic AND English alt text. Because the fields use `localization.fallback: false`, "Arabic only"
 * is a real, detectable state — and this panel is where the editor sees it, in advance. Decorative
 * images are explicitly exempt, which is why marking one is a deliberate act rather than an
 * absence of text.
 */

const LABELS: Record<AltStatus, string> = {
  complete: "مكتمل (عربي وإنجليزي)",
  "ar-only": "عربي فقط — النص الإنجليزي ناقص",
  "en-only": "إنجليزي فقط — النص العربي ناقص",
  missing: "مفقود",
};

export function MediaAltStatus() {
  const { id } = useDocumentInfo();
  const [status, setStatus] = useState<{ alt: AltStatus; caption: AltStatus; decorative: boolean } | null>(null);

  useEffect(() => {
    if (id === undefined) return;
    let alive = true;
    fetchLibraryMeta([id]).then((meta) => {
      if (!alive) return;
      setStatus({
        alt: meta.altStatus[String(id)] ?? "missing",
        caption: meta.captionStatus[String(id)] ?? "missing",
        decorative: meta.decorative[String(id)] === true,
      });
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (id === undefined) {
    return (
      <div className="sl-panel">
        <p className="description" style={{ margin: 0 }}>
          سيظهر تقييم النص البديل بعد حفظ الملف.
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="sl-panel">
        <p className="description" style={{ margin: 0 }}>جارٍ فحص اللغتين…</p>
      </div>
    );
  }

  if (status.decorative) {
    return (
      <div className="sl-panel">
        <p style={{ margin: 0 }}>
          <span className="sl-chip sl-chip--alt-decorative">صورة زخرفية</span>{" "}
          <span className="description">لا يُطلب نص بديل، وستُقرأ على قارئات الشاشة كصورة فارغة.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="sl-panel">
      <ul className="sl-checks">
        <li>
          <span className={`sl-chip sl-chip--alt-${status.alt}`}>{LABELS[status.alt]}</span>
          <span className="description"> النص البديل</span>
        </li>
        <li>
          <span className={`sl-chip sl-chip--alt-${status.caption === "missing" ? "decorative" : status.caption}`}>
            {status.caption === "missing" ? "غير مضاف (اختياري)" : LABELS[status.caption]}
          </span>
          <span className="description"> التعليق</span>
        </li>
      </ul>
      {status.alt !== "complete" && (
        <p className="description" style={{ marginBottom: 0 }}>
          أكمل النص البديل بالعربية والإنجليزية قبل استخدام الصورة في الموقع. العربية والإنجليزية مستقلتان —
          لا يُنسخ أحدهما عن الآخر تلقائيًا.
        </p>
      )}
    </div>
  );
}

export default MediaAltStatus;
