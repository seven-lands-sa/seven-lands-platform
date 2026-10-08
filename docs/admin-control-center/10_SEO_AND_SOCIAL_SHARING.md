# 10 — SEO and Social Sharing

## 1. What already works (and must not regress)

Per-page title/description, canonical, `hreflang` (`ar-SA`, `en`, `x-default`), Open Graph + Twitter
card, generated sitemap and robots, structured data (Organization, WebSite, Service, FAQPage,
BreadcrumbList), real 404 status with `noindex`, and a unique `h1` per page. QA suite enforces
several of these today.

## 2. Per-page SEO fields (admin)

| Field | Notes |
| --- | --- |
| عنوان الصفحة | 15–60 chars guidance, live counter |
| وصف الصفحة | 70–160 chars guidance, live counter |
| الرابط (slug) | Latin; for services/projects/articles only (structural routes are fixed) |
| كلمة robots | index/noindex · follow/nofollow (safety rails on legal + thin pages) |
| الرابط الأساسي (canonical) | advanced; empty = auto |
| صورة المشاركة | media picker (fallback chain below) |
| عنوان/وصف المشاركة | optional overrides for OG/Twitter |
| معاينة | Google-style SERP preview + social card preview, live from the fields |

## 3. Fallback hierarchy (implemented once, used everywhere)

```
field value on the record
   ↓ else
page-type default            (e.g. "service pages share image")
   ↓ else
global default               (site-settings share image + title template)
```

The same three-level chain applies to title, description and image, so an editor only fills what
they actually want to override.

## 4. OG image strategy

| Case | Approach |
| --- | --- |
| Global fallback | uploaded 1200×630 (replaces the committed PNGs) |
| Section defaults | services / projects / articles each get an optional default image |
| Per-record override | upload a bespoke image (best for real case studies) |
| Auto-generated | **evaluated, recommended for articles and services**: `next/og` ImageResponse renders brand navy + title + capability number at request time, cached. Arabic shaping works in the existing Alexandria font, which we already self-host. |

Rule: an uploaded image always wins over the generated one.

## 5. Structured data

Generated from real settings only — nothing invented:

| Type | Source | Guard |
| --- | --- | --- |
| Organization | site-settings (name, logo, phone, address city/region, sameAs = social URLs, areaServed) | `sameAs` only renders for confirmed social accounts |
| LocalBusiness | **only if** a verified street address + hours exist | otherwise omitted entirely |
| Service | each service record (name, description, OfferCatalog) | unchanged from today |
| FAQPage | service FAQs | unchanged |
| BreadcrumbList | route trail | unchanged |
| Article | insight records (headline, date, author, image) | author only if a real author exists |
| WebSite | global | unchanged |

Explicitly still absent: `aggregateRating`, `review`, `foundingDate`, `numberOfEmployees`,
`priceRange`.

## 6. Redirect manager

Fields: `from` · `to` · `type (301/302)` · `active` · `hits` · `lastHitAt`.

Validation on save:

- `from` must start with `/` and must not contain a scheme or host.
- `from` must not equal `to` (self-loop) and must not collide with an existing route or another
  redirect.
- Loop detection walks the chain (max 5 hops) before saving.
- Reserved prefixes (`/admin`, `/api`, `/_next`) are rejected.
- Slug changes on services/projects/articles offer a one-click "أنشئ تحويلًا من الرابط القديم".

## 7. SEO health module (indicators, not a fake score)

Checks, all computed from data we actually have:

- pages/services/projects/articles missing a title, description, or sharing image (per locale),
- missing alt text on published media,
- `noindex` records outside the expected set (legal drafts),
- missing English translations on published content,
- redirects that point to 404s,
- sitemap and robots reachable,
- hreflang/ canonical consistency spot-check.

No "SEO score out of 100" is manufactured.

## 8. Social sharing preview

A live card preview (WhatsApp / X / Facebook styles) driven by the resolved title, description and
image — the same resolution the frontend uses. Editors see exactly what will be shared, including
the Arabic right-to-left rendering and the Arabic share image when the content is Arabic.
