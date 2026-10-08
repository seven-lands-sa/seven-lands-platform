# Media visibility — private by default, enforced at the byte level

Phase C · authoritative reference for `src/collections/Media.ts`, `src/lib/content/media.ts`,
`next.config.ts`, and the storage seam.

## The model

```
visibility: "private" | "public"     default: private     (indexed, sidebar, audited)
```

* `private` — the document and **every derived file** are unreachable without authorization.
* `public` — the document and its derivatives are served to anyone, including anonymous visitors.
* The owner sees both in the admin; the public site only ever receives `public`.

## Where the rule is enforced (three layers, one policy)

1. **Collection read access** returns a *constraint*, not a boolean:
   `media.read` → `true`; otherwise `{ visibility: { equals: "public" } }`.
2. **File delivery** — Payload's static-file handler calls that same `read` with
   `isReadingStaticFile: true` and ANDs the result with a filename match across the original **and**
   `sizes.thumbnail.filename`, `sizes.card.filename`, … So the constraint covers originals and
   derivatives without a second rule to keep in sync.
3. **Public component layer** (`resolvePublicMedia`) refuses a private document even when a caller
   already knows its URL — defence in depth, not the primary control.

## No security by URL obscurity

Knowing the exact URL is not enough, and nothing in the design pretends otherwise:

* The **path never changes** when visibility flips. The gate above measures the same three URLs
  before, during and after a transition and asserts the bytes stop and start flowing.
* Protection does not rely on random filenames, hashes, `robots.txt`, or absence from rendered HTML.
* A **bare cookie replay** (no browser `Origin` / `Sec-Fetch-Site`) is refused — proof that holding
  the token is not authentication either (Payload's CSRF rule, verified in the admin with Playwright).

## Measured gate — `src/scripts/verify-media-binary.ts` (22 checks, 0 failures)

Fixture: a real 1200×800 PNG, so `sharp` produced real 400×300 and 768×512 derivatives.

| Request | Private | Public |
| --- | --- | --- |
| original — anonymous | **403** | **200** (14 270 B) |
| thumbnail — anonymous | **403** | **200** (2 477 B) |
| card derivative — anonymous | **403** | **200** (6 335 B) |
| original — authenticated admin (`media.read`) | **200** (14 270 B) | 200 |
| bare cookie replay, no browser context headers | **403** | — |

* `PRIVATE_TO_PUBLIC_ACTIVATION`: first request after the write — **73 ms**.
* `PUBLIC_TO_PRIVATE_REVOCATION`: first request after the write — **40 ms**.
* Both transitions wrote `media_visibility_changed` audit events.
* The private document still exists in the library while denied — the refusal is authorization,
  not deletion.

## Cache rule (revocation must win)

`/api/media/file/*` responses send `Cache-Control: private, no-store` (`next.config.ts`). A cache
that honours `Cache-Control` therefore cannot keep serving an asset that has returned to `private`.
The cost is honest: public artwork revalidates instead of being stored. That is the correct default
while media access is security-relevant.

## Object storage later — S3-compatible / Cloudflare R2

No paid resource is created now; this is the architecture the current design already supports.

* **Public objects** live under a public prefix served by the CDN (bucket policy allows `GetObject`
  for that prefix only). The public URL is written into `mediaUrl` and nothing else changes.
* **Private objects** are never publicly readable. The bucket policy denies `GetObject`; delivery
  goes through an **authorized route** that repeats the same visibility check and then either
  streams the object or redirects to a **short-lived signed URL** (minutes, single object).
* **Signed URLs are the object-storage equivalent of the filename constraint**: they expire, they
  are issued per authorized request, and they are never minted for anonymous callers.
* **Revocation**: the transition public → private must (a) flip the document, (b) **purge the CDN
  path**, and (c) stop issuing signed URLs. Rule to carry into that phase: *no public bucket, no
  long-lived signed URL, purge on transition, and the route — not the URL — is the control.*
* R2 notes: use a separate custom domain for public assets so the purge target is unambiguous, and
  keep private objects in a prefix whose policy has no public read at all.

`mediaUrl()` in `src/lib/content/media.ts` is the single seam: replacing local-disk URLs with
bucket/CDN URLs is a change to that one function.
