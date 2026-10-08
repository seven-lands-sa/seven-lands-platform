# Cache, revalidation, freshness and the CMS-failure fallback

## Tag contract

| Tag | Invalidated by |
| --- | --- |
| `site-settings` | any Site Settings write |
| `contact-settings` | Contact Settings write |
| `business-hours` | Business Hours write **and** Site Settings (the timezone lives there) |
| `social-accounts` | Social Accounts write |
| `navigation` | Navigation write |
| `footer` | Footer write |
| `media:{id}` | any Media change (visibility, file, alt) |

Readers are `'use cache' + cacheLife('minutes')`. Writers call `revalidateTag(tag, { expire: 0 })` —
the immediate form. Phase A measured both forms on this stack: `revalidateTag(tag, 'max')` leaves
exactly one stale response (stale-while-revalidate); `expire: 0` is fresh on the first request. An
owner correcting a phone number must see it immediately, so every write path uses the immediate
form. Outside a request scope (seeders, verification scripts) invalidation is a logged no-op, never
a failed write.

## §8 — freshness, proven in the required sequence

`scripts/cache-freshness.mjs` (against the running server, HTTP only):

| Step | Result |
| --- | --- |
| 1 · public request | shows the **original** footer statement; the marker is absent |
| 2 · admin update (footer statement, via the admin API) | — |
| 3 · `revalidateTag(tag, { expire: 0 })` | runs in the write hook |
| 4 · **FIRST** public request | shows the **new** value |
| 1–4 again on a second surface (header CTA label) | fresh on the first request |
| 5 · restore the canonical value | propagates on the first request; marker gone |

**FIRST_REQUEST_FRESH = YES.** No second request, no sleep, no rebuild.

> Trap recorded: Payload's REST *global* update endpoint is **POST**. A PATCH returns 404 — and a
> script that ignores the status code will "pass" a freshness test while writing nothing.

> Trap recorded: writes made by `payload run` happen **out of process**, so they cannot invalidate
> the running server's cache. Use them for data provisioning; change content through the running
> server when the cache matters.

## §6 — revocation must not be defeated by caching

Media file responses send `private, no-store` (see `MEDIA_VISIBILITY.md`). That is what makes
public → private take effect in 40 ms rather than whenever a CDN copy expires. The object-storage
rule to carry forward: purge on transition, no public bucket, short-lived signed URLs only.

## §9 — CMS failure fallback (controlled, with a real dead database)

Test: the server was started with `DATABASE_URI` pointing at a port with no listener, so every CMS
read failed for real.

| Observable | Result |
| --- | --- |
| `/ar`, `/en`, `/ar/services`, `/ar/contact` | **200** |
| `/sitemap.xml` | **200** |
| Brand, phone `0507776891`, `wa.me/966507776891`, nav labels, location, footer statement | all present, complete |
| Canonical | still `https://sevnland.com/ar` |
| Visitor-visible infrastructure error | **none** (the only "500" matches are SVG path coordinates) |
| Server log | **84** `[content] … unavailable — serving trusted static fallback` lines, covering site-settings, contact-settings, navigation and footer |

The fallback is not a blank page and not a hard-coded duplicate: it is `src/lib/content/fallback.ts`
reading the verified static configuration, with the failure logged server-side. If a global is
missing in the CMS, the same path is taken; if a global exists but its list is empty
(navigation/footer/contact), the fallback is used too — an empty menu is a worse failure than the
shipped menu.
