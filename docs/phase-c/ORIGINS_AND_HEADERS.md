# Canonical origin, runtime origin, and the Critical-CH decision

## 1 · Two origins, deliberately separated

| | Canonical site authority | Runtime / preview origin |
| --- | --- | --- |
| Variable | `SITE_CANONICAL_URL` (server-only) | `NEXT_PUBLIC_SERVER_URL` → `RUNTIME_ORIGIN` |
| Read by | metadata, hreflang, sitemap, robots, JSON-LD, OG URLs | Payload's `serverURL` (admin URLs), redirects, trusted-origin checks, CSRF |
| Published? | **Yes — it is what search engines index** | **Never** |
| Value | `https://sevnland.com` | whatever host is serving this process |

Source of truth: `src/lib/site-origin.ts` (`CANONICAL_SITE_URL`, `runtimeOrigin(headers)`).

Why not `NEXT_PUBLIC_SITE_URL`: the canonical origin is only ever read on the server. A
`NEXT_PUBLIC_` name ships the value to every browser bundle for no benefit — configuration is
exposed to the client only when the client genuinely needs it.

Why this matters: served from `http://127.0.0.1:3000` (a completely different origin), the public
pages published `https://sevnland.com/...` in every canonical, hreflang, sitemap, robots and
JSON-LD position, and contained **zero** occurrences of `localhost`, `127.0.0.1` or `e2b.app`.

Verified on the final build:

```
AR_HOME_CANONICAL  = https://sevnland.com/ar          (also og:url)
EN_HOME_CANONICAL  = https://sevnland.com/en
SITEMAP_ORIGIN     = https://sevnland.com             (robots.txt Host + Sitemap)
OG_URL_ORIGIN      = https://sevnland.com/og/og-ar.png
JSON-LD @id/url    = https://sevnland.com/#organization, /ar
```

CMS media URLs are reduced to **paths** (`asPublicPath`) in the public layer and absolutised
against the canonical origin only where the value must be fully qualified (og:image, JSON-LD) —
never against the preview host.

## 2 · Critical-CH: scoped to the admin, with measurement

`withPayload` appends, on `source: "/:path*"` and *after* our own `headers()` entries:

```
Accept-CH:   Sec-CH-Prefers-Color-Scheme
Critical-CH: Sec-CH-Prefers-Color-Scheme
Vary:        Sec-CH-Prefers-Color-Scheme
```

`Critical-CH` makes the browser **discard the first response** and re-issue the navigation. The
admin needs this (it applies the stored colour scheme before first paint); the public site has no
byte that depends on a client hint.

**Mechanism** (no node_modules patch, no fork, no middleware): `next.config.ts` takes the config
`withPayload` returns and narrows the `source` of the rules carrying client-hint headers to
`/admin/:path*`. Security headers stay catch-all; everything else Payload adds is untouched.

**Measurement** (`scripts/measure-nav-cost.mjs`, 7 cold navigations per route, fresh context each
round — same build, one flag apart):

| | BEFORE (unscoped) | AFTER (scoped) |
| --- | --- | --- |
| Document requests / navigation | **2** (every round) | **1** |
| `responseStart` median, /ar | 20 ms | 11 ms |
| `responseStart` median, /en | 17 ms | 10 ms |
| Public `Critical-CH` | `Sec-CH-Prefers-Color-Scheme` | **absent** |
| Admin `Critical-CH` | present | **present** (unchanged) |
| Admin regression | — | none: `/admin` and `/admin/*` keep `Accept-CH` + `Critical-CH`; the admin renders and authenticates normally |

The public cost was a **discarded response plus a full re-request on every navigation**. Decision:
scoped, kept, measured. `/api/*` does not carry the hints (they are useless there); if a future
Payload version needs them on an API path, the scope rule is one line.

Escape hatch: `CLIENT_HINTS_UNSCOPED=true` restores the raw wrapper for A/B measurement. It is a
build-time flag by design — `headers()` is baked into the routes manifest, so it cannot change
behaviour in a running server.
