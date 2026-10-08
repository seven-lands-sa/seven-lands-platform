# Phase D — Image processing

Processor: **sharp** (bundled with Payload, `sharp ~0.34`), used in two places — the upload pipeline
(`beforeOperation` normalisation) and the replacement endpoint. No external image service, no paid
image CDN.

---

## 1 · Derivatives (§8) — three sizes, each with a stated job

| Name | Box | Purpose |
| --- | --- | --- |
| **original** | as uploaded (EXIF-free, orientation applied) | downloads, print, OG/social images, any future full-bleed use |
| **thumbnail** | 400 × 300 | admin tiles, library previews, tiny cards |
| **card** | 768 × 512 | in-page cards, article teasers, mobile hero |
| **content** | 1200 × 900 | article body images, service visuals, desktop cards |

Rules that fall out of the configuration (`src/collections/Media.ts`):

- **No upscaling.** A 800×600 upload gets thumbnail + card and no `content` derivative — the pipeline
  never invents pixels (asserted in the suite from both directions: with a large source all three
  exist; with a small source `content` is absent *and* the srcset is still correct).
- **Fixed boxes, focal-aware.** Sizes use Payload's `position: "centre"` cropping with the document's
  focal point driving the crop when one is set, so a portrait photograph cropped into a 400×300 tile
  keeps its subject.
- **`hero` is deliberately not generated.** Nothing consumes it yet (Phase E page blocks), and every
  size costs storage on every upload. Adding one size later is a one-line change plus a regeneration
  pass; carrying an unused size forever is not.
- Dimensions stored per derivative are the **real** output dimensions, which is what makes the
  srcset `w` descriptors truthful.

## 2 · Responsive delivery strategy (§46)

The public resolver gives components everything needed to avoid shipping a 2400px original to a
phone:

| Helper | Provides |
| --- | --- |
| `resolvePublicMedia(doc, {locale})` | `{ url, width, height, alt, focal }` — width/height exist so the markup can reserve space (no layout shift). |
| `mediaSrcSet(doc)` | `…-400x300.jpg 400w, …-768x512.jpg 768w, …-1200x900.jpg 1200w, …original 2400w` — ascending, original last, derived from stored widths only. |

Verified in the suite: ascending widths, original last, a small source yielding a correct non-upscaled
set, and the resolver still refusing a private document (no srcset is ever built for private media).
Recommended usage for Phase E: `srcset` from `mediaSrcSet`, `sizes` per layout slot, explicit
`width`/`height` from the resolver, `loading="lazy"` below the fold, `priority`/`fetchpriority="high"`
for the LCP image, `object-position` computed from `focal`.

**Current public consumption:** the only CMS media rendered publicly today is the brand/OG set
(Phase C). Public pages still use their static, accepted assets — so Phase D introduced **no public
visual change** (visual regression: 25/26 pixel-identical vs the accepted baseline, the one difference
being the same 3 pixels accepted in Phase C).

## 3 · Normalisation (one definition, two callers)

```
normaliseRaster(buffer, mimeType):
  sharp(buffer).rotate()            ← applies any EXIF orientation, then discards the tag
    .toFormat(format, quality 90)   ← re-encode WITHOUT withMetadata ⇒ EXIF never reaches disk
```

- Used by the upload gate **and** the replacement endpoint, so "what a stored file is" has one
  definition.
- The upload hook skips re-normalisation when the replacement endpoint has already done it
  (`req.context.mediaNormalised`), because re-encoding twice would make the recorded content hash
  describe bytes that are not the ones on disk. The replacement endpoint normalises *before* hashing
  for the same reason.
- Format is preserved: JPEG stays JPEG (mozjpeg, q90), PNG stays PNG (alpha kept), WebP stays WebP,
  AVIF stays AVIF. No format conversion surprises, no silent SVG→raster conversion.

## 4 · Metadata policy (§40, §41)

Measured on a JPEG carrying GPS + device EXIF:

| Property | Stored? |
| --- | --- |
| width, height, format, filesize | ✅ (the library needs them) |
| orientation | ✅ applied to pixels, tag removed |
| GPS coordinates | ❌ stripped |
| device make / model / software | ❌ stripped |
| other EXIF blocks | ❌ stripped |

Claim is "no EXIF survives storage", not "some fields are hidden" — asserted by re-reading the stored
bytes and each derivative with sharp (`exif: 0 bytes`, orientation absent, identifiers absent).

## 5 · Replacement consistency (§20, §42)

Replacing a binary:

1. validates the new file through the **same** gate (extension, sniffing, contracts, SVG rules, size);
2. refuses a raster→SVG switch (different delivery model) and an SVG→raster switch;
3. refuses identical bytes (`الملف الجديد مطابق للملف الحالي — لا يوجد ما يُستبدل.` — hash of the
   normalised bytes vs the stored `contentHash`);
4. normalises, hashes, regenerates **every** derivative from the new bytes;
5. moves the stored filename/URL to a content-stamped name, so caches and external links cannot serve
   the old picture from the old address;
6. keeps the document identity (id, references, alt, caption, tags, focal point, visibility);
7. audits `media_binary_replaced` and invalidates `media:{id}` plus dependent tags.

Verified: dimensions update, `replacedAt` set, the previous derivative URL returns 403/404 after the
replacement, and the new URL serves the new bytes.
