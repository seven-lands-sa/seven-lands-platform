# 02 — Architecture Options

Three realistic paths. Evaluated against the actual project (Next.js 16, PPR, next-intl, static
typed content, no DB, no hosting decision yet) and against the modules requested.

---

## Option A — Custom admin built inside the existing Next.js app

Own database (Postgres + Drizzle), own auth (Auth.js or hand-rolled sessions), own admin UI built
from Radix/shadcn primitives, own form builder, own media handling.

| Dimension | Assessment |
| --- | --- |
| Fit with the repo | Perfect — same app, same tokens, same TS strictness |
| Localization | Must be built (field-level AR/EN, status, fallback) — real work |
| Blocks | Must be built (schema registry, ordering, variants, renderer) |
| Media | Must be built (upload, processing with sharp, alt text, usage tracking) |
| Auth/RBAC | Must be built (sessions, hashing, permissions matrix, guards) |
| Versions/drafts | Must be built (revision tables, diffing, restore) |
| Preview | Must be built (draft mode + cookie) |
| Audit log | Must be built |
| Risk | We would be re-implementing ~70% of a CMS, badly at first, then living with it |
| Cost | Highest engineering cost, lowest dependency risk, total control |
| Timeline | Longest — realistically 3–5× the integrated option |

**Verdict:** technically the most "pure", commercially the weakest. Only correct if the owner
wants to own a CMS as a product. Not recommended.

---

## Option B — Payload CMS 3 embedded in the Next.js application *(recommended)*

Payload 3 installs **into the app**: its admin UI serves at `/admin` from the same Next.js
process, its collections map to the same typed data the frontend already consumes, and its Local
API can be called from server components without HTTP.

| Dimension | Assessment |
| --- | --- |
| Fit with the repo | Strong — one repo, one deploy, TypeScript end to end |
| Localization | Built-in field-level localization (`ar`/`en`) with fallback and per-field control |
| Blocks | Built-in blocks fields with per-block schemas and variants |
| Media | Built-in uploads + image sizes + S3/R2 adapter (sharp-based) |
| Auth/RBAC | Built-in auth with per-collection access-control functions |
| Versions/drafts | Built-in versions, drafts, autosave, scheduled publish via the jobs queue |
| Preview | Built-in preview URLs + Next.js draft mode integration |
| Audit log | Partly built (versions + hooks); a dedicated audit collection is a small addition |
| Admin UX | Purpose-built, customizable, supports RTL and custom components |
| Risk | **Next.js 16 compatibility must be verified in a spike** (Payload tracks Next 15.x today) |
| Cost | Zero licence; hosting adds a Postgres + object storage requirement |

**Verdict:** delivers 60–80% of the required foundation safely, leaves the Seven Lands-specific
20–40% (branded admin UX, block variants, lead pipeline rules, hours model, script governance)
as custom work on top of a supported core. Recommended, conditional on the compatibility spike.

---

## Option C — External headless CMS (Sanity / Contentful / Strapi / Directus)

| Dimension | Assessment |
| --- | --- |
| Fit with the repo | Content leaves the repo; hosting and content become separate systems |
| Localization | Usually strong (Sanity, Contentful) |
| Blocks | Strong in Sanity; weaker in most others |
| Admin UX | Best-in-class in Sanity; generic in Directus/Strapi |
| Auth/RBAC | Good; enterprise features can be paywalled |
| Cost | Sanity/Contentful scale in price at content volume; Strapi/Directus cost hosting |
| Control | Admin UI cannot be deeply branded without becoming a separate product |
| Risk | Two deployments to operate, content outside the repo (dev/staging divergence), vendor lock-in on the content model |

**Verdict:** Sanity is the strongest external option and would be a defensible choice for a
content-heavy publisher. For a seven-page corporate site with a small team, it adds a second
platform and a per-seat/vendor dimension without buying much that Option B does not already have.

---

## Comparison matrix

| Criterion | A. Custom | B. Payload in-app | C. External CMS |
| --- | --- | --- | --- |
| Time to first useful admin | Slow | Medium | Fast |
| Time to complete all requested modules | Very slow | Medium | Medium (with workarounds) |
| Localization quality | Built by us | Native | Native/varies |
| Block system quality | Built by us | Native | Native/varies |
| Media pipeline | Built by us | Native | Native |
| RBAC depth | Built by us | Native + custom | Varies/paywalled |
| Revisions/drafts | Built by us | Native | Usually native |
| Secrets handling | Ours | Env + custom | Vendor managed |
| Branded admin UX | Total | High (custom components) | Low–Medium |
| Operational surfaces | 1 | 1 (+DB/storage) | 2 (+DB/storage) |
| Vendor lock-in | None | Low (open source, self-hosted) | Medium–High |
| Maintenance burden | Highest (our code) | Medium (upstream) | Lowest |

## The decision driver

Every module the request asks for — localization with status, typed blocks, media with alt text,
RBAC, versions, preview, scheduling, audit — is **core CMS functionality**. Writing it by hand is
the luxury we cannot afford; renting it from a SaaS is the control we do not want to lose.
Payload occupies exactly the middle: in-repo, open source, self-hosted, customizable.
