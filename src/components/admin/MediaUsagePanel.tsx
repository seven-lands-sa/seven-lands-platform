"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchUsage, type UsageReference } from "./media/client";

/**
 * USAGE (§16, §17, §18) — "where is this image used?", answered from the database.
 *
 * The same question decides whether deletion is allowed, so the panel and the delete guard read the
 * exact same source: the collection's usage endpoint. If this panel says "غير مستخدمة", deletion is
 * permitted; if it lists places, deletion is refused with those places named.
 */
export function MediaUsagePanel() {
  const { id } = useDocumentInfo();
  const [references, setReferences] = useState<UsageReference[] | null>(null);

  useEffect(() => {
    if (id === undefined) return;
    let alive = true;
    fetchUsage(id).then((value) => {
      if (alive) setReferences(value);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (id === undefined) {
    return (
      <div className="sl-panel">
        <p className="description" style={{ margin: 0 }}>تُحتسب مواضع الاستخدام بعد حفظ الملف.</p>
      </div>
    );
  }

  if (references === null) {
    return (
      <div className="sl-panel">
        <p className="description" style={{ margin: 0 }}>جارٍ البحث عن مواضع الاستخدام…</p>
      </div>
    );
  }

  if (references.length === 0) {
    return (
      <div className="sl-panel">
        <p style={{ margin: 0 }}>
          <span className="sl-chip sl-chip--usage">غير مستخدمة</span>{" "}
          <span className="description">
            لا يستخدم هذه الصورة أي جزء من الموقع حاليًا، لذلك يمكن حذفها بأمان من زر الحذف.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="sl-panel">
      <p style={{ margin: "0 0 0.5rem" }}>
        <span className="sl-chip sl-chip--usage sl-chip--usage-on">مستخدمة في {references.length} موضع</span>
      </p>
      <ul className="sl-usage-list">
        {references.map((reference) => (
          <li key={`${reference.slug}-${reference.fieldPath}`}>
            <Link href={reference.href}>
              {reference.label} → {reference.documentTitle ?? reference.documentId ?? ""} → {reference.fieldLabel}
            </Link>
          </li>
        ))}
      </ul>
      <p className="description" style={{ marginBottom: 0 }}>
        لن يُسمح بحذف الصورة قبل إزالتها من هذه المواضع — لا تُفرَّغ الإشارات تلقائيًا أبدًا.
      </p>
    </div>
  );
}

export default MediaUsagePanel;
