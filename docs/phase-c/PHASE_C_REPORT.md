# PHASE C — GLOBAL SETTINGS, CONTENT AUTHORITY AND PUBLIC MEDIA · §66 REPORT

**PHASE_C_STATUS = PASS**
Date: 2026-10-07 · Database: local development PostgreSQL only · **PRODUCTION_MUTATED = NO**
Scope executed: the completion brief's 20 sections. No Phase D work started. **STOP gate respected.**

---

## A · What Phase C did

The public site stopped reading its own hard-coded facts and now reads the CMS as the single
authority, with the previous static configuration demoted to a guarded fallback. Six globals
(Site Settings, Contact, Business Hours, Social Accounts, Navigation, Footer) exist, are seeded with
**only verified facts**, and feed the header, footer, contact surfaces, metadata and structured data.
Media gained a `private | public` visibility model enforced at the byte level. Two infrastructure
defects found in Phase C were fixed permanently: interactive schema push, and an admin client-hint
header that forced a second navigation on every public page view.

## B · Canonical authority (§1)

| Field | Value | Source |
| --- | --- | --- |
| `CANONICAL_SITE_URL_SOURCE` | `SITE_CANONICAL_URL` (server-only, default `https://sevnland.com`) | `src/lib/site-origin.ts` |
| `RUNTIME_ORIGIN_SOURCE` | `NEXT_PUBLIC_SERVER_URL` → `RUNTIME_ORIGIN` → localhost; per-request helper `runtimeOrigin(headers)` | `src/payload.config.ts`, `src/lib/site-origin.ts` |
| `PREVIEW_CANONICAL_VERIFIED` | **YES** | served from `http://127.0.0.1:3000` |
| `AR_HOME_CANONICAL` | `https://sevnland.com/ar` | page HTML |
| `EN_HOME_CANONICAL` | `https://sevnland.com/en` | page HTML |
| `SITEMAP_ORIGIN` | `https://sevnland.com` (also `robots.txt` Host + Sitemap) | `/sitemap.xml`, `/robots.txt` |
| `OG_URL_ORIGIN` | `https://sevnland.com/og/og-ar.png` | page HTML |
| Leak scan | 0 occurrences of `localhost`, `127.0.0.1`, `e2b.app` across `/ar`, `/en`, `/ar/contact`, sitemap, robots | — |

`NEXT_PUBLIC_*` is no longer required for any published URL. CMS media paths are origin-free in
markup and absolutised against the canonical origin only where a fully-qualified URL is required.

## C · Critical-CH (§2)

| Metric | BEFORE | AFTER |
| --- | --- | --- |
| `CRITICAL_CH_PUBLIC` | present | **ABSENT** |
| `CRITICAL_CH_ADMIN` | present | **RETAINED** (`/admin`, `/admin/*`; not `/api/*`) |
| `NAV_COST_BEFORE` | **2 document requests per navigation**, `responseStart` median 20 ms | — |
| `NAV_COST_AFTER` | **1 document request**, 11 ms | — |
| `RETRY_BEFORE / RETRY_AFTER` | 7/7 rounds retried / 0/7 | — |
| `ADMIN_REGRESSION` | none — admin keeps hints, renders and authenticates | — |

Mechanism: the official `withPayload` result is wrapped and the client-hint rules' `source` narrowed
to `/admin/:path*`. No node_modules patch, no fork, no middleware. Details:
`docs/phase-c/ORIGINS_AND_HEADERS.md`.

## D · Media visibility (§3, §4, §6)

| State | original | thumbnail | card derivative |
| --- | --- | --- | --- |
| `PRIVATE_ORIGINAL_ANON` | **DENY (403)** | — | — |
| `PRIVATE_THUMB_ANON` | — | **DENY (403)** | — |
| `PRIVATE_DERIVATIVE_ANON` | — | — | **DENY (403)** |
| `PRIVATE_AUTH` (admin, `media.read`) | **ALLOW (200, 14 270 B)** | **ALLOW (200, 2 477 B)** | **ALLOW (200, 6 335 B)** |
| `PUBLIC_ORIGINAL_ANON` | **ALLOW (200, 14 270 B)** | — | — |
| `PUBLIC_THUMB_ANON` | — | **ALLOW (200, 2 477 B)** | — |
| `PUBLIC_DERIVATIVE_ANON` | — | — | **ALLOW (200, 6 335 B)** |
| `PRIVATE_TO_PUBLIC_ACTIVATION` | **immediate — first request, 73 ms** | | |
| `PUBLIC_TO_PRIVATE_REVOCATION` | **immediate — first request, 40 ms** | | |

* Same three URLs throughout: the path and filename never change, so obscurity is not the control.
* A bare cookie replay (no browser context headers) is refused — token possession is not access.
* Both transitions are audited (`media_visibility_changed`).
* `Cache-Control: private, no-store` on file responses, so a cache cannot outlive a revocation.
* Full gate: `npx payload run src/scripts/verify-media-binary.ts` → **22 checks, 0 failures**.

## E · Migrations and clean-database reproduction (§13, §14)

| Flag | Value |
| --- | --- |
| `PAYLOAD_PUSH` | **DISABLED** (`push: false`, permanent, documented in the adapter) |
| `SCHEMA_DRIFT_RESOLVED` | **YES** — the dev-pushed database was dropped; schema now comes only from migrations |
| `EMPTY_DB_REBUILD` | **PASS** |
| `TABLE_COUNT` | **72** |
| `MIGRATION_TIME` | Phase B **51 ms** + Phase C **101 ms** (3.3 s wall including startup) |
| `MIGRATION_LEDGER` | `20261007_162549_phase_b_auth_users_rbac` · `20261007_173537_phase_c_globals` |
| `SCHEMA_PUSH_OCCURRED` | **NO** — a fresh database stayed at 0 tables after a server boot and successful requests |

Sequence proven: empty DB → migrations → seeds → admin boot → public boot → full test suite.
Policy: `docs/phase-c/MIGRATION_POLICY.md`.

## F · Cache, freshness and fallback (§6, §8, §9)

| Flag | Value |
| --- | --- |
| `FIRST_REQUEST_FRESH` | **YES** — old value → admin update → `revalidateTag(tag, { expire: 0 })` → first public request carries the new value, on two independent surfaces |
| `STATIC_FALLBACK_FAILURE_TEST` | **PASS** — dead `DATABASE_URI`: `/ar`, `/en`, `/ar/services`, `/ar/contact`, `/sitemap.xml` all 200 with complete, correct content and production canonicals; **84** server-side `[content] … unavailable` lines; **zero** visitor-visible error text |
| Restore | canonical seeded data restored and verified afterwards |

Detail: `docs/phase-c/CACHE_AND_FALLBACK.md`.

## G · Required tests (§7, §10, §11, §12)

| Suite | Command | Result |
| --- | --- | --- |
| Phase B authorization invariants | `npx payload run src/scripts/verify-phase-b.ts` | **37 / 0 PASS** |
| Globals · Social · Hours · Navigation | `npx payload run src/scripts/verify-phase-c.ts` | **52 / 0 PASS** |
| Media binary delivery | `npx payload run src/scripts/verify-media-binary.ts` | **22 / 0 PASS** |
| Cache freshness | `node scripts/cache-freshness.mjs` | **YES** |

Highlights — Social: create/edit/enable/disable/reorder/delete, non-`https` rejected, unknown icon
key **rejected by the curated registry server-side**, only enabled accounts public, empty list
renders nothing. Navigation: internal route, external URL with `target=_blank` + `rel=noopener`,
disabled item unpublished, reorder honoured, independent AR/EN labels, localized CTA, and
`javascript:` / `data:` refused by the resolver **and** rejected by CMS validation. Hours: normal
day, closed day, split shifts, all-day, special closure, special opening, no-configuration
(UNKNOWN), plus **boundary semantics — opening inclusive, closing exclusive** (`from ≤ now < to`)
verified minute-by-minute at both edges, in `Asia/Riyadh`, with the timezone proven to change the
outcome. Full logs: `docs/phase-c/evidence/`.

## H · Public regression (§17)

| Flag | Value |
| --- | --- |
| `PUBLIC_CONTENT_CHANGED` | **NO** |
| `PUBLIC_VISUAL_REGRESSION` | **NONE** — 25/26 baseline captures pixel-identical; `privacy-ar-1440` differs by **3 pixels at ±1/255** on two glyph edges (rasterizer noise) |
| `BUILD` | **PASS** — 66 pages, `/admin` partial-prerender |
| `TYPECHECK` | **PASS** — `tsc --noEmit` exit 0 |
| `NO_NEW_LINT_WARNINGS` | **PASS** — 10 findings → 1 (the pre-existing react-hook-form `watch()` advisory), 0 errors |
| `PLAYWRIGHT` | **PASS** — 55 passed / 5 skipped / 0 failed |
| `A11Y` | **PASS** — included in the Playwright suite |
| `ADMIN_CODE_LEAK` | **NO** — 0 Payload markers across the 12 chunks the public pages reference |

Two genuine regressions were caught by this gate and fixed rather than accepted: the header CTA had
been left as a verification fixture (`تواصل الآن` → `/contact`) and a stale English page cache. Both
traces: `.phase-c-evidence/`.

## I · Admin responsive inspection (§16)

32 surface × viewport combinations (6 globals + media + users, at 390/768/1024/1440). All render,
all Arabic/RTL, **31/32 without horizontal overflow**. The single finding — every table-based
Payload list overflows by 32 px at ≤1024 px — was investigated to root cause: Payload's admin table
gives each cell `min-width: 150px` and its wrappers are `overflow-x: visible`. It reproduces on
`audit-events` and `roles` (lists with none of this phase's configuration) and does **not** occur on
the grid-based media list. Fixing it means overriding Payload's admin CSS, i.e. an admin restyle,
which the brief excludes. Recorded, not papered over; screenshots in `.phase-c-evidence/admin/`.

## J · Fixtures and production guards (§15)

* Seeder with a production-equivalent environment: **`REFUSED`**, `users = 0` afterwards.
* Verification scripts now carry the same guard (`ALLOW_VERIFICATION_WRITES`): without it they print
  `REFUSED` and exit — so `@sevenlands.test` personas cannot be created by a stray run.
* One content defect was found **because** the guard forces honesty: a crashed verification run had
  left fixture values in the navigation global. The suite now restores from the seeded constants, not
  from a read-back.

## K · Documentation (§18)

`docs/phase-c/`: `PHASE_C_REPORT.md` (this), `MEDIA_VISIBILITY.md` (incl. the S3/R2 design),
`ORIGINS_AND_HEADERS.md`, `MIGRATION_POLICY.md`, `CACHE_AND_FALLBACK.md`, `WIRING_LOG.md`,
`evidence/`. `AGENTS.md` carries the permanent invariants; `docs/PENDING-OWNER-INPUTS.md` lists the
seven remaining owner inputs (email, street address, hours, socials, logo override, canonical
confirmation, boundary semantics).

## L · Not invented

No email, street address, working hours, social URL, logo variant, client, metric or testimonial was
created. Hours and social accounts are seeded empty **on purpose** and the UI makes no claim from an
empty state. Every value in the CMS is owner-supplied or previously verified.

## M · What Phase C explicitly did not do

Pages CMS · Services CMS · Projects CMS · Insights CMS · SEO Center · Analytics · Pixels · Leads ·
CRM · content migration of `src/content` · production database or storage · any production mutation.

---

**PRODUCTION_MUTATED = NO · PHASE D NOT STARTED · AWAITING OWNER REVIEW**
