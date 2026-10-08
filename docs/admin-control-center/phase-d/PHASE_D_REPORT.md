# PHASE D — MEDIA LIBRARY PRODUCTIZATION · FINAL REPORT (§56)

**PHASE_D_STATUS = PASS**
Date: 2026-10-07 · Database: local development PostgreSQL only · **PRODUCTION_MUTATED = NO**
Scope executed: §1–§57 of the authorization message. **HARD STOP respected — no Phase E work started.**

---

## A · PHASE

`PHASE_D_STATUS = PASS`. Every §48–§53 suite passes on the frozen production build; the public site is
byte-visually unchanged; the database is built from migrations only; nothing in production was touched.

## B · MEDIA MODEL

| Flag | Value |
| --- | --- |
| `FIELDS` | `filename` · `sourceFilename` · `mimeType` · `filesize` · `width` · `height` · `url`/`sizes.*` · `visibility` · `decorative` · `alt{ar,en}` · `caption{ar,en}` · `tags[]` · `focalX`/`focalY` · `contentHash` · `duplicateOf` · `createdBy` · `replacedAt` · `createdAt`/`updatedAt` (+ admin-only UI fields `altStatus`, `usage`, `assetActions`). Nothing added without an operational consumer. |
| `VISIBILITY` | `private` (default, enforced) \| `public`. Byte-level enforcement preserved and re-measured. |
| `LOCALIZATION` | `alt`, `caption` localized ar/en with `fallback: false` — a missing English value is null, never the Arabic text. |
| `TAGS` | Controlled select vocabulary (`brand · website · services · projects · articles · social · og · team · other`), `hasMany`. Folders rejected (§28). |
| `FOCAL_POINT` | Payload-native `focalX`/`focalY` numbers, 400×300-style crops use them; the public resolver normalises once to 0–1 (`focalPointOf()`, verified for both conventions: `62 → 0.62`, `0.62 → 0.62`). Never a CSS string. |

## C · TYPES

| Flag | Value |
| --- | --- |
| `ALLOWED` | `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/svg+xml` (controlled). No video, no arbitrary documents. |
| `SVG_POLICY` | High-risk permission `media.svg_upload` **+** structural refusal (`<script>`, `foreignObject`, iframes/embed/object, media elements, `on*=` handlers, `javascript:`, embedded HTML, DOCTYPE/ENTITY, external stylesheets and references, `@import`, `<use>` to external/data, SMIL rewriting an event handler, missing `<svg>`) **+** delivery backstop CSP `default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox` and `X-Content-Type-Options: nosniff` on every `/api/media/file/*` response. Not rasterised, not silently rewritten. |
| `MAX_SIZE` | Images **10 MB**, SVG **1 MB**. Payload's own multipart gate sits inside this and is documented as the outer layer. |
| `MIME_SNIFFING` | Magic bytes decide the type; extension⟷content and declared-MIME⟷content must both agree, otherwise refused in Arabic. Confirmed: JPEG bytes named `.png` → 400 «نوع الملف لا يطابق محتواه…»; text renamed `.jpg` → 400 «تعذّر التعرّف على نوع الملف…». |

## D · PROCESSING

| Flag | Value |
| --- | --- |
| `DERIVATIVES` | original · `thumbnail` 400×300 · `card` 768×512 · `content` 1200×900. Never upscaled (a small source yields fewer sizes). `hero` deferred to Phase E with the reason documented. |
| `FORMATS` | Format preserved per upload (JPEG q90 mozjpeg, PNG with alpha, WebP, AVIF). No silent conversion. |
| `EXIF_POLICY` | Measured: stored original and all derivatives carry **no EXIF** (GPS, make/model/software gone), orientation applied to pixels then removed (orientation 6 upload 2400×1600 → stored upright 1600×2400). |
| `PROCESSOR` | sharp (bundled with Payload). One shared `normaliseRaster()` used by upload and replacement. |

## E · LIBRARY UX

| Flag | Value |
| --- | --- |
| `GRID` | Purpose-built view replacing the raw table: thumbnail tiles, visibility chip, alt-completeness chip, usage chip, duplicate link, empty state, paging. |
| `SEARCH` | Debounced over filename / sourceFilename / alt / caption (server-side list query). |
| `FILTERS` | Visibility · type · tag. |
| `SORT` | Newest · oldest · name (أ–ي) · largest. |
| `DETAIL_PANEL` | Payload editor + alt-status panel + "where is this used" panel + actions (visibility, replace file, delete-if-safe) with visible Arabic refusal text. No internal IDs presented to the editor. |
| `RESPONSIVE` | Verified 390/768/1024/1440 on grid, detail, upload, picker; standing sweep 36 surfaces / 0 findings. |

## F · PICKER

| Flag | Value |
| --- | --- |
| `EXISTING_SELECT` | Yes — browsing/selection returns the asset; the future field stores the reference, the editor never copies an id. |
| `UPLOAD_FROM_PICKER` | Yes — «رفع صورة جديدة» opens the same upload dialog and reloads the list. |
| `SEARCH` | Yes — and a real defect was found and fixed here: REST ignores `?search=`, so the picker now builds the explicit `where[or][…][like]` query (search returned the whole library before). |
| `FILTER` | Visibility · type · tag, with public/private chips and alt-completeness warnings on every tile before choosing. |
| `ACCESSIBILITY` | Keyboard reachable, labelled controls, dialog named, axe: 0 serious/critical. `MediaPickerField` is the drop-in field component for Phase E; `/admin/media-picker` is the review surface. |

## G · USAGE

| Flag | Value |
| --- | --- |
| `TRACKING_MODEL` | Explicit reference registry (`src/lib/media/usage.ts`) + live database queries. Never a repository text search, never a cached counter. |
| `CURRENT_ENTITY_SUPPORT` | Every media-bearing path that exists today: Site Settings → `brand.logo · logoLight · logoDark · favicon · defaultOgImage`. New content types append one line each. |
| `USAGE_COUNT` | Batched per grid page via `GET /api/media/library-meta`; unused assets report **0** correctly. |
| `USAGE_DETAIL` | `GET /api/media/:id/usage` → entity label + field label + link, e.g. «الإعدادات العامة → صورة المشاركة الافتراضية». |

## H · DELETE

| Flag | Value |
| --- | --- |
| `UNUSED_DELETE` | Allowed after confirmation; original + derivatives removed from storage; `media_deleted` audited. |
| `REFERENCED_DELETE` | **Blocked.** «لا يمكن حذف هذه الصورة لأنها مستخدمة في: • الإعدادات العامة → صورة المشاركة الافتراضية». Nothing is auto-nulled; removing the real reference makes the same asset deletable immediately. |
| `FORCE_DELETE` | **Does not exist** in V1 (§19). |
| `AUDIT` | `media_uploaded · media_updated · media_binary_replaced · media_visibility_changed · media_deleted · media_delete_blocked`, each with actor, asset, changed fields, timestamp; never the binary. `media_delete_blocked` is written **outside the failed delete's transaction** so refusals survive the rollback (a real bug the suite caught). |

## I · REPLACE

| Flag | Value |
| --- | --- |
| `BINARY_REPLACE` | Supported, with the full gate re-run: sniffing, contracts, sizes, SVG rules; identical bytes refused by hash; raster↔SVG switches refused. |
| `DERIVATIVES` | Fully regenerated; dimensions updated; `replacedAt` set. Verified: previous derivative URL stops resolving (404/403), new URL serves the new bytes. |
| `CACHE_INVALIDATION` | `media:{id}` + dependent tags invalidated; the URL itself moves (content stamp) so nothing can serve the old picture from the old address. |
| `IDENTITY_POLICY` | The document — id, references, alt, caption, tags, focal point, visibility — never changes. Only the stored filename/URL follows the new bytes: `hero-workshop-9a02ffce.jpg`. Repeated replacements do not accumulate counters. |

## J · SECURITY

| Flag | Value |
| --- | --- |
| `PRIVATE_ORIGINAL` | anonymous **403** (authenticated staff 200) |
| `PRIVATE_DERIVATIVES` | anonymous **403 / 403** (thumbnail, card) |
| `PUBLIC_ORIGINAL` | anonymous **200** |
| `PUBLIC_DERIVATIVES` | anonymous **200** |
| `SVG` | permission + refusal + CSP backstop (see §C) |
| `MIME` | spoofed and mismatched types refused in Arabic (production build verified) |
| `OVERSIZE` | refused with the limit named in Arabic; Payload's outer byte gate documented |

Also fixed in this phase: every product-level Arabic refusal now survives the production build.
Payload only shows an error's message when its `name` survives minification; our APIErrors came out
unnamed, so every refusal had been replaced by *"An unknown error occurred."* in production
(`src/lib/errors.ts` → `publicError`).

## K · STORAGE

| Flag | Value |
| --- | --- |
| `DEVELOPMENT` | Local disk (`MEDIA_DIR`, default `./media`), served through the access-checked file route. |
| `PRODUCTION_TARGET` | Cloudflare R2 or any S3-compatible store — **documented boundary only, nothing provisioned, nothing paid**. |
| `PRIVATE_DELIVERY` | Private bucket / prefix, never publicly readable; short-lived signed URLs (recommended 5–15 min). |
| `PUBLIC_DELIVERY` | Per-object consequence of an explicit `public` transition, via CDN custom domain (recommended) or the app route. |
| `CDN_POLICY` | No immutable long-lived caching of visibility-mutable assets: current header is `private, no-store`; a future CDN needs short TTL + explicit purge on visibility change/replacement/delete, preserving first-request revocation. Details: `phase-d/STORAGE_ARCHITECTURE.md`. |

## L · RBAC

| Role | Effective media permissions (verified in the matrix) |
| --- | --- |
| `viewer` | read only — upload 403, metadata edit 403, visibility 403, delete 403 |
| `editor` | read · upload · update · visibility — delete **403** |
| `marketing` | read · upload · update · visibility — delete **403** |
| `admin` | read · upload · update · visibility — delete **403** |
| `super_admin` | all (bypass), including delete and SVG upload |

Editors cannot delete shared production assets; deletion and SVG upload are separate high-risk
permissions granted deliberately.

## M · ADMIN OVERFLOW (§32)

| Flag | Value |
| --- | --- |
| `ROOT_CAUSE` | Payload's list "bleed": `.table` is `position: relative` with negative/positive offsets plus two gutters of width so the table reaches the screen edges; the inner `<table>` keeps its intrinsic column min-widths. At ≤1024 px the shift pushed the table's box past the viewport (measured: 16 px at 390/768, 80 px at 1024 — the owner-reported ~32 px shortfall plus the bleed). |
| `FIX` | Scoped CSS in `src/app/(payload)/custom.scss`, `@media (max-width: 1279px)` only: the container becomes the scroll surface (`overflow-x: auto` on the list's table wrapper) and the bleed is cancelled (`width/max-width: 100%`, `left: auto`, `padding-left: 0`). The table scrolls **inside** its container; desktop ≥1280 px is untouched. No node_modules patch, no generated-hash selectors, no hidden columns, no redesign. |
| `390` | 0 page-level overflow (Media, Users, Roles, Audit Events) |
| `768` | 0 overflow |
| `1024` | 0 overflow (was 80 px) |
| `1440` | 0 overflow; table layout unchanged from Payload default |

## N · CACHE

| Flag | Value |
| --- | --- |
| `PRIVATE_TO_PUBLIC` | Immediate — first request reflects it (Phase C measured 73 ms; the same route and header are in place, re-verified in this phase's suite). |
| `PUBLIC_TO_PRIVATE` | Immediate — first request reflects it (40 ms in Phase C); the file route is `private, no-store`, so no shared cache can hold a copy. |
| `REPLACEMENT_FRESH` | Yes — new URL, new derivatives, old URL stops resolving; `media:{id}` invalidated. |
| `MEDIA_TAGS` | Targeted only: `media:{id}` + dependent tags from the usage registry; never a global invalidation. |
| `OUT_OF_BAND_WRITES` | A script that writes through `payload run` cannot revalidate the running server (documented limitation). After the fixture teardown unlinked the OG image that way, the rendered pages briefly still carried the deleted fixture's `og:image`; re-publishing the same document through the **live API** (`.phase-d-evidence/refresh-site-settings.mjs`) refreshed the tag, after which `og:image` served the canonical `https://sevnland.com/og/og-ar.png` / `og-en.png` and the fixture filename had **0 occurrences** on every public route (served-HTML scan). Rule for the future: after any out-of-band global change, refresh through the live API or restart before taking evidence. |

## O · DATABASE

| Flag | Value |
| --- | --- |
| `MIGRATION` | `src/migrations/20261007_200052_phase_d_media_library.{ts,json}` — applied on development (24 ms) and on an empty database (17 ms). |
| `EMPTY_DB_BOOTSTRAP` | **PASS** — empty DB → the three migrations applied in order (B, C, D) → 72 tables, ledger = exactly 3 rows → seeds (5 roles · owner · globals) → admin boots → media smoke **11/11** (upload 201, private 403 anon, public 200 anon, delete 200) → public site 200. |
| `PAYLOAD_PUSH` | `false` (permanent policy, unchanged). |
| `SCHEMA_PUSH_OCCURRED` | **NO** — a second empty database booted and served `/ar` 200 and `/admin/login` 200 with **tables before: 0 · tables after: 0**, no `payload_migrations` table created. |

**One data incident, found by this phase's own verification and fixed — reported in full because it
was data damage, not a cosmetic bug.** During the evidence work the Arabic localisation row of the
Site Settings global (`site_settings_locales`, which holds the Arabic location, short description and
business category) was destroyed twice. Root cause, established by isolating every write shape in
`.phase-d-evidence/diagnose-localized-write.ts` and `.phase-d-evidence/probe-rest-global-write.mjs`:
with `localization.fallback: false`, a **REST read without an explicit `?locale=` returns `null` for
every localized field**, and a REST write without `?locale=` lands in the default locale (`ar`) — so
the Phase D fixture script, which posted the global back "as read", wrote a document full of nulls
into Arabic and Payload deleted the emptied row. (Local-API partial writes merge — verified — which is
why the same shape from the verification suites did no damage.) Fixes, all verified: the fixture
script now sends **and reads** `?locale=ar` explicitly and **self-checks both locales after the
write**; `verify-phase-d.ts` gained two preservation checks that assert the Arabic *and* English
values survive its usage probe and now runs every global write with an explicit locale;
`verify-phase-c.ts` restores its temporary English edit in a `finally` block. The verified Arabic
values were restored from the same source the seeder uses (`.phase-d-evidence/restore-site-settings.ts`)
and confirmed in SQL: `ar | بريدة، القصيم، المملكة العربية السعودية` · `en | Buraydah, Al Qassim, Saudi Arabia`.
The full battery was re-run afterwards with the rows verified intact again on both sides of it, and
the trap is now written into `AGENTS.md` as a standing rule. No production data was involved (there is
no production database yet), but the incident is on the record rather than buried.

## P · TESTING

| Flag | Value |
| --- | --- |
| `CRUD` | **97/97** in `verify-phase-d.ts` (upload · read · metadata · alt AR/EN · caption · focal · tags · visibility · replace · safe delete) — includes the two checks that now guard the site-settings localisations against partial writes |
| `SECURITY` | included in the same run: anon private original+derivatives 403 · authorized 200 · viewer/editor/marketing/admin matrix · invalid MIME · spoofed MIME · unsafe SVG · oversize — plus the standalone binary gate **22/22** (`verify-media-binary.ts`) |
| `USAGE` | unused deletable · referenced blocked with entity+field · reference removed → deletable |
| `REPLACE` | derivatives regenerated · dimensions updated · cache invalidated · URL behaviour documented · audit written · old bytes not served |
| `RESPONSIVE` | browser pass **52/52** (grid, filters, sort, search, upload dialog, detail, picker, overflow at 390/768/1024/1440) + editor flows **18/18** + standing sweep 36 surfaces / 0 findings |
| `PLAYWRIGHT` | **55 passed / 5 skipped / 0 failed** (unchanged from the accepted baseline) |
| `A11Y` | public **18/18** axe suites; admin axe: **0 serious/critical** on library and picker (two contrast defects found and fixed) |

## Q · PUBLIC REGRESSION

| Flag | Value |
| --- | --- |
| `CONTENT` | `PUBLIC_CONTENT_CHANGED = NO` — no public page, component or copy changed in Phase D. |
| `VISUAL` | `PUBLIC_VISUAL_REGRESSION = NONE` — capture vs the accepted baseline: **25/26 pixel-identical**; the single difference is the same **3 pixels** (`maxΔ = 1`, x 353–359 × y 295–331) on `privacy-ar-1440` that Phase C already accepted as sub-perceptual anti-aliasing. Record: `.phase-d-evidence/visual-regression-phase-d.txt`. |
| `VISUAL_METHOD` | Tightened during this phase: an intermediate capture showed 1 848 differing pixels on `service-ar-390`, traced to a **QA-harness timing artifact** (the full-page shot was taken while a streamed segment was still landing, so the footer's location line rendered its fallback label). Controlled re-captures of the same route under three settings were **0 px** against the baseline, and `scripts/qa-capture.mjs` now waits for the page height to stabilise before shooting. The subsequent full run is the 25/26 above. |
| `BUILD` | `npm run build` exit 0, 66/66 static pages |
| `TYPECHECK` | `npx tsc --noEmit` clean |
| `LINT` | `npm run lint`: 0 errors, 1 pre-existing warning (the accepted React-Compiler note in a public form) |
| `BUNDLE_C` | Not separately measurable: one `.next` directory exists and the Phase D rebuild overwrote the Phase C artefacts. The retained measurement of record is the Phase A spike: **15 files / 1,044,798 B** public. |
| `BUNDLE_D` | **15 files / 936,740 B** public (12 public routes) · **16 files / 2,565,451 B** admin (media library, picker, users) · overlap 6 files / 459,310 B — the Next runtime chunks only. |
| `ADMIN_CODE_LEAK` | **NO** — every asset loaded by a public route was fetched and searched for `payloadcms`, `@payloadcms`, `payload/config`, `MediaLibraryView`, `pk_test`: 0 hits. Phase D added no file to any public route; Δ vs the retained baseline is −108,058 B (smaller), not larger. |

## R · FILES

**Created (repo):** `src/lib/errors.ts`; `src/lib/media/policy.ts`, `src/lib/media/usage.ts`;
`src/components/admin/{MediaLibraryView,MediaUploadDialog,MediaAltStatus,MediaUsagePanel,MediaActionsPanel,MediaPicker,MediaPickerPreview}.tsx`,
`src/components/admin/media/{client.ts,AdminImage.tsx}`;
`src/migrations/20261007_200052_phase_d_media_library.{ts,json}`;
`src/scripts/verify-phase-d.ts`;
`docs/admin-control-center/phase-d/{MEDIA_MODEL,MEDIA_SECURITY,MEDIA_LIBRARY_UX,STORAGE_ARCHITECTURE,USAGE_AND_DELETION,IMAGE_PROCESSING,PHASE_D_REPORT}.md` + `evidence/`.

**Modified:** `src/collections/Media.ts` (model, `beforeOperation` upload gate, endpoints, audit,
invalidation), `src/collections/Users.ts` (public refusal message), `src/collections/AuditEvents.ts`
(6 media actions), `src/lib/auth/{permissions,roles,audit}.ts` (media permissions incl.
`media.update`/`media.visibility`/`media.svg_upload`; detached audit writes),
`src/lib/content/media.ts` + `index.ts` + `views.ts` (`mediaSrcSet`, `focalPointOf`, focal in the
resolver), `src/payload.config.ts` (picker review view), `next.config.ts` (SVG CSP backstop on the
media route), `src/app/(payload)/custom.scss` (§32 fix + library styles + two contrast fixes),
`src/app/(payload)/admin/importMap.js` (regenerated), `src/payload-types.ts` (regenerated),
`scripts/admin-responsive.mjs` (picker surface, output-dir override), `scripts/qa-capture.mjs`(settle check before the screenshot),
`docs/PENDING-OWNER-INPUTS.md` (canonical-confirmation item removed; the hours item is now C6), `docs/admin-control-center/{05_DATA_MODEL,08_MEDIA_ARCHITECTURE,17_IMPLEMENTATION_PHASES}.md`
(implemented-state notes).

**Verification tooling (workspace, not shipped):** `.phase-d-evidence/` — `make-fixtures.mjs` (locale-safe, self-checking), `teardown-fixtures.ts`, `restore-site-settings.ts`, `diagnose-localized-write.ts`, `probe-rest-global-write.mjs`, `diff-stats.mjs`, the UX/flow/responsive browser suites, probes and logs.

**Removed:** `src/scripts/tmp-make-private.ts` (temporary Phase C probe). All Phase D media fixtures
were deleted from the development database and storage after the evidence pass; the library is empty,
the OG field is unlinked and falls back to the accepted static image.

## S · OWNER INPUT (genuine unresolved only)

1. **Storage decision** (§23, §K): provider/region (R2 recommended), CDN custom domain yes/no, signed
   URL TTL for private previews, and when to migrate the (currently empty) media library. Nothing is
   provisioned; this is a decision, not a blocker.
2. The pre-existing business inputs from earlier phases remain open and unchanged: **C1** email,
   **C2** street address, **C3** operating hours, **C4** social accounts, **C5** optional logo
   override, **C6** confirmation of the closing-time boundary semantics.
   («canonical confirmation» was removed by this phase — the canonical authority is closed as
   `https://sevnland.com`, no `www`.)

Nothing else in Phase D is waiting on the owner.

## T · PRODUCTION

`PRODUCTION_MUTATED = NO`. No deployment, no DNS, no production database, no paid resource, no
WordPress change. All verification ran against the local development database and a throwaway scratch
database that was dropped afterwards.

## U · RECOMMENDATION

**PROCEED_TO_PHASE_E** — with the Media Library submitted for your review first, as instructed.

Reasons: the library meets the quality bar (find · upload safely · understand · describe in AR/EN ·
control visibility · see usage · replace safely · delete without breaking the site), every §48–§53
suite passes on a production build, the public site is unchanged (25/26 pixel-identical, 55/55
Playwright, 0 admin leak), and the database is reproducible from migrations on an empty machine.

**HARD STOP observed:** no Pages, Page Blocks, Services, Projects or Insights CMS work has begun.
