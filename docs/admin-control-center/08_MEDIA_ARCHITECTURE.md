# 08 — Media Architecture

## 0. What shipped (Phase D — read this first)

This document was the *plan* (Phase A). The implementation is now real and differs from the plan in
several deliberate ways — the authoritative description is
`docs/admin-control-center/phase-d/`:

| Planned here | Shipped in Phase D |
| --- | --- |
| images 12 MB · SVG 256 KB | **images 10 MB · SVG 1 MB** (`src/lib/media/policy.ts`) |
| derivatives: thumb 400 · card 800 · tablet 1200 · desktop 1920 · og 1200×630 | **thumbnail 400×300 · card 768×512 · content 1200×900 + original** (no upscaling; `hero` deferred to Phase E) |
| WebP/AVIF conversions of every derivative | **format preserved** — the upload's own format is re-encoded, never converted |
| path `/{collection}/{year}/{slug}/{hash}-{size}.{ext}` | **flat store, content-stamped names** (`name-<8 hex>.jpg` on replacement); the storage seam is `mediaUrl()` in `src/lib/content/media.ts` |
| video 200 MB | **no video** — no use case in this phase |
| object storage | **local disk in dev; R2/S3 boundary documented, nothing provisioned** (`phase-d/STORAGE_ARCHITECTURE.md`) |

Everything below remains the long-range plan for the parts that have not been built yet.

## 1. What exists today (Phase A snapshot)

Nine static files in `public/` (logo lockups, mark, fonts) plus two committed OG images. There is
**no upload pipeline, no `next/image` usage, and no media model**. The site currently carries itself
with brand artwork and typography — this changes the moment the owner supplies real photography and
case-study screenshots.

## 2. Upload & processing pipeline

```
Editor drops file
   → MIME + extension + magic-byte validation (allow-list)
   → size limit (images 12 MB, SVG 256 KB, video 200 MB)
   → filename normalisation (ASCII slug + hash suffix, original kept in metadata)
   → strip EXIF (except orientation) / re-encode
   → generate derivatives with sharp:
        thumb 400 · card 800 · tablet 1200 · desktop 1920 · og 1200×630 (cropped)
        formats: original + WebP + AVIF
   → store on object storage under  /{collection}/{year}/{slug}/{hash}-{size}.{ext}
   → save record in `media` with dimensions, size, focal point, alt{ar,en}, caption{ar,en}
```

**Derivatives are generated on upload, not at render.** Next Image then serves the already-optimised
file with `srcset` built from the project's existing `deviceSizes`
(`360…1920` in `next.config.ts`), so the two systems agree instead of fighting.

## 3. Storage decision

| Option | Verdict |
| --- | --- |
| Server filesystem (`public/uploads`) | **Rejected** — breaks on serverless/containers, no CDN, no versioning, and a redeploy can wipe uploads |
| Local persistent volume | Acceptable only if hosting is a single VPS; still no CDN |
| **S3-compatible object storage (Cloudflare R2 preferred, S3/Spaces as alternatives)** | **Recommended** — cheap egress, CDN in front, versioning for accidental deletions, trivial backup |
| Image CDN with transformations (Cloudinary/imgix) | Rejected: another vendor and per-transform pricing for something sharp already does |

Failover note: the storage adapter is configuration, so switching providers is an env change plus a
one-off copy, not a code rewrite.

## 4. Media library UX

- Grid with thumbnails, search by filename/alt/tag, filter by type and by *usage status*.
- Detail drawer: preview, dimensions, file size, MIME, uploader, upload date, **alt AR/EN**
  (required before first use on a page), caption, tags, focal point, and "used in" list.
- Replace asset: swaps the file while keeping the same record id → every page keeps working.
- Delete protection: if an asset is referenced by any published document, deletion is refused with
  a list of usages; the safe path is "استبدال" (replace) or archive.
- Bulk upload with per-file progress; failures listed with reasons (never silent).
- Duplicate detection by content hash (warns before creating a second copy).

## 5. SVG and video policy

| Type | Policy |
| --- | --- |
| JPG / PNG / WebP / AVIF | allowed |
| SVG | allowed **only** through a sanitised pipeline (strip `<script>`, `on*` attributes, external refs, `foreignObject`); brand logo SVG is uploaded by an admin only |
| GIF | allowed (converted to WebP animation on upload) |
| MP4 / WebM | allowed; `<video>` gets `poster`, `preload="metadata"`, no autoplay with sound; hero video is capped at 15 s / 8 MB and only used on the `hero` block's `image` variant |
| Anything else (HTML, JS, PDF-as-page) | rejected |

## 6. Alt text and accessibility

- `alt{ar,en}` is required on save for any image intended for content blocks; decorative images get
  an explicit "صورة زخرفية" toggle that renders `alt=""` (and keeps the a11y audit clean).
- Site Health lists every published media item with a missing alt in either locale.
- Captions are separate from alt (captions can be long; alt cannot).

## 7. Where media appears

| Surface | Uses |
| --- | --- |
| Hero | background image, mobile crop, optional video |
| Services | cover, optional icon override |
| Projects | cover, gallery (with order + caption), before/after pairs |
| Articles | cover, inline images inside rich text |
| OG / social sharing | per-page sharing image, page-type default, global default |
| Brand | logo lockups, favicon, apple icon, PWA icons |
| Testimonials | optional portrait (only with real people and consent) |

## 8. Constraints and budgets

- Recommended upload guidance shown in the admin: hero ≤ 400 KB after processing, content images
  ≤ 250 KB, uploads ≤ 2400 px on the long edge.
- Every upload reports its final optimised size, so editors learn the budget by seeing it.
- The public bundle must not grow: `next/image` handles responsive selection, and no image library
  ships to the client.

## 9. Backup (media)

Object storage versioning on, lifecycle rule keeping non-current versions 90 days, plus a weekly
inventory snapshot. Restore procedure tested once before launch (documented in `19_…`).
