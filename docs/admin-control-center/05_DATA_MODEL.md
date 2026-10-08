# 05 — Data Model

Entities are described in business terms first, then as payload collection names.
Localization uses **paired translations on one record** (field-level `ar`/`en`), never two
disconnected records.

## 1. Core entities

| Entity (collection) | Purpose | Key fields | Localized fields |
| --- | --- | --- | --- |
| `pages` | home + the structural routes | slug, title, blocks[], seo, status, publishAt | title, seo, all block content |
| `services` | the seven Lands | slug, number, glyph, icon, order, promise, intro, problems[], capabilities[], faqs[], whatsapp opener, media, seo, status | everything except slug/number/glyph |
| `projects` | case studies | slug, client, clientApproved, sector, year, cover, gallery[], challenge, objective, approach, execution[], results[], testimonial, relatedServices[], seo, status | narrative + results labels |
| `articles` | insights | slug, cover, category, author, publishedAt, readingMinutes, body (rich text), seo, status | everything |
| `media` | media library | filename, sourceFilename, mimeType, dimensions, filesize, visibility (private default), decorative, alt{ar,en}, caption{ar,en}, tags[], focalX/focalY, contentHash, duplicateOf, createdBy, replacedAt | alt, caption (`fallback: false`) |
| `leads` | brief submissions | name, phone, email, company, lands[], goal, timeline, channel, notes, campaign{}, landingPage, status, internalNotes, createdAt | (visitor-entered, not translated) |
| `redirects` | slug changes | from, to, type (301/302), active, hits | — |
| `tracking-integrations` | GA4/GTM/pixels | provider, publicId, enabled, environments[], consentCategory, notes | — |
| `custom-scripts` | advanced snippets | name, placement, code, enabled, environments[], description | — |
| `users` | admin accounts | name, email, password hash, roles[], status, lastLogin | — |
| `roles` | permission sets | name, description, permissions[] | name, description |
| `audit-events` | change log | actor, action, resource, resourceId, summary, ip, userAgent, at | — |

## 2. Global (singleton) settings documents

`site-settings` (general + branding + default SEO), `contact-settings`, `business-hours`,
`navigation`, `footer`, `consent-settings`, `seo-defaults`.

Full field detail for these lives in `07_GLOBAL_SETTINGS_MODEL.md`.

**As implemented (Phase D, 2026-10-07).** The `media` row above is now the built model, not the plan:
visibility is enforced at the byte level, `tags` is a controlled select vocabulary (not free text),
`focalX/focalY` store coordinates only (never CSS), and usage is derived live from an explicit
reference registry instead of a stored counter. Full description:
`docs/admin-control-center/phase-d/MEDIA_MODEL.md`. Dedicated collections for `pages`, `services`,
`projects`, `articles`, `leads`, `redirects`, `tracking-integrations` and `custom-scripts` do **not**
exist yet — they belong to Phase E and later, which has not started.

## 3. Structured data — the three canonical examples

```
business-hours:
  week:
    - day: sunday
      enabled: true
      periods: [ { from: "09:00", to: "13:00" }, { from: "16:00", to: "22:00" } ]
    - day: friday
      enabled: true
      periods: [ { from: "16:00", to: "22:00" } ]
  note: { ar: "…", en: "…" }        # optional note, e.g. Ramadan hours
  timezone: "Asia/Riyadh"
```

```
social-accounts:                     # array, any platform, any order
  - platform: instagram              # free label, e.g. "instagram" | "x" | "tiktok" | custom
    displayName: سفن لاند
    handle: sevenlands
    url: https://instagram.com/…     # validated https
    icon: { library: "phosphor", name: "InstagramLogo" }   # key, never raw SVG
    enabled: true
    order: 1
    placements: [footer, contact]
```

```
seo (per page, per locale):
  title, description, canonicalOverride?, robots{index,follow},
  ogTitle?, ogDescription?, ogImage?, twitterImage?
```

## 4. Relationships

```
pages            1 ── n  blocks (ordered, typed)          via blocks[] field
pages            1 ── 1  seo { ar, en }
services         1 ── n  media (cover, gallery)
projects         1 ── n  media
projects         n ── n  services                          relatedServices[]
articles         n ── 1  category, 1 author (users or standalone authors table)
media            1 ── n  usages (derived: which documents reference it — enforced on delete)
users            n ── n  roles                              via roles[] field
roles            1 ── n  permissions
leads            n ── 1  attribution (campaign{}, landingPage)
audit-events     n ── 1  actor (users)
tracking-integrations   1 ── 1  consent category
custom-scripts          n ── 1  environment scope
```

## 5. Localization model

- Every editorial record stores `ar` and `en` on the same document (Payload field-level locale).
- **Fallback policy (owner amendment, 2026-10-07 — supersedes the earlier draft):**
  **there is no AR→EN visual fallback on the public site.** Arabic text must never appear inside the
  English website. A page, service, project, article or block may only be **published** for a locale
  when every *required visible* field for that locale passes translation completeness; otherwise
  publication is blocked, or (where the architecture allows) the optional block is omitted entirely
  from that locale's render.
  - Fallback remains permitted **only for non-visible supporting metadata**, e.g. image `alt` when a
    translation is genuinely unavailable, and even then it must be flagged, never silent.
  - Required visible fields per type: page/block headings + body + CTA labels; service title, promise,
    intro, capabilities, FAQ; project title, summary, narrative, results; article title, excerpt, body.
  - **Translation status** is computed, not stored, and surfaces in three admin states:
    `Translated` · `Partially translated` · `Missing translation`. Publishing validation must make the
    state explicit and refuse to publish visible content that is incomplete (`15_…` §3).
- Slugs are localized per locale (`/ar/خدمات` is *not* planned; slugs stay Latin for both locales
  to protect the existing URL structure and the route table).
- The UI language of the admin itself is a separate concern (admin chrome, not content).

## 6. Why these choices (vs the suggested list)

| Suggested | Decision |
| --- | --- |
| `PageTranslation`, `ServiceTranslation`, `ArticleTranslation` as separate tables | **Rejected.** Paired fields on one record keep publishing atomic and prevent "half a page" states. |
| `SEOConfig` as its own entity | Kept **embedded per record** + a global defaults singleton. A separate SEO table would need joins for every render. |
| `ContactChannel` | Folded into `contact-settings` (structured: phones[], emails[], whatsapp, location) because channels are a fixed, small set. |
| `Revision` | Handled by the CMS version system per collection (see `15_…`), plus `audit-events` for non-content changes. |
| `NavigationItem` | Nested `items[]` inside the `navigation` global (one level of nesting in V1). |
| `Category` | A small `categories` collection for articles, seeded with the topics we actually publish. |
