"use client";

import { toast, useDocumentInfo, useFormModified } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { errorMessage, fetchCapabilities, fetchUsage, type MediaCapabilities } from "./media/client";

/**
 * ASSET ACTIONS (§14, §18, §20) — visibility, binary replacement and safe deletion, on one panel.
 *
 * Three deliberate design points:
 *   • Visibility is presented as a publication decision, not a toggle: taking an image private is
 *     described by what it does to the live site.
 *   • Replacement keeps the asset's identity, so every reference (and every future page) keeps
 *     working. The file you get back is re-validated and re-processed, never trusted.
 *   • Delete is disabled — with the reason shown — while the asset is referenced anywhere. There is
 *     no override button in V1: a missing image on a live page is worse than a file that stays in
 *     the library for a while.
 */
export function MediaActionsPanel() {
  const { id, data } = useDocumentInfo();
  const router = useRouter();
  const modified = useFormModified();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [capabilities, setCapabilities] = useState<MediaCapabilities | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [busy, setBusy] = useState<"none" | "visibility" | "replace" | "delete">("none");
  const [percent, setPercent] = useState(0);

  const visibility = (data?.visibility as string | undefined) ?? "private";

  useEffect(() => {
    let alive = true;
    fetchCapabilities().then((value) => {
      if (alive) setCapabilities(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (id === undefined) return;
    let alive = true;
    fetchUsage(id).then((references) => {
      if (alive) setUsage(references.length);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const guardUnsaved = (): boolean => {
    if (!modified) return true;
    toast.error("لديك تعديلات غير محفوظة. احفظها أولًا ثم أعد المحاولة.");
    return false;
  };

  const changeVisibility = async (next: "public" | "private") => {
    if (id === undefined || !guardUnsaved()) return;
    const confirmation =
      next === "private"
        ? "سيتوقف عرض هذه الصورة للزوار فورًا. هل تريد جعلها خاصة؟"
        : "ستصبح هذه الصورة متاحة لأي زائر يعرف رابطها، ويمكن استخدامها في الموقع. هل تريد جعلها عامة؟";
    if (!window.confirm(confirmation)) return;

    setBusy("visibility");
    const response = await fetch(`/api/media/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });
    setBusy("none");
    if (!response.ok) {
      toast.error(await errorMessage(response, "تعذّر تغيير الظهور."));
      return;
    }
    toast.success(next === "public" ? "أصبحت الصورة عامة." : "أصبحت الصورة خاصة.");
    router.refresh();
  };

  const replaceBinary = async (file: File) => {
    if (id === undefined || !guardUnsaved()) return;
    setBusy("replace");
    setPercent(0);

    const form = new FormData();
    form.append("file", file, file.name);

    const result = await new Promise<{ ok: boolean; message?: string }>((resolve) => {
      const request = new XMLHttpRequest();
      request.open("POST", `/api/media/${id}/replace`);
      request.withCredentials = true;
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) setPercent(Math.round((event.loaded / event.total) * 100));
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) resolve({ ok: true });
        else {
          let message = "تعذّر استبدال الملف.";
          try {
            const body = JSON.parse(request.responseText) as { errors?: { message?: string }[] };
            message = body.errors?.[0]?.message ?? message;
          } catch {
            /* keep the fallback */
          }
          resolve({ ok: false, message });
        }
      };
      request.onerror = () => resolve({ ok: false, message: "انقطع الاتصال أثناء الاستبدال." });
      request.send(form);
    });

    setBusy("none");
    if (!result.ok) {
      toast.error(result.message ?? "تعذّر استبدال الملف.");
      return;
    }
    toast.success("تم استبدال الملف وتحديث نسخ العرض تلقائيًا.");
    router.refresh();
  };

  const remove = async () => {
    if (id === undefined || !guardUnsaved()) return;
    if (!window.confirm("سيتم حذف الملف نهائيًا من المكتبة. هل أنت متأكد؟")) return;

    setBusy("delete");
    const response = await fetch(`/api/media/${id}`, { method: "DELETE", credentials: "include" });
    setBusy("none");
    if (!response.ok) {
      toast.error(await errorMessage(response, "تعذّر حذف الملف."));
      return;
    }
    toast.success("تم حذف الملف.");
    router.push("/admin/collections/media");
  };

  if (id === undefined) {
    return (
      <div className="sl-panel">
        <p className="description" style={{ margin: 0 }}>تُتاح إجراءات الملف بعد حفظه.</p>
      </div>
    );
  }

  return (
    <div className="sl-panel">
      <div className="sl-actions">
        {capabilities?.visibility && (
          <>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={busy !== "none" || visibility === "public"}
              onClick={() => void changeVisibility("public")}
            >
              اجعلها عامة
            </button>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={busy !== "none" || visibility === "private"}
              onClick={() => void changeVisibility("private")}
            >
              اجعلها خاصة
            </button>
          </>
        )}

        {capabilities?.upload && (
          <>
            <input
              ref={fileInput}
              id="sl-replace-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="sl-visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void replaceBinary(file);
              }}
            />
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              disabled={busy !== "none"}
              onClick={() => fileInput.current?.click()}
            >
              استبدال الملف
            </button>
          </>
        )}

        {capabilities?.delete && (
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            disabled={busy !== "none" || usage === null || usage > 0}
            title={usage && usage > 0 ? "لا يمكن الحذف: الملف مستخدم في الموقع" : undefined}
            onClick={() => void remove()}
          >
            حذف الملف
          </button>
        )}
      </div>

      {capabilities?.delete && usage !== null && usage > 0 && (
        <p className="sl-actions__note" role="note">
          لا يمكن حذف هذا الملف لأنه مستخدم في الموقع ({usage} موضع) — راجع قسم «أين تُستخدم هذه الصورة» أعلاه، وأزل
          الاستخدام أولًا.
        </p>
      )}

      {busy === "replace" && (
        <div className="sl-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="sl-progress__bar" style={{ width: `${percent}%` }} />
          <p className="sl-progress__label">جارٍ استبدال الملف… {percent}%</p>
        </div>
      )}

      {usage !== null && usage > 0 && capabilities?.delete && (
        <p className="description" style={{ marginBottom: 0 }}>
          الحذف معطّل لأن الملف مستخدم في {usage} موضع. أزل الإشارات من الملف أولًا — لا يُفرَّغ أي مرجع تلقائيًا.
        </p>
      )}

      <p className="description" style={{ marginBottom: 0 }}>
        الاستبدال يحافظ على هوية الملف، لذلك تبقى كل الإشارات إليه صحيحة، وتُعاد نسخ العرض تلقائيًا.
      </p>
    </div>
  );
}

export default MediaActionsPanel;
