# Phase D — Media security

**Status: enforced and measured.** Every claim below corresponds to a check in
`src/scripts/verify-phase-d.ts`, `src/scripts/verify-media-binary.ts` or the browser pass, run against
a production build. Logs: `.phase-d-evidence/verify-phase-d.log`, `.phase-d-evidence/verify-media-binary.log`,
`.phase-d-evidence/admin-ux-results.json`.

---

## 1 · What happens to an uploaded file, in order

The whole gate runs in `beforeOperation`, i.e. **before** Payload's own `generateFileData` re-encodes
the upload. That placement is not cosmetic: a hook running after re-encoding would inspect sharp's
output instead of what the user sent, so spoofed bytes would be normalised away before validation.

```
upload request
  → permission check            (media.upload; SVG additionally requires media.svg_upload)
  → extension gate              (executables and archives refused by extension)
  → magic-byte sniff            (the file's actual type)
  → extension ⟷ content         must agree            → 400 Arabic message
  → declared MIME ⟷ content     must agree            → 400 Arabic message
  → SVG branch                  validateSvg() or 403/400
  → size ceiling                images 10 MB · SVG 1 MB
  → normalisation               rotate() + re-encode ⇒ EXIF stripped, orientation applied
  → deterministic filename      safeStoredFilename(original, sniffedMime)
  → content hash                SHA-256 of the bytes that will be stored
  → create
```

## 2 · Allowed types

| Type | Accepted | Ceiling | Notes |
| --- | --- | --- | --- |
| `image/jpeg` | ✅ | 10 MB | Re-encoded at quality 90 (mozjpeg). |
| `image/png` | ✅ | 10 MB | Re-encoded, alpha preserved. |
| `image/webp` | ✅ | 10 MB | Re-encoded. |
| `image/avif` | ✅ | 10 MB | Accepted; the `ftyp` brand is checked, not just the prefix. |
| `image/svg+xml` | ✅ controlled | 1 MB | Requires `media.svg_upload` **and** passes `validateSvg`. |
| Video | ❌ | — | No product use case in this phase. |
| Everything else | ❌ | — | No arbitrary document support. |

Refused extensions include `exe dll so sh bash bat cmd com cgi js mjs cjs php phtml asp aspx jsp py rb
pl html htm xhtml svgz jar msi apk dmg zip rar 7z tar gz`.

## 3 · MIME sniffing

Type is decided by content, never by the client's claim or the extension:

- an image whose bytes contradict its extension is refused (`نوع الملف لا يطابق محتواه: الامتداد يقول
  image/png والمحتوى image/jpeg…`);
- text renamed to `.jpg` is refused (`تعذّر التعرّف على نوع الملف من محتواه…`);
- a file declaring `image/png` that carries JPEG bytes is refused.

The declared MIME is still checked against the sniffed type — a lying client is an error, not a
harmless inconsistency.

## 4 · SVG policy

**Chosen policy: admin-only (separate high-risk permission) + structural refusal + delivery-time
backstop.** Rasterising was rejected because it would destroy the only reason to accept SVG (crisp
responsive marks and simple line art). Sanitising was rejected as the *primary* control because a
sanitiser that silently rewrites artwork is a different product risk; refusal is honest — the editor
sees exactly which element was rejected and why.

`validateSvg()` refuses (with the element named in the Arabic message):

`<script>` · `<foreignObject>` · `<iframe|embed|object|applet|frame>` · `<audio|video>` ·
any `on*=` event handler · `javascript:` · embedded `text/html` data · `<!DOCTYPE>` · `<!ENTITY>` ·
`<?xml-stylesheet` · external `http(s)://` or protocol-relative references in `href/xlink:href/src` ·
`@import` · `<use>` pointing outside the document · SMIL `<animate|set>` that rewrites an event
handler. A file without an `<svg>` root is refused as well.

Independently of validation, every file served from `/api/media/file/*` carries:

```
Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox
X-Content-Type-Options: nosniff
```

so even a file opened directly or embedded in an `<object>`/`<iframe>` cannot run script, load
network resources or navigate. Measured in the delivered headers (suite §2).

## 5 · Privacy of the bytes — visibility enforcement

| Probe | Result |
| --- | --- |
| private original, anonymous | **403** |
| private derivatives (thumbnail + card), anonymous | **403 / 403** |
| private original, authenticated staff with `media.read` | 200 |
| public original, anonymous | **200** |
| public derivatives, anonymous | **200** |

The enforcement is at the byte level: Payload applies the collection's read constraint to the file
route and matches derivative filenames against the same constraint, so guessing a derivative URL
gives an attacker nothing. `Cache-Control: private, no-store` on that route means a shared cache
cannot keep a copy after the asset returns to private (the revocation test in Phase C measured the
switch on first request: 73 ms → public, 40 ms → private).

## 6 · EXIF and device metadata

Measured, not assumed. An upload carrying GPS, device make/model and software tags was stored and
then re-read with sharp:

| Check | Result |
| --- | --- |
| EXIF block present in the stored original | **none (0 bytes)** |
| Orientation tag | removed (baked into pixels) |
| Orientation 6 (2400×1600 upload) | stored upright at **1600×2400** |
| Device identifiers (make/model/software) | absent |
| Derivatives | also EXIF-free |

Policy: strip everything except what is needed to decode the image (dimensions, format, alpha).
Nothing the camera wrote about where or with what the photo was taken survives storage.

## 7 · Failure messages

All refusals are human Arabic sentences, produced by the API itself — not translated client-side:

- `نوع الملف غير مدعوم. الأنواع المسموحة: JPG، PNG، WebP، AVIF، SVG.`
- `حجم الصورة يتجاوز الحد المسموح (10 ميجابايت).`
- `ملف SVG مرفوض: يحتوي على معالج حدث (onload، onclick…). أزل العنصر ثم أعد المحاولة.`
- `رفع ملفات SVG يحتاج صلاحية خاصة (خطر أمني)…`

A production-build defect was found and fixed while verifying this: Payload only shows an error's
message when the error's `name` survives minification. Our `APIError` instances came out with an
empty name, so every Arabic refusal was replaced by *"An unknown error occurred."* in the production
build. `src/lib/errors.ts` (`publicError`) pins the name and every user-facing refusal now uses it —
verified against the running production build, not in dev.

## 8 · Deletion safety

Never silent: an asset referenced anywhere is refused with the Arabic list of places it is used, and
the audit records `media_delete_blocked` **in its own transaction** so the refusal survives the
rollback that the failed delete triggers. See `USAGE_AND_DELETION.md`.

## 9 · Layered limits (documented, deliberate)

Payload enforces its own multipart byte gate (`UPLOAD_FILE_SIZE`-class limit) before any hook runs.
An 11 MB upload is therefore refused by Payload with a generic message before our product-level
message can fire. Both layers are honest gates — the product message is what an editor sees for
everything up to Payload's ceiling (10 MB product cap sits inside Payload's own default), and the
suite pins the product message using files under that ceiling.
