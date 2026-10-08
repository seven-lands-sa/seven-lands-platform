# Phase D — Media library UX

What an editor sees and does. Evidence: `.phase-d-evidence/admin-ux-results.json` (52/52),
`.phase-d-evidence/admin-flows-results.json` (18/18), screenshots in `.phase-d-evidence/admin-d/`
(copied to `docs/admin-control-center/phase-d/evidence/`), standing sweep
`scripts/admin-responsive.mjs` (36 surfaces, 0 findings).

---

## 1 · The library (`/admin/collections/media`)

Payload's default table for this collection is replaced by a purpose-built view
(`src/components/admin/MediaLibraryView.tsx`). It keeps Payload's own list machinery — the list query
lives in `ListQueryProvider`, so paging, sorting, filtering and access control stay server-side — and
changes only what the editor interacts with.

| Capability | Implementation |
| --- | --- |
| **Grid** | Tiles with real thumbnails (`thumbnail` derivative, card as fallback), filename, type · dimensions · size. |
| **Search** | Debounced, over filename / sourceFilename / alt / caption. |
| **Filters** | Visibility (عام/خاص), type (JPG/PNG/WebP/AVIF/SVG), tag (controlled vocabulary). |
| **Sort** | Newest · oldest · name (أ–ي) · largest. |
| **Per-tile governance chips** | Visibility, alt completeness (`مكتمل · عربي فقط · إنجليزي فقط · مفقود · زخرفية`), usage (`مستخدمة في N موضع` / `غير مستخدمة`), duplicate link. |
| **Empty state** | Explains what to do next instead of showing an empty table. |
| **Paging** | Previous/next with "صفحة X من Y". |
| **URL state** | Filters, sort, paging and search live in the URL, so a filtered view can be linked and refreshed. |

## 2 · Upload (`رفع صورة`)

One dialog, two ways in: a drop zone **and** a real `<input type="file">` (§35 — drag/drop is an
addition, never the only path). While uploading, the dialog shows a progress bar with the phase
(`uploading` → `processing` → success/failure); the browser pass observed `role="progressbar"` during
a real upload.

Fields: alt AR, alt EN, caption AR, caption EN, visibility (defaults to **خاص**), decorative
checkbox, tags. The dialog states the rule that matters — "the file uploads private by default" — and
the alt text fields carry real examples (`مثال: واجهة المتجر الرئيسية في بريدة`).

After the file lands, English metadata is written by a second, explicit localized request, so a
half-filled translation can never masquerade as complete (verified: `alt` AR + `alt` EN stored
separately, and the EN read returns its own value, never the Arabic one).

## 3 · Detail view (`/admin/collections/media/:id`)

Payload's document editor with three media-specific surfaces:

- **Alt status panel** — alt and caption completeness per locale, visible before anything else.
- **Usage panel** — "أين تُستخدم هذه الصورة": every reference with its owning entity, field label and
  a link to go and change it; `غير مستخدمة في أي مكان` with an explanation when there is none (§14, §18).
- **Actions panel** — *اجعلها عامة / اجعلها خاصة*, *استبدال الملف*, *حذف الملف*. Delete is disabled
  while the asset is referenced and says why in visible Arabic text (not only a tooltip) — the
  refusal also appears if the API is called directly.

Focal point is Payload's native field (`focalX/focalY`), editable in the sidebar; the public resolver
normalises it once for the frontend (§9). No internal IDs are shown anywhere in the editor — the
picker hands Phase E the value, the URL carries the id, and the editor never copies anything.

## 4 · Picker (`/admin/media-picker`, and `MediaPickerField`)

The picker is a dialog with the same browse/search/filter/preview capabilities as the library, plus:

- **status before choosing** — public/private chip on every tile, and a warning line for assets that
  are private or missing alt text ("لن يظهر للزوار حتى تجعله عامًا" / "النص البديل ناقص…");
- **upload without leaving the flow** — `رفع صورة جديدة` opens the same upload dialog and reloads the
  list;
- **selection returns the asset**, so a future content field stores the reference automatically.

`MediaPickerField` is the drop-in field component for Phase E
(`admin.components.Field: "/components/admin/MediaPicker#MediaPickerField"`); the review page at
`/admin/media-picker` exists so the picker could be inspected and verified *before* the phases that
own content fields, and is deletable in one line when those fields exist.

A real defect was found and fixed here: the picker's search used the REST `?search=` parameter, which
the admin resolves server-side but the REST API silently ignores — the dialog returned the whole
library instead of matches. The search now builds the explicit `where[or][…][like]` query from the
same field list the collection declares ($13/$15).

## 5 · Bulk actions (§29)

Selection bar: make public / make private, add tag, remove tag, delete selected, clear selection.
Every action runs **per asset**, so one protected file cannot make a bulk operation half-succeed:
deletions that are refused are reported in Arabic with the count and names
(`لم تُحذف N ملفات لأنها مستخدمة في الموقع: …`). Visibility and tag changes are ordinary `PATCH`
calls guarded by `media.visibility` / `media.update`.

## 6 · Responsiveness (§33)

Measured at 390 / 768 / 1024 / 1440 on grid, detail, upload dialog, picker — plus the standing sweep
across the six globals, media, users and the picker:

| Width | Result |
| --- | --- |
| 390 | tiles reflow to a single column, filters wrap, modals fit, no page-level overflow |
| 768 | two columns, filters in one row, detail panels stack |
| 1024 | three columns, full filter row |
| 1440 | full grid + panels side by side |

`ADMIN_SHOT_DIR=.phase-d-evidence/admin-d node scripts/admin-responsive.mjs` → **36 surfaces checked,
0 overflow/error findings**.

## 7 · Accessibility (§34)

- Tiles are keyboard reachable (preview and filename are real links; selection checkboxes are labelled).
- Every control has a label or `aria-label` (search, filters, selection, bulk bar, modals, dialog
  titles via `aria-labelledby`); the bulk bar is a `region` with a name.
- Progress and busy states are announced (`role="progressbar"`, `aria-live` status).
- Error and confirmation flows are Arabic text + `window.confirm` with explicit consequences.
- `axe` (Playwright, WCAG 2 A/AA) reports **0 serious or critical issues** on both the library and the
  picker. Two contrast defects were fixed to reach that: my own subtitle colour (3.94:1 → AA) and
  Payload's language-switcher label (3.31:1), which ships with the admin and is corrected with one
  scoped rule.

## 8 · What is deliberately not here

- No folder tree (§28), no DAM metadata editor, no per-viewport image slots (§10), no AI alt text
  (§11), no force-delete (§19), no bulk editing of arbitrary fields — bulk actions are limited to the
  three governance operations that an editor actually performs in a batch.
