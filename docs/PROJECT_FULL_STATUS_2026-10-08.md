# SEVEN LANDS — FULL PROJECT STATE OF RECORD

**Date:** 2026-10-08 (Asia/Riyadh) · **Document type:** current-state audit (authoritative)
**Prepared by:** the agent session, from live inspection of the repository, the running production build, the live PostgreSQL database and real HTTP/browser probes.
**Replaces the need to read phase reports to understand current status.** Phase reports are kept, unedited, as history.

> **Truthfulness labels used throughout:** `NOT VERIFIED` (no current evidence) · `PREVIOUSLY REPORTED — NOT REVERIFIED` (an older report claimed it; today's evidence does not re-establish it) · `PLANNED — NOT IMPLEMENTED` (designed/authorized, no code).

---

## 0. VERIFICATION METHOD (how this report was produced)

Everything below was measured on the machine that hosts the project, in this session, against the **running production build** (`next start`) and the **live database** `seven_lands_dev`:

| Surface | Method | Evidence file |
|---|---|---|
| Repository | `git rev-parse`, `git status --short`, `git diff --stat`, `git show bc3040a:…` | `.audit/git.txt` |
| Stack | `node -v`, `npm -v`, declared vs installed versions read from `node_modules/*/package.json` | `.audit/stack.txt` |
| Database | `psql` against the live database: version, table/column/enum/index counts, migration ledger, row counts | `.audit/database.txt`, `.audit/db-content.txt` |
| CMS content | Payload Local API read-only dump (globals + collections) | `.audit/cms-content.txt`, `.audit/cms-content-identity.txt` |
| Public website | 24 real HTTP requests (12 routes × ar/en) parsing served HTML (title, description, canonical, hreflang, OG, robots, JSON-LD), security headers, robots.txt, sitemap.xml | `.audit/public-probes.txt` |
| Protected surfaces | anonymous + authenticated probes of admin, REST, GraphQL, preview | `.audit/public-probes.txt`, `.audit/probe-auth.txt` |
| QA | Fresh runs of every prior-phase suite + `npm test` + axe + lint + build + typecheck | `.phase-f-evidence/regression-*.log`, `.phase-f-evidence/a11y.log` |
| Visual | 16 screenshots of shipped-vs-CMS pages through a real browser + 26 public captures diffed against the accepted baselines | `.phase-f-evidence/visual/visual-equivalence.log`, `.audit/pixel-regression.txt` |
| Dependencies | `npm audit --json` (no `--force`) | `.audit/security-performance.txt` |
| Bundles | Asset measurement from the built app | `.audit/security-performance.txt` |

**No production system was touched. No DNS. No deployment. No external service provisioned. No paid resource created.** Two databases were used locally: `seven_lands_dev` (the working database) and `seven_lands_repro` (created and used only for the empty-DB reconstruction gate).

### Changes made to the repository during TODAY's audit window

This audit did not add features. It made exactly three local changes, all listed here because the mandate requires it:

1. **`eslint.config.mjs`** — added the phase-evidence folders (`.phase-b-evidence/**` … `.phase-f-evidence/**`) to the lint ignore list. Reason: verification harnesses are tooling, not shipped source, and they were producing warnings that muddied the lint gate. `npm run lint` returned to its pre-existing state (0 errors, 1 warning).
2. **`.phase-f-evidence/diag-repeat.mjs`** — renamed an unused loop variable.
3. **`.audit/*`** — new folder holding this audit's raw evidence (probes, dumps, logs). No application code.

Everything else in the working tree was produced **before** this audit request, in the Phase F implementation that was in progress when the request arrived (see §6 and §60).

---

## 1. WHAT SEVEN LANDS IS TODAY (plain language)

Seven Lands is a **bilingual (Arabic-first, RTL) corporate website plus its own admin control centre**, built on Next.js 16 + Payload CMS 3 + PostgreSQL. The public website is finished, designed, SEO-instrumented and visually frozen. Behind it sits a real CMS: an editor can currently change the six main pages (including the home page) block-by-block, rewrite the seven capability pages, manage the media library, the contact channels, navigation and footer, and can preview and publish in Arabic and English independently — with drafts, version history, restore, an audit log and role-based permissions.

The website **honestly says nothing it cannot prove**: there are no fake clients, projects, testimonials, metrics or articles anywhere. Legal pages ship with a placeholder notice on purpose, business hours and social accounts are intentionally empty, and the two content types that need real material (case studies, articles) are modelled but empty.

---

## 2. EXECUTIVE SUMMARY BLOCK

```
PROJECT = Seven Lands / سفن لاند

OVERALL_STATUS = PRE-LAUNCH (foundation complete, admin advanced, content systems partially complete,
                 no deployment, several owner-gated business inputs pending)

PUBLIC_WEBSITE_STATUS = COMPLETE and live-ready in code (20 real routes, ar+en, SEO/a11y verified).
                        Its contact-hours/social details are intentionally absent, and unfilled
                        submission capture is a launch blocker (see §62 D2).

ADMIN_CONTROL_CENTER_STATUS = FUNCTIONAL (auth, RBAC, audit, 6 globals, media library, Pages CMS with
                              draft/preview/publish/versions/restore, Services CMS added today and
                              uncommitted). Leads, Analytics, Integrations, SEO Center, Redirect
                              Manager, Ops and Site Health do not exist yet.

CMS_STATUS = PARTIAL — Pages = CMS authority for all six public system pages (ar+en, published).
             Services = CMS implemented today (7 documents, published ar+en, byte-equivalent to the
             static baseline). Projects = schema only, empty. Insights = schema only, empty.

PRODUCTION_STATUS = NOT DEPLOYED. Nothing on a public host. No DNS change. The old WordPress site is untouched.

LAST_COMPLETED_PHASE = Phase E (sealed, commit bc3040a).
CURRENT_IMPLEMENTATION_PHASE = Phase F (domain content) — implemented and verified today, NOT sealed,
                               NOT committed (working tree).
NEXT_LOGICAL_PHASE = Sealing Phase F (report + checkpoint), then Phase G (SEO Control Center + Redirect Manager)
                     per the overnight mandate — or whatever the owner mandates next.

PRODUCTION_MUTATED = NO
DEPLOYED = NO
PAID_RESOURCES_CREATED = NO
OWNER_ACTION_REQUIRED_NOW = NO (nothing is blocked from the engineering side; §72 lists five decisions
                             that unblock launch and operational readiness)
```

### In plain language

**What is Seven Lands today?**
A finished bilingual marketing website for a Qassim-based marketing/creative/technology company, with its own admin panel. Every page a visitor sees exists in Arabic and English, with correct direction (RTL/LTR), canonical URLs, hreflang, structured data, sitemap and Open Graph images. The design is locked and pixel-verified. The content is honest: nothing invented.

**What can the business owner actually do from the Admin today?**
Sign in with a real account; manage users and roles; read the audit log; edit site identity, contact channels, business hours, social accounts, navigation and footer; upload and describe media with Arabic/English alt text; edit the six main pages section-by-section (reorder, hide, disable), including the home page; edit the seven capability pages; preview a draft in the real page design before publishing; publish or unpublish each language separately; and restore an earlier version of a page.

**What still requires a developer?**
Everything on the "not built yet" list: leads capture/review, analytics dashboards, consent, custom scripts, the SEO control centre, redirects, scheduled publishing, global search, site-health diagnostics, bulk operations, revision recovery UI beyond pages/services. Also: any change to design, layout, new section types, new routes, or the storage/email infrastructure.

**What would prevent launching today?**
Five real things (§66): (1) form submissions are accepted and then dropped — no storage, no notification; (2) no database/media backup procedure exists on any hosting environment; (3) media has no production storage decision (local disk only); (4) legal pages still carry a placeholder notice that needs the owner's review; (5) no admin email provider exists, so a forgotten admin password cannot be recovered in production. None of these are engineering mysteries — they are scoped work plus owner decisions.

---

## 3. HIGH-LEVEL COMPLETION MATRIX

Statuses: `COMPLETE` (built + verified) · `FUNCTIONAL` (works, verified, some scope still open) · `PARTIAL` · `PLANNED` (designed/authorized, not implemented) · `NOT STARTED` · `BLOCKED` · `OWNER-GATED` · `DEFERRED`.

| Area | Status | Completion | Evidence | Remaining |
|---|---|---|---|---|
| Public frontend | COMPLETE | 20 routes ar+en served 200 with full SEO | `.audit/public-probes.txt` | — |
| Arabic website | COMPLETE | RTL, `lang="ar-SA"`, one h1, no overflow at 390/1440 | `qa/findings.json`, `npm test` 55 | physical iOS/Android devices |
| English website | COMPLETE | LTR, `lang` set, same routes | `.audit/public-probes.txt` | — |
| Responsive design | COMPLETE | 390/768/1024/1440 captures; no horizontal overflow | `qa/findings.json`, Phase D `admin-responsive.log` | — |
| Motion | COMPLETE | 160–260 ms UI, 350–650 ms reveals, reduced-motion honoured | `tests/smoke.spec.ts`, a11y suite | — |
| Navigation | FUNCTIONAL | CMS-driven header/footer; internal links resolve by key | `.audit/cms-content.txt` | — |
| Footer | FUNCTIONAL | CMS groups + legal links only; approved commercial line | `tests/smoke.spec.ts` footer test | — |
| Forms | FUNCTIONAL | 1 form (`/api/brief`): Zod + honeypot + rate limit + UTM, 14/14 gate green | `.phase-f-evidence` forms gate re-run | persistence + notification (§62 D2) |
| WhatsApp | COMPLETE | Server-derived links, page-specific openers, verified number only | smoke tests (2 tests) | — |
| SEO | FUNCTIONAL | unique metadata, canonical, hreflang (ar-SA/en/x-default), OG per locale | `.audit/public-probes.txt` | SEO Center (Phase G) |
| Structured data | FUNCTIONAL | Organization, WebSite, Service, FAQPage, OfferCatalog, BreadcrumbList | served HTML (`.audit/public-probes.txt`) | richer Article/Project types (needs content) |
| Sitemap | COMPLETE | 28 URLs, excludes privacy/terms, alternates present | `.audit/public-probes.txt` | — |
| Robots | COMPLETE | allows site, disallows `/api/`, `/admin`, `/*/preview` | `.audit/public-probes.txt` | — |
| OG / social sharing | FUNCTIONAL | per-locale OG image from static assets; CMS override field exists | served HTML | CMS-uploaded OG image not yet used (Media empty) |
| Admin | FUNCTIONAL | Payload admin, Arabic UI, custom library/picker screens | Phase D evidence screenshots | Site Health, bulk actions, global search (Phase K) |
| Authentication | COMPLETE | Payload auth, 2 h sessions, 5-attempt lockout, server-side revocation | `src/collections/Users.ts` | password-reset email needs provider |
| Users | COMPLETE | create/edit/suspend/reactivate, last-super-admin protection | Phase B suite PASS today | — |
| Roles | COMPLETE | 5 system roles + custom roles possible, permission catalogue | `.audit/cms-content.txt` | — |
| Permissions | COMPLETE | catalogue enforced server-side on every collection/global/endpoint | Phase B suite PASS today | — |
| Audit | FUNCTIONAL | 479 events, immutable (create-only), readable with `audit.read` | `.audit/db-content.txt` | filtering/retention UX (Phase K) |
| Global settings | FUNCTIONAL | 6 globals, all populated except hours/social media assets | `.audit/cms-content-identity.txt` | owner data (G1) |
| Contact settings | FUNCTIONAL | WhatsApp + phone channels verified; email channel absent (owner input) | `.audit/cms-content-identity.txt` | official email (G1) |
| Business hours | OWNER-GATED | model + admin screen exist; 0 rows | `.audit/cms-content-identity.txt` | real hours (G1) |
| Social accounts | OWNER-GATED | model + admin screen exist; 0 rows | `.audit/cms-content-identity.txt` | real URLs (G1) |
| Navigation management | COMPLETE | header items + route keys, CMS-backed | `.audit/cms-content.txt` | — |
| Footer management | COMPLETE | 2 groups / 13 links + legal, CMS-backed | `.audit/cms-content.txt` | — |
| Media Library | FUNCTIONAL | custom library UI, picker, usage tracking, safe delete, alt ar/en | Phase D report + today's suites | 0 assets; production storage (G2) |
| Pages CMS | COMPLETE | 6 pages, drafts, per-locale publish, preview, versions, restore | today's suites + `.audit/cms-content.txt` | — |
| Blocks | COMPLETE | 18 registered types, 17 rendered, 1 intentionally unrendered | `verify-phase-e.ts` 64/0 | — |
| Drafts | COMPLETE | Payload drafts on pages + services (+ projects/insights schema) | today's suites | — |
| Preview | COMPLETE | authenticated preview, noindex/nocache/no-store, hidden anonymously | `.audit/probe-auth.txt` | — |
| Versions | COMPLETE | version rows for pages (129) and services (162); restore verified | runtime suite (restore → HTTP 200) | — |
| Publishing | COMPLETE | gated endpoints, per-locale, validator with named blockers | services gate 48/0, Phase E gates | — |
| Services CMS | FUNCTIONAL (uncommitted) | 7 documents, ar+en published, byte-identical to shipped copy | services gate 48/0 + text equivalence 24/24 | seal (report + commit) |
| Projects CMS | PARTIAL | collection + publish gate + admin screens exist; 0 records by design | `.audit/cms-content.txt` | real projects (owner data) |
| Articles CMS | PARTIAL | collection + publish gate + lexical body + admin screens; 0 records by design | `.audit/cms-content.txt` | real articles |
| Leads | NOT STARTED | no tables, no UI; form submissions dropped today | `.audit/database.txt` (0 lead tables) | Phase H |
| Analytics | PLANNED — NOT IMPLEMENTED | no dashboard, no GA4/GSC adapter in code | repository search | Phase I |
| Search Console | OWNER-GATED | no verification token configured | — | owner credential |
| Pixels | PLANNED — NOT IMPLEMENTED | no tracking scripts, no pixel config | repository search | Phase J |
| Consent | PLANNED — NOT IMPLEMENTED | public site loads no analytics cookies at all (nothing to consent to yet) | served HTML: first-party scripts only | Phase J |
| Custom scripts | PLANNED — NOT IMPLEMENTED | no script field, no CSP origin registry | repository search | Phase J |
| Site health | NOT STARTED | no diagnostics screen | — | Phase K |
| Storage | OWNER-GATED | local disk (`media/`), abstraction in place, no object storage | `src/collections/Media.ts` | G2 decision |
| Email | BLOCKED (external credentials) | no provider; Payload logs emails to console | server log | G4 decision |
| Deployment | NOT STARTED | no host, no CI, no staging | no `.github`, no deploy configs | Phase M/N + G5 |
| Backup / restore | DOCUMENTED ONLY | no hosting-level backup exists to test | §48 | G5 |
| QA | COMPLETE (current) | every prior-phase suite re-run green today; 55 Playwright + 18 axe | `.phase-f-evidence/regression-*.log` | Firefox/WebKit, real devices |
| Security | FUNCTIONAL | CSP/HSTS/nosniff/referrer/permissions headers, RBAC, media privacy, rate limit | `.audit/public-probes.txt` | CSP nonces, security review items §43 |
| Performance | NOT VERIFIED | bundle sizes measured; **no Lighthouse on a real host** | §39 | staging measurement |
| Accessibility | COMPLETE (automated) | axe 18/18 (WCAG 2.0/2.1 A+AA + best practice) | `.phase-f-evidence/a11y.log` | manual screen-reader pass |

---

## 4. CURRENT TECHNOLOGY STACK (exact versions, measured today)

Runtimes: **Node v20.20.2**, **npm 10.8.2** (`node -v`, `npm -v`).

| Package | Declared | Installed | Why it is here |
|---|---|---|---|
| `next` | 16.4.0 | 16.4.0 | Application framework; App Router, PPR/cacheComponents, streaming |
| `react` / `react-dom` | 19.3.0 | 19.3.0 | UI runtime |
| `typescript` | ^5 | 5.9.3 | Strict typed codebase (dev) |
| `payload` | 3.90.2 | 3.90.2 | CMS core: collections, globals, access control, versions, jobs |
| `@payloadcms/next` | 3.90.2 | 3.90.2 | Admin panel + REST/GraphQL routes inside Next |
| `@payloadcms/db-postgres` | 3.90.2 | 3.90.2 | Drizzle-based PostgreSQL adapter; migrations are the only schema authority (`push: false`) |
| `@payloadcms/richtext-lexical` | ^3.90.2 | 3.90.2 | Controlled rich text (no raw HTML) for article bodies |
| `graphql` | 16.14.2 | 16.14.2 | Required peer of Payload's GraphQL route (see §62 D1 — the route is currently broken by a data-shape defect) |
| `sharp` | 0.35.5 | 0.35.5 | Image pipeline: derivatives, EXIF handling, MIME sniffing |
| `next-intl` | ^4.14.9 | 4.14.9 | Localisation: `/ar` + `/en`, messages, locale-aware navigation |
| `motion` | ^14.0.0 | 14.0.0 | The only animation library (reveals, transitions); reduced-motion aware |
| `tailwindcss` + `@tailwindcss/turbopack` | ^4 | 4.3.3 | Design tokens and utilities, compiled by Turbopack |
| `sass` | 1.105.1 | 1.105.1 | Legacy stylesheet support (dev dependency, pulled in by Payload) |
| `zod` | ^4.6.5 | 4.6.5 | Server-side validation (form schema, block validators) |
| `react-hook-form` + `@hookform/resolvers` | ^7.89.0 / ^5.9.1 | 7.89.0 / 5.9.1 | Client form state + Zod resolver |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.7.0 | 2.1.1 / 3.7.0 | Class composition |
| `@playwright/test` | ^1.63.0 | 1.63.0 | End-to-end smoke + a11y suites (dev) |
| `@axe-core/playwright` | ^4.13.0 | 4.13.0 | Automated accessibility checks (dev) |
| `eslint` + `eslint-config-next` | ^9 / 16.4.0 | 9.39.5 / 16.4.0 | Linting (dev) |

**Kinds of dependency:** production = the runtime list above (Next, React, Payload + adapter + lexical, sharp, next-intl, motion, zod, RHF, clsx/tailwind-merge, graphql). Admin-only surface = Payload collections/globals code (shipped in the same app, admin chunks are separate — see §39). Dev/build-only: TypeScript, ESLint + config, Tailwind CLI bits, Playwright, axe, sass.

**Notable transitive risks:** 14 advisories from `npm audit` (0 critical / 9 high / 5 moderate), all in build/dev tooling chains (`sass→chokidar→braces`, `fast-glob→micromatch→braces`, `esbuild`, `drizzle-kit`, `@next/eslint-plugin-next`). None resolve into browser-shipped runtime code — details and triage in §44.

**Not present (and not missed):** no GSAP, no state library, no ORM beyond Payload's, no CSS-in-JS, no UI kit, no analytics SDKs, no marketing pixels. The stack is deliberately small.

---

## 5. REPOSITORY / GIT STATE

```
PROJECT_ROOT          = /home/user/seven-lands-website
CURRENT_BRANCH         = master
HEAD                   = bc3040a7815fd24928d03d6a7c3d2624b659797d
LAST_COMMIT_MESSAGE    = "Phase E sealed: about/contact/start-a-project migrated to the Pages CMS
                          (12/12 text equivalence, 0px visual, form gate green)"
COMMITS_IN_HISTORY     = 1 (the repository was initialised during Phase E sealing)
LAST_RELEVANT_CHECKPOINT = bc3040a (Phase E)
WORKING_TREE           = 39 changed/untracked entries: 25 modified tracked files (+885 / −134 lines)
                         and 14 untracked paths
```

### Summary of the uncommitted changes, by subsystem

| Subsystem | Files | What it is |
|---|---|---|
| Domain collections (new) | `src/collections/Services.ts`, `Projects.ts`, `Insights.ts`; `src/lib/services/*`, `src/lib/projects/*`, `src/lib/insights/*` | Phase F content models, publication gates, public adapter |
| Migrations (new) | `20261008_103522_phase_f_services_projects_insights`, `20261008_103658_phase_f_service_glyph_registry` (+ `src/migrations/index.ts`) | The schema for the three collections; already applied to the dev DB (batches 3–4) |
| Public pages rewired | `src/app/[locale]/{page,services/page,services/[slug]/page,about/page,work/page,work/[slug]/page,not-found.tsx,not-found/page}.tsx`, `src/components/sections/{LandsSystem,ServicesIndex,Problems,WorkTeaser}.tsx`, `src/components/blocks/PageBlocks.tsx`, `src/lib/schema.ts` | Visible capability content now reads one authority (CMS → shipped fallback); JSON-LD follows the same source |
| Shared contracts | `src/lib/media/usage.ts` (usage registry now scans collections), `src/lib/content/tags.ts`, `src/lib/auth/audit.ts`, `src/collections/AuditEvents.ts`, `src/payload.config.ts`, `src/payload-types.ts` | Media-usage coverage for the new collections; cache tags; 12 new audit actions |
| Seed | `src/scripts/seed-services.ts` | Deterministic migration of the shipped seven-capability copy into the CMS (drafts only) |
| Phase docs (untracked) | `.phase-f-evidence/**`, `docs/admin-control-center/overnight/**` | Phase F evidence + the owner-gate and overnight logs |
| Incidental | `.phase-d-evidence/verify-phase-d-samples.json`, `docs/admin-control-center/phase-e/{PHASE_E_REPORT.md,PLAN.md}`, `eslint.config.mjs` | Fixture sample file rewritten by today's suite run; Phase E report/plan updated at seal time; lint ignores (this audit) |

**No commit was made during this audit** (explicitly out of scope). The repository therefore still stands at the Phase E checkpoint; all Phase F work lives in the working tree and is safe (files on disk) but unsealed.

---

## 6. CURRENT APPLICATION ARCHITECTURE (as built)

```
                    ┌───────────────────────────────────────────────────────────┐
  Visitor ─────────▶│ Next.js 16 App Router (single deployable app)              │
                    │  • /[locale]/…  Arabic (default, RTL) + English (LTR)      │
                    │  • middleware: locale routing + real 404 table             │
                    │  • PPR / cacheComponents: static shell + streamed parts    │
                    └───────────────▲───────────────────────────┬───────────────┘
                                    │ server components         │ /api/brief (POST)
                     content adapter │ (never Payload in the     │  Zod + honeypot +
                     (one per domain)│  browser bundle)          │  rate limit + UTM
                                    │                           ▼
        ┌───────────────────────────┴──────────┐        (delivery via optional
        │ Payload Local API (server-side)      │         BRIEF_WEBHOOK_URL → §62 D2)
        │  • 'use cache' + cache tags          │
        │  • overrideAccess + explicit locale  │
        └───────────────┬──────────────────────┘
                        │
        ┌───────────────▼──────────────────────┐        ┌───────────────────────────┐
        │ PostgreSQL 17.11  (seven_lands_dev)  │◀───────│ Payload Admin (/admin)    │
        │  • 210 tables · 9 migrations         │        │  • RBAC (permission set)  │
        │  • schema authority = migrations     │        │  • audit log (immutable)  │
        │  • push: false                       │        │  • media library + picker │
        └──────────────────────────────────────┘        └───────────────────────────┘
                        │
        ┌───────────────▼──────────────────────┐
        │ Media: local disk ./media (empty)    │  → production storage = OWNER GATE G2
        │  public/private visibility + sharp   │
        └──────────────────────────────────────┘
```

**Public / admin separation.** One deployable app, two audiences. The public site never imports Payload into client code: pages are server components that call an adapter (`src/lib/pages/adapter.ts`, `src/lib/services/public.ts`, `src/lib/content/cms.ts`), which is the single place that decides *which document wins*, *which locale is read* and *which blocks are visible*. The admin is Payload's own UI plus two custom screens (media library, media picker).

**Content authority (one documented hierarchy).** For a given domain: a document **published for that locale** wins; otherwise the **shipped static content for the same locale** is served. There is no cross-language fallback anywhere (`fallback: false` in Payload's localisation).

**Cache strategy.** Reads happen inside `'use cache'` scopes with explicit tags: `page:{id}`, `page-system:{key}`, `service:{id}`, plus list tags (`pages`, `services`, …). Writes invalidate exactly the tags they touched. Served HTML shows `cache-control: s-maxage=60, stale-while-revalidate=3540` with `x-nextjs-cache: HIT` and `x-nextjs-prerender: 1` on `/ar`.

**Preview.** `/[locale]/preview?path=…` is a Suspense boundary that fetches the draft through Payload with `no-store`, renders the real design with a preview banner, and is: authenticated-only (anonymous → 404, verified today), `noindex, nofollow, nocache`, `cache-control: no-store, private`, absent from the sitemap and blocked in robots.

**Media delivery.** Files live on disk (`MEDIA_DIR` or `./media`); public assets are reachable via the file route, private ones are gated and return 403 anonymously (verified by the media-binary suite, re-run today). Production storage (R2/S3/CDN, private-link TTL) is deliberately an owner decision; the abstraction and policy layer already exist.

**Authorisation.** Every collection, global and custom endpoint declares access rules derived from the permission catalogue (`src/lib/auth/access.ts`). RBAC is enforced server-side; the UI merely reflects it.

---

## 7. PUBLIC WEBSITE — FULL STATUS (measured today)

12 route patterns × 2 locales = 24 real requests. All returned **200** except the deliberate 404 probe. Every 200 page carries: one canonical URL, three `hreflang` alternates (`ar-SA`, `en`, `x-default`), an OG image for its locale, and `robots: index, follow` — except the two legal pages, which are `noindex, nofollow` and excluded from the sitemap by design.

| Route | AR | EN | Authority today | SEO | Canonical | hreflang | In sitemap | State |
|---|---|---|---|---|---|---|---|---|
| `/` | 200 | 200 | **Pages CMS** (`home`, 8 blocks) | unique title/desc | yes | 3 | yes | published ar+en |
| `/services` | 200 | 200 | **Pages CMS** (hub) + Services CMS (7 cards) | unique | yes | 3 | yes | published |
| `/services/{7 slugs}` | 200 ×7 | 200 ×7 | **Services CMS** (published) with shipped fallback | unique per capability | yes | 3 | yes ×7 | published ar+en |
| `/work` | 200 | 200 | Shipped static (honest empty state) | unique | yes | 3 | yes | static |
| `/work/{slug}` | — | — | Shipped static; **no case study exists** | n/a | n/a | n/a | no | not generated |
| `/insights` | 200 | 200 | Shipped static (honest empty state) | unique | yes | 3 | yes | static |
| `/insights/{slug}` | — | — | Shipped static; **no article exists** | n/a | n/a | n/a | no | not generated |
| `/about` | 200 | 200 | **Pages CMS** | unique | yes | 3 | yes | published |
| `/contact` | 200 | 200 | **Pages CMS** | unique | yes | 3 | yes | published |
| `/start-a-project` | 200 | 200 | **Pages CMS** | unique | yes | 3 | yes | published |
| `/privacy` | 200 | 200 | **Pages CMS** (legal composition) | unique | yes | 3 | **no** | published, noindex |
| `/terms` | 200 | 200 | **Pages CMS** (legal composition) | unique | yes | 3 | **no** | published, noindex |
| `/not-found` | 200 | 200 | Static 404 page | — | — | — | no | static |
| unknown path | 404 | 404 | Real 404 (proxy + route table) | — | — | — | — | verified today |
| `/sitemap.xml` | 28 URLs total, no privacy/terms, alternates present | | | | | | | |
| `/robots.txt` | allows site; disallows `/api/`, `/admin`, `/*/preview` | | | | | | | |

**Route classes.** *System pages* = home, about, contact, start-a-project, privacy, terms (CMS, published). *Custom pages* = the `/[locale]/[slug]` route exists and is CMS-driven but there are **0 custom pages** today. *Service routes* = the seven capability pages (CMS, published). *Project routes* = exist in code, generate nothing (no records). *Article routes* = exist in code, generate nothing (no records).

**Verified 404 behaviour.** `/ar/this-page-does-not-exist` returns a real 404 with the site's 404 page (HTTP 404, no canonical, no hreflang) — not a soft 200.

---

## 8. PAGE CMS STATUS

| Capability | Status today | Evidence |
|---|---|---|
| Page model | System pages (fixed identity, fixed path) + custom pages (slug-based) | `src/lib/pages/system-pages.ts`, `src/collections/Pages.ts` |
| System pages | 6, all published **ar+en** | `.audit/cms-content.txt` |
| Custom pages | 0 existing; route + validator + reserved-slug protection in place | Phase E suite (custom page create → publish → cleanup, re-run today) |
| Localized fields | Every field is per-locale; reads/writes always name a locale | Phase E "locale safety" suite: 14 checks, 0 failed today |
| Drafts | Payload drafts with `draft: true` reads for preview/admin | verified today |
| Preview | `/[locale]/preview?path=…`, authenticated, noindex/nocache | `.audit/probe-auth.txt` |
| Publishing | One gated endpoint per locale; blockers are named (page/block/field/asset) | Phase E suite + services gate |
| Unpublishing | Per locale; the shipped composition returns for that locale | Phase E equivalence harness |
| Versions | 129 version rows for pages; restore verified today (revision 124 → HTTP 200) | `.phase-f-evidence/regression-e.log` |
| Blocks | 18 registered types, 17 rendered, ordering/visibility/enable per block | `verify-phase-e.ts` 64/0 |
| Block registry | Single source of truth; a block without a renderer cannot publish | `.phase-f-evidence` phase-e suite |
| Media picker | Custom picker inside blocks; usage-aware | Phase D docs + `src/components/admin` |
| SEO contract | Per-page title/description/OG/noindex, canonical always derived from the route | served HTML today |

**Pages whose authority is the CMS today:** home, about, contact, start-a-project, privacy, terms (all ar+en) — plus the seven capability pages through the Services CMS.
**Pages that remain static today:** `/work`, `/insights` (honest empty states), the 404 pages, and every section of the home page that is *code-owned* by design (see §56).

---

## 9. BLOCK SYSTEM (registered types, current usage)

| Key | Admin label (ar) | Public component | Status | Currently used by | Media | Variants | Publish validation |
|---|---|---|---|---|---|---|---|
| `hero` | القسم الافتتاحي | `Hero` | rendered | home | declares media, **refuses to publish it** | — | yes |
| `trustStatement` | بيان الثقة | `TrustStatement` | rendered | home | — | — | yes |
| `lands` | المجالات السبعة | `LandsSystem` | rendered | home | — | — | yes |
| `problems` | المشكلات | `Problems` | rendered | home | — | — | yes |
| `workTeaser` | لمحة من الأعمال | `WorkTeaser` | rendered | home | — | — | yes |
| `process` | المنهجية | `ProcessSection` | rendered | home | — | — | yes |
| `why` | لماذا نحن | `WhySection` | rendered | home, about | — | — | yes |
| `cta` | الدعوة الختامية | `FinalCta` | rendered | home, about | — | — | yes |
| `pageHeader` | رأس الصفحة | `PageHeaderSection` | rendered | about, contact, start-a-project, privacy, terms | — | 3 approved variants | yes |
| `richText` | نص منسّق | `SplitRichText` + lexical body | rendered | about, privacy, terms | — | — | yes |
| `servicesTeaser` | بطاقة الخدمات | `ServicesIndex` | rendered | about | — | — | yes |
| `operations` | كيف نعمل | `OperationsSection` | rendered | about | — | — | yes |
| `noteSection` | ملاحظة | `NoteSection` | rendered | about | — | — | yes |
| `buttonRow` | صف الأزرار | `ButtonRow` | rendered | about | — | — | yes |
| `contactPanel` | لوحة التواصل | `ContactPanel` | rendered | contact | — | — | yes |
| `briefForm` | نموذج المشروع | `BriefFormSection` | rendered | start-a-project | — | — | yes |
| `legalPage` | صفحة قانونية | `LegalPage` | rendered | privacy, terms | — | — | yes |
| `mapEmbed` | خريطة | *(none)* | **registered, not rendered** | nothing | — | — | refused at publish |

**Controlled flexibility preserved?** Yes. There is no free-form layout builder: no columns/rows primitives, no raw HTML, no arbitrary CSS, no spacing/animation controls, no nesting. Editors choose *from* approved sections, order them, enable/disable them, and fill typed fields. Every section maps to a component that already shipped — the renderer writes no new markup and generates no CSS.

**Has it drifted toward a generic page builder?** No. 18 types, of which exactly one (`mapEmbed`) is intentionally un-rendered and therefore unpublishable. That is the opposite of drift: the system refuses to accept content it cannot display.

---

## 10. SERVICES — CURRENT STATUS

**What exists now (implemented today, uncommitted).** The seven capability territories are editable CMS documents. The route stays derived from an immutable key, so no editorial action can move or break an indexed URL.

| # | Slug (immutable) | Field state | Authority today | Glyph (approved set) | ar | en |
|---|---|---|---|---|---|---|
| 01 | `strategy-business-growth` | published, enabled | Services CMS (copy == shipped) | `strategy` | published | published |
| 02 | `branding-creative` | published, enabled | Services CMS | `branding` | published | published |
| 03 | `content-production` | published, enabled | Services CMS | `content` | published | published |
| 04 | `social-digital-presence` | published, enabled | Services CMS | `social` | published | published |
| 05 | `performance-acquisition` | published, enabled | Services CMS | `performance` | published | published |
| 06 | `web-commerce-experiences` | published, enabled | Services CMS | `web` | published | published |
| 07 | `software-automation-technology` | published, enabled | Services CMS | `technology` | published | published |

Per capability the editor controls: title, short label, promise (outcome line), intro, WhatsApp opener, scope items, "when you need this" pairs, FAQs, scope note, SEO title/description/OG/noindex, order, glyph, enabled, optional cover image (not rendered publicly in this phase), and an internal-only source note is **not** part of this collection.

**What the system guarantees (verified today, not asserted):**

- **Content equivalence:** 24/24 public captures byte-identical between the CMS-published site and the shipped baseline (home, hub, 7 details, work, insights, sitemap × ar/en).
- **Visual equivalence:** 15/16 browser screenshots pixel-identical; the single difference is 38 pixels of text antialiasing (max channel delta 2) proven to be browser noise by a same-state repeat control (75 pixels, delta ≤ 2). Zero content/layout differences.
- **Per-locale truth:** publishing Arabic does not touch English; unpublishing Arabic returns the *shipped Arabic* page (byte-identical to baseline), never English.
- **Refusals are named:** empty required copy, a private cover image, stopping a published capability, and renaming its identity are all refused with Arabic messages naming the field/locale — and a refused publish changes nothing.
- **RBAC:** anonymous, viewer and marketing accounts cannot publish (403); editor can edit and publish; Super Admin can do everything.
- **Audit:** every publish/refusal is recorded (`service_published`, `service_updated`, …).

**Still open in this phase (honest list):** the phase is **not sealed** — no Phase F report, no checkpoint commit; `GET /api/services/:id/publish-status` exists but has not been exercised by a dedicated check; and the "static consumer audit" (every remaining place that reads capability names from code) was completed as part of the rewiring but is not separately evidenced beyond the suites above.

---

## 11. PROJECTS / CASE STUDIES — CURRENT STATUS

| Aspect | Status today |
|---|---|
| Schema | **Exists** — 9 tables for projects (`projects`, `projects_locales`, metrics, land keys, rels, versions) |
| Admin UX | Payload screens with Arabic labels; fields: name, slug, client, sector, year, featured, related capabilities, cover, gallery, summary, challenge, objective, approach, execution, result narrative, verified metrics (label + value + internal source note), testimonial (quote + attribution + approval), publishedAt, SEO group, per-locale state |
| Public routes | `/work` and `/work/{slug}` exist; the index renders the honest empty state; no detail page is generated because no record exists |
| Publishing | Gated endpoint: refuses incomplete metrics (label or value missing), refuses an unapproved or unattributed testimonial, refuses private/missing media by name |
| Media | Cover + gallery via the media library (usage-tracked) |
| Metrics | Entered by hand only; nothing is calculated. The internal source note is stored but **never rendered publicly** — proven today by a marker test that created a draft with a marker and confirmed the marker never appeared in public HTML |
| Testimonials | Requires approval + attribution; anonymous quotes are refused |
| SEO | Title/description/OG/noindex fields present |
| Empty state | Arabic + English honest copy ("no publishable case study yet") |
| **Real records** | **0** |
| **Fixtures** | **0** (the only project ever created was a scratch draft inside today's gate; it was deleted immediately and the count is back to 0) |
| Fake/sample content | **None.** Verified: `/api/projects` totalDocs = 0, and the public page shows the honest empty state |

---

## 12. INSIGHTS / ARTICLES — CURRENT STATUS

| Aspect | Status today |
|---|---|
| Schema | **Exists** — `insights`, `insights_locales`, land keys, versions |
| Categories | A simple free-text label per locale (no taxonomy until real content justifies it) |
| Authors | A per-locale display attribution field; no personal names are published |
| Body | Payload's own rich text (lexical) — headings, paragraphs, lists, links. No raw HTML, no scripts, no styles |
| Media | Cover image from the library; no external URLs |
| Drafts / preview / publish | Drafts + per-locale publish endpoint with a lexical-body check (an empty body cannot publish) |
| Scheduling | A future `publishedAt` is stored but publishing early is **refused** with an explanation (the scheduling surface itself is Phase K) |
| SEO | Title/description/OG/noindex fields |
| Public listing | `/insights` renders the honest empty state; `/insights/{slug}` generates nothing |
| Route | Exists in code; no parameterised page is generated today |
| **Real articles** | **0** |
| **Fixtures** | **0** (`/api/insights` totalDocs = 0) |
| Fake articles | **None.** No placeholder, no lorem ipsum, no draft-in-disguise |

---

## 13. GLOBAL SETTINGS — ACTUAL CURRENT STATE

Values read from the live database today. "Publicly rendered" was confirmed from served HTML.

| Global | Populated today | Publicly rendered | Notes |
|---|---|---|---|
| Site identity (`site-settings`) | brand names `سفن لاند` / `Seven Lands`; short description ar+en; `Asia/Riyadh`; enabled locales ar,en; default `ar`; country `SA`; maps URL set; city `بريدة، القصيم`; region `القصيم`; display line ar+en | yes | Brand **name defaults** exist in code as a fallback; **logo/favicon/default-OG fields are empty**, so the site renders the shipped brand assets (`/brand/…`, `/og/og-{locale}.png`) |
| Contact (`contact-settings`) | WhatsApp `0507776891` (primary, normalised `+966507776891`) and phone `0507776891` (label «اتصل بنا»/«Call us») | yes | **No email channel exists yet** — the owner's official email is pending (G1) |
| Business hours (`business-hours`) | **0 rows** | no | Model + admin screen ready; the site shows the honest "to be confirmed" treatment rather than invented hours |
| Special hours (`business-hours.exceptions`) | **0 rows** | no | same |
| Social accounts (`social-accounts`) | **0 rows** | no | No invented profiles |
| Navigation (`navigation`) | header items: services, work, about, insights, contact, start-a-project (ar+en labels, route keys, enabled) | yes | Stored as route **keys**, never hand-typed URLs |
| Footer (`footer`) | 2 groups / 13 links + legal links (privacy, terms) + approved commercial line | yes | CMS-backed |
| Logos / favicon / default OG | Media fields empty → shipped assets used | yes | Owner may upload replacements later (G1 optional) |
| Legal text | privacy + terms published from the CMS with an explicit placeholder notice for legal review | yes (noindex) | Owner/legal review pending |

---

## 14. OWNER DATA STATUS (what is still missing, and what it blocks)

| Item | Required? | Current value | Verified? | Publicly used? | Blocks what? |
|---|---|---|---|---|---|
| Official email address | Required for launch | **absent** | — | no | Contact completeness; email channel; lead notification destination |
| Full street address | Required for launch | **absent** (only «بريدة، القصيم، السعودية» + maps link) | City/region verified | partially | Local SEO (`LocalBusiness`-grade data), invoices, legal pages |
| Business hours | Required for launch | **empty (0 rows)** | — | no | "Open now" expectations; visitor trust |
| Special/holiday hours | Optional | empty | — | no | — |
| Social media URLs | Optional | **empty (0 rows)** | — | no | Footer/social presence |
| Alternate logo files | Optional | none | Logo rules fixed | shipped assets used | — |
| Portfolio / real projects | Required before claiming work | **0 records** | — | no | Credibility; the site honestly says "no publishable case study yet" |
| Client testimonials | Optional | none | — | no | — |
| Storage provider (R2/S3 + CDN + private-link TTL) | Required before launch with media | local disk only | — | local only | Production media delivery |
| Analytics measurement ID (GA4) | Required for measurement | **absent** | — | no | Traffic reporting (Phase I adapter ready) |
| Search Console access | Required for measurement | **absent** | — | no | Indexing reports, sitemap monitoring |
| Marketing pixels (Meta/TikTok/Snap/LinkedIn/Clarity) | Optional | none configured | — | no | Paid campaigns (Phase J) |
| Email/mail provider | Required for launch operations | **absent** | — | no | Lead notification + admin password reset |
| Legal review of privacy/terms | Required before launch | placeholder notice in place | — | noindex | Legal publication |
| Physical iOS/Android device testing | Required before launch | not done | — | — | Sign-off on real devices |

**Stale gates removed:** none of the five recorded gates (G1–G5) has been resolved by new information today; all five remain accurate, with one wording correction — see §62 D2/D5 (G4 claims submissions are stored; today they are not).

---

## 15. MEDIA LIBRARY — CURRENT STATE

| Aspect | Status today |
|---|---|
| Allowed types / max size | Restricted image + document set, size-capped; enforcement lives in the collection config and the upload pipeline |
| MIME sniffing | Yes — file content is inspected with `sharp`, declared MIME is not trusted |
| SVG policy | Separate high-risk permission (`media.svg_upload`), Super Admin only, not granted to Editor/Admin by default |
| EXIF policy | Stripped/metadata-handled through the image pipeline (Phase D) |
| Derivatives | Generated on upload (sizes used by the site and admin thumbnails) |
| Visibility | `private` by default; `public` is an explicit editorial decision; changing visibility requires `media.visibility` |
| Focal point | Supported per asset |
| Alt text | **Per locale, never inherited** (an Arabic-only asset reports "missing English alt" instead of silently reusing Arabic); captions likewise |
| Usage tracking | Registry-driven: globals (Phase C) **plus** pages, services, projects, insights (added in the uncommitted Phase F work). Delete is blocked with the list of referencing documents |
| Safe delete / replacement | Blocked when referenced; binary replacement is separate and audited |
| Picker | Custom admin picker with search, visibility filter, upload-in-place |
| Responsive admin UX | Library/picker verified at 390/768/1024/1440 (Phase D evidence) |

```
REAL_MEDIA_COUNT   = 0
FIXTURE_MEDIA_COUNT = 0
Storage currently used      = local disk (./media, empty)
Production storage decision = OWNER GATE G2 (provider + region + domain + private-link TTL)
```

Media being empty is **correct**, not a gap: the design system's imagery is shipped as code assets; uploading duplicates of them into the library is explicitly disallowed, and no client imagery has been supplied.

---

## 16. MEDIA SECURITY — TESTED BEHAVIOUR

Re-verified today with the Phase D/E media suites and the media publish gate (all green; suites create their own fixtures and clean them up, so the media count is 0 again afterwards):

| Probe | Result |
|---|---|
| Private original, anonymous (`/api/media/file/…`) | **403** |
| Private derivative, anonymous | **403** |
| Private asset metadata from an anonymous list call | not returned (the anonymous read filter is `visibility = public`) |
| Public original/derivative, anonymous | 200 (intended: published pages must be able to show their images) |
| Authenticated user with `media.read` | 200, including private assets |
| Blocked publish attempt referencing a private asset | HTTP 400, asset **stays private** (visibility is never flipped automatically), message names the asset |
| Deletion of a referenced asset | blocked with the usage list; unreferenced fixture deleted successfully (HTTP 200) |

**Future R2/S3 model (designed, not implemented):** same collection semantics; originals and derivatives written to object storage; public objects served through a CDN domain on a stable path; private objects served through short-lived signed URLs whose TTL is an owner decision. Nothing about the public site changes; only the storage driver.

---

## 17. AUTHENTICATION — CURRENT STATE

| Aspect | Today |
|---|---|
| Provider | Payload's built-in auth on the `users` collection (email + password), bcrypt hashing, server-side sessions |
| Session lifetime | **2 hours** (`tokenExpiration: 60*60*2`) |
| Session revocation | Server-side sessions on (`useSessions: true`) → suspending a user revokes access immediately |
| Cookies | `SameSite=Lax`, `secure` in production (a named escape hatch exists for TLS-less sandboxes and must never be set in a real deployment) |
| Brute-force protection | 5 failed attempts → 10-minute lockout; failures are audited (`login_failed`) |
| Password reset | Payload's flow exists but **cannot deliver email** without a provider (see §47) |
| 2FA | **Not implemented** |
| Suspension | Implemented (`user_suspended`, `user_reactivated` audited); a suspended fixture account exists in dev |
| Last login | Captured as audit events (`login`, 60 events); no dedicated "last login" field verified |

**Development users (must never exist in production):**

```
owner@sevenlands.test            super_admin      (seed account; a real owner account must replace it)
verify+admin@sevenlands.test     admin            ← TEST CREDENTIAL
verify+editor@sevenlands.test    editor           ← TEST CREDENTIAL
verify+marketing@sevenlands.test marketing        ← TEST CREDENTIAL
verify+viewer@sevenlands.test    viewer           ← TEST CREDENTIAL
verify+viewer-suspended@sevenlands.test viewer    ← TEST CREDENTIAL (suspended)
```

All five `verify+…` accounts are fixtures created by the Phase B verification suite with a fixed password. **They exist only in the development database.** A production database built from migrations + the auth seed contains exactly one user (the super admin), and the production seed refuses to run against a production database without an explicit flag.
</content>
</invoke>

---

## 18. ROLES — CURRENT STATE

```
REAL_ROLE_COUNT = 5 (system roles, present in the live database)
CUSTOM_ROLE_COUNT = 0 (custom roles are creatable by a Super Admin; none exists)
```

| Role | Identity | Purpose | Key permissions | Can anything bad happen by accident? |
|---|---|---|---|---|
| `super_admin` | System, immutable | Owner / technical authority | All permissions, plus high-risk ones: media SVG upload, delete operations, custom-script authority (when Phase J lands) | Yes — this is the "root" role and is protected from deletion of the last holder |
| `admin` | System, immutable | Day-to-day operations | Broad content + media + settings management, publish/unpublish on pages and services, user read + limited user management | Deliberately **excludes** high-risk items (SVG upload, destructive deletes) |
| `editor` | System, immutable | Content work | Create/edit pages, services, projects, insights; publish/unpublish content; media upload and visibility changes per catalogue | Cannot manage users/roles/settings or delete |
| `marketing` | System, immutable | Campaign-facing work | Read everything; edit contacts/social/hours and marketing-relevant globals; **no publish rights on content** (verified: publish attempts return 403) | Cannot publish |
| `viewer` | System, immutable | Read-only auditing/demo | Read access to content, media and audit log | Cannot change anything |

**Immutability:** the five system roles cannot be deleted or renamed (a custom role can be created and given any subset of permissions, but the system five stay stable for the permission catalogue to remain meaningful).

**Emergency floor:** the system refuses to delete, demote or suspend the **last active super admin** — a screen with no owner account would be unrecoverable.

---

## 19. PERMISSION MATRIX (permissions compared to actions, not labels)

Permission keys follow `resource.action`. This table is the *catalogue as enforced in code*; paywalled/high-risk edges are noted.

| Resource | read | create | update | delete | publish / special |
|---|---|---|---|---|---|
| Users | ✔ catalogue | ✔ only with `users.create` (Super Admin/Admin) | ✔ with `users.update` (cannot remove the last super admin) | ✔ with `users.delete` | suspend/reactivate with `users.suspend` |
| Roles | ✔ with `roles.read` | ✔ with `roles.update` | ✔ | custom only (system five protected) | permission assignment requires `roles.update_permissions` |
| Pages | ✔ | ✔ | ✔ | ✔ (custom pages; system pages cannot be deleted) | publish/unpublish per locale with `pages.publish` |
| Services | ✔ | ✔ | ✔ | ✔ | publish/unpublish with `services.publish`; identity (key) change is **withheld by the system**, not by permission — it is impossible for anyone |
| Projects | ✔ | ✔ | ✔ | ✔ | publish with `projects.publish` |
| Insights | ✔ | ✔ | ✔ | ✔ | publish with `insights.publish` |
| Media | ✔ (visibility-filtered for anonymous) | ✔ upload | ✔ update metadata/visibility | ✔ delete (blocked while referenced) | binary replacement audited; **SVG upload = separate Super-Admin-only permission** |
| Globals (6) | ✔ | — | ✔ per global permission | — | settings changes audited per global |
| Navigation / Footer | ✔ | — | ✔ | — | — |
| Audit log | ✔ with `audit.read` | — | **impossible** (create-only records; the collection is not editable or deletable — verified tonight) | impossible | — |
| Contacts / Brief submissions | not yet a resource | — | — | — | Phase H will gate personal data behind `leads.read` |

**Enforcement model.** Rules live in one place (`src/lib/auth/access.ts` + `src/lib/auth/permissions.ts`) and every collection, global and custom endpoint consumes them. Client-side checks exist only to hide UI; every write is re-authorized server-side.

**Verified assertions from the live RBAC suite (re-run today, PASS):**

- a `viewer` cannot read users, cannot write any collection, and cannot reach the admin collections API even though it can see the admin shell;
- a `marketing` account gets **403** on every publish endpoint but **200** on the settings it owns;
- an `editor` can edit and publish content but gets **403** on users and roles endpoints;
- an anonymous visitor gets **403** on users, pages (including `?draft=true`), services (draft reads), audit events and globals — confirmed again today by direct HTTP probes (`.audit/public-probes.txt`);
- the last super admin cannot be deleted, demoted or suspended;
- SVG upload is refused for every role except super admin.

---

## 20. ADMIN UX — REAL STATE (what an operator actually sees)

**Shell.** Payload's own admin, in **Arabic with RTL** by default, brand line "سفن لاند". Three sidebar groups:

- **المحتوى (Content):** الصفحات (Pages), الخدمات (Services), الأعمال (Projects), الرؤى (Insights), الوسائط (Media)
- **إعدادات الموقع (Site settings):** معلومات الموقع (Site identity), وسائل التواصل (Contact), ساعات العمل (Business hours), حسابات التواصل (Social accounts), القائمة العلوية (Navigation), التذييل (Footer)
- **النظام (System):** المستخدمون (Users), الأدوار (Roles), سجل التدقيق (Audit log)

**What works well today.** Login is a single screen with clear errors. The dashboard lists exactly the collections an operator needs; there are no dead menu entries. Editing a page shows the block list with drag handles and per-block Arabic labels; adding a section opens a picker of the 18 approved types with one-line explanations. Fields carry descriptions in Arabic, and a "state" panel shows Arabic/English publication state and last update. Media opens a custom library with grid/list views, search, filters, visibility badges and an upload-in-place picker. Preview opens the real page in a new tab with a banner and a "return to editing" link. Publish buttons show a loader, then a clear success/refusal message that names the field in Arabic.

**Where it is still rough (honest list):**

1. **Payload's default styling dominates.** Custom screens use the shared design tokens, but the collection forms are the framework's own layout. Coherent, but not yet the "designed product" look the owner's brief ultimately wants.
2. **No global search.** Finding a page means navigating collections. Global search is Phase K.
3. **No site-health screen.** An operator cannot see "media orphaned", "page unreachable", "sitemap dry" from inside the panel. Phase K.
4. **No leads screen** (nothing to show yet), no analytics screen, no SEO center, no redirect manager. Their sidebar entries do not exist at all — by design, so nothing looks promised and broken.
5. **Audit log is readable but plain** — a table with filters; no "show me what this person changed in the last hour" summary. Phase K.
6. **Empty states are informative but numerous.** Because media/projects/insights are legitimately empty, an operator sees several "لا يوجد بعد" panels. Each explains what to do first — but the frequency is a symptom of an unfinished content cycle, not a UI bug.
7. **Password reset cannot complete** without an email provider (§47).
8. **No bulk actions** (select multiple media → change visibility, etc.). Phase K.

**Would an operator be confused by anything untrue?** No fabricated UI exists: there is no chart with fake data, no "connected" badge without a connection, no metric that is not real. Analytics/Search Console/email each show an explicit **NOT CONNECTED / غير مهيّأ** state where they appear.

---

## 21. ADMIN ON MOBILE / RESPONSIVE (real device classes, not theory)

Evidence: `scripts/admin-responsive.mjs` run at 390 (mobile), 768 (tablet), 1024 (small laptop), 1440 (desktop), plus screenshots in the Phase D evidence folder.

| Screen class | Result |
|---|---|
| Login (390) | Usable; fields full width, button reachable, no horizontal scroll |
| Dashboard (390) | Sidebar collapses to an off-canvas drawer with a close control; content readable |
| Collections list (390) | Table becomes a card-style row list; no clipped columns |
| Edit form (390) | Single column; long Arabic labels wrap correctly; sticky save row does not cover fields |
| Media library (390) | Grid collapses to 2 columns; batch bar hidden when empty; upload button visible |
| Media picker (390) | Drawer becomes full-height; search reachable with the keyboard open |
| Audit log (390) | Table scrolls inside its own container; the page itself does not scroll sideways |
| 768 / 1024 / 1440 | No overflow, no clipped controls, spacing rules hold |

**Known gaps.** No physical iOS/Android device run (owner gate G5): the above is emulated Chrome only. RTL/LTR switching inside the admin is fine, but a native app-quality mobile pass is not part of this scope.

---

## 22. AUDIT SYSTEM — CURRENT STATE (measured today)

```
REAL_AUDIT_EVENT_COUNT = 479
```

Distribution of the largest actions (from the live database):

| Action | Count | Meaning |
|---|---|---|
| `login` | 60 | Successful sign-ins |
| `service_published` | 56 | Capability published (both locales, repeated through today's verification) |
| `page_published` | 47 | Page published per locale |
| `page_unpublished` | 37 | Page retracted for one locale |
| `service_unpublished` | 37 | Capability retracted |
| `service_updated` | 28 | Capability edited |
| `page_updated` | 27 | Page edited |
| `media_uploaded` / `media_deleted` | 26 / 26 | Upload / delete (fixtures created and cleaned) |
| `settings_updated` | 24 | Global settings changed |
| remaining | ~140 | Role/user/media-access/login-failure and other catalogued actions |

**Shape of an event:** action key, the acting user, a human-readable Arabic summary, optional detail payload (which fields/whitelisted values), timestamp. Records are **append-only**: the collection declares no update and no delete path for anyone, including Super Admin (verified in code and via the RBAC suite).

**What is audited today:** sign-in success, sign-in failure, sign-out, user created/updated/suspended/reactivated/deleted, role created/updated, permission changes, and for every content domain: created, updated, published, unpublished, restored. Media: uploaded, deleted, visibility changed, binary replaced. Settings: per-global update.

**Not audited yet (Phase K territory):** failed *permission* attempts, reads of personal data, exports, and API-key usage.

---

## 23. AUDIT SYSTEM ≠ VERSION SYSTEM (how they differ, and why both exist)

| Question | Audit log | Versions |
|---|---|---|
| What is it for? | *Who did what, when, and was it allowed* | *What the document used to say, and restoring it* |
| Stored in | `audit_events` (append-only, one row per event) | `_pages_v`, `_services_v`, `_projects_v`, `_insights_v`, `_site_settings_v`, … (one row per revision) |
| Who can change it? | Nobody. Create-only. | Restore creates a **new** revision; history is never rewritten |
| Does it contain the old content? | No — a summary + whitelisted detail, never whole documents | Yes — full document snapshots |
| Current volumes (live DB) | **479 events** | pages **129**, services **162**, site settings **20** revisions |
| Can a user lose access to it? | Read requires `audit.read` in the admin | Same permission structure as the parent collection |
| Verified today | RBAC suite (create-only, permission-gated) | A real restore was executed: revision 124 restored → public route returned **HTTP 200**; revisions 125/124/123 exist as expected |

**Practical consequence for the owner:** "who published this?" is answered by the audit log; "put it back the way it was" is answered by versions. Neither substitutes for the other.

---

## 24. DATABASE — CURRENT STATE (live inspection)

```
SERVER        = PostgreSQL 17.11
DATABASE      = seven_lands_dev (local)
PUBLIC TABLES = 210
COLUMNS       = 1,646
ENUM TYPES    = 159
INDEX SHAPES  = 695
SCHEMA AUTHORITY = src/migrations (9 files). Payload's drizzle "push" is disabled (push: false)
```

**Row counts that matter:**

| Table | Rows | Reading |
|---|---|---|
| `payload_migrations` | **9** | Ledger below; batches 1–4 |
| `users` | 6 | owner (seed) + 5 verification fixtures |
| `roles` | 5 | exactly the system roles |
| `pages` | 6 | all six system pages, ar+en published (per-locale states are the authority; the `_status` column reads `draft` because the row-level status and the per-locale publication states coexist — the site publishes on the per-locale states, which is why all six render as published) |
| `services` | 7 | all seven capabilities, published ar+en |
| `projects` | **0** | honest emptiness (no fabricated work) |
| `insights` | **0** | honest emptiness (no fabricated articles) |
| `media` | **0** | design assets ship as code, so the library is genuinely empty |
| `audit_events` | 479 | append-only event log |
| `_pages_v` / `_services_v` | 129 / 162 | version snapshots |
| `_site_settings_v` | 20 | settings history |
| `lead*` tables | **0 exist** | leads are not modelled yet (Phase H) |
| `*redirect*` tables | **0 exist** | redirect manager not built yet (Phase G) |

**Localisation shape.** Content tables carry a sibling `_locales` table per localized collection, plus per-locale publication-state columns on the parent row (e.g. `pages.locale_state_ar_state`). Globals carry their own locale tables. Arrays (nav items, footer groups, channels, hours) are separate child tables. This is standard Payload–Postgres output, and it is fully covered by the migration set below.

---

## 25. MIGRATIONS — LEDGER (real, from the database)

| # | Migration | Batch | Applied | What it created |
|---|---|---|---|---|
| 1 | `20261007_162549_phase_b_auth_users_rbac` | 1 | 2026-10-07 16:25 | `users`, `roles`, permission catalogue storage, audit skeleton |
| 2 | `20261007_173537_phase_c_globals` | 1 | 2026-10-07 17:35 | The six globals and their arrays |
| 3 | `20261007_200052_phase_d_media_library` | 1 | 2026-10-07 20:00 | Media library schema + derivatives metadata |
| 4 | `20261007_212705_phase_e_pages_blocks` | 1 | 2026-10-07 21:27 | Pages, blocks, versions |
| 5 | `20261007_212958_phase_e_block_fields_align` | 1 | 2026-10-07 21:29 | Field alignment for shared sections |
| 6 | `20261007_213556_phase_e_shared_sections` | 1 | 2026-10-07 21:35 | Shared home/about section tables |
| 7 | `20261008_102014_phase_e_about_contact_start` | 2 | 2026-10-08 10:20 | Sections for about/contact/start-a-project |
| 8 | `20261008_103522_phase_f_services_projects_insights` | 3 | 2026-10-08 10:35 | Services, Projects, Insights (+ versions, locales, arrays) |
| 9 | `20261008_103658_phase_f_service_glyph_registry` | 4 | 2026-10-08 10:36 | Glyph registry column on services |

**Reconstruction gate (today).** An **empty** database (`seven_lands_repro`) was built by running the full migration set from the repository alone with `PAYLOAD_PUSH=false`. Result: **9 migrations applied**, and the resulting schema is **identical** to the development database — 210 tables, 1,646 columns, 159 enum types, 695 index shapes. Then the repository's own seeds were run against the empty database: roles 5, pages 6, services 7 (as drafts), media/projects/insights 0. Log: `.phase-f-evidence/db-reproduction.log`.

**Conclusion:** the entire production database can be rebuilt from version control. Nothing in the live database is undocumented.

---

## 26. DATABASE SAFETY — WHAT IS AND IS NOT PROTECTED

| Rule | Enforced where | Verified |
|---|---|---|
| Schema changes only through migrations | `push: false` in the adapter config | re-proved by the empty-DB run: no push, no accidental table creation |
| No seed against a production database | The seed scripts require `ALLOW_PRODUCTION_SEED` and refuse otherwise | code + refusal paths exercised in earlier phases |
| Destructive operations audited | Deletes and replacements write audit events | audit action list |
| Media delete cannot orphan content | Usage registry blocks deletion while referenced | media suites today |
| References are never auto-nulled on delete | Documented policy; the code has no cascade that blanks references | Phase E policy + code review |
| Personal data (leads) | Not yet modelled → nothing personal is stored today | `lead*` tables = 0 |
| PII in audit payloads | Audited events carry IDs and field names, not content bodies | audit detail whitelist |

**Not protected yet (honest gaps).** (1) No hosting-level **backups** exist because there is no host — see §48; (2) no automated restore drill has been executed against a copy of a *production* database (only the local reconstruction); (3) an operator with direct SQL access is outside all of these guards — database credentials must be treated as production secrets.

---

## 27. INCIDENT REGISTRY — DISCLOSED DEFECTS AND THEIR OUTCOMES

**Resolution status note:** D1 is a real, currently-live defect found **during this audit** (previously undocumented). D2 is a known, accepted current limitation whose recorded owner-gate wording is now inaccurate. D3–D5 are defects found and fixed inside Phase E/F work and are kept here so nothing is hidden.

| ID | Severity | Summary | Impact | Root cause | Resolution | Current state |
|---|---|---|---|---|---|---|
| **D1** | High (admin/API only) | `/api/graphql` returns **HTTP 500** for every request, anonymous or authenticated | Any integration built on GraphQL is unusable. REST (`/api/…`) is **unaffected** and is what the site and admin use. No visitor-facing impact | A select field's options contain a colon (`capability:strategy_business_growth`, from the internal route registry), which is a legal admin value but an **illegal GraphQL enum name**, so building the schema fails | **Not fixed (out of audit scope).** Proven pre-existing: the same names exist in the type file at the sealed Phase E commit | **OPEN — must be fixed before anyone relies on GraphQL** |
| **D2** | High before launch | Form submissions are validated and accepted, then **dropped** unless a webhook is configured; no record is stored | A visitor submits the project brief and believes it was received. The UI *does* offer a one-tap WhatsApp handoff, and the API logs failures server-side, but there is **no queue, no database row, no email** | Leads storage is Phase H, which has not started | **Accepted for now, disclosed.** Note: `OWNER_GATES.md` G4 currently claims "the request is saved in full and appears in the panel" — that wording is **wrong today** | **OPEN — launch blocker** |
| D3 | High before launch | Honeypot was unreachable: the schema rejected a filled honeypot with 422 *before* the silent-drop branch, teaching bots the field name and making the branch dead code | Bot submissions were answered with a validation error instead of silence | Validation schema ordered before the drop branch | **Fixed in Phase E**, with a permanent test proving the silent-drop path | CLOSED |
| D4 | Medium | The page publish endpoint wrote the wrong per-locale state (English publish could disturb the Arabic state) | A publish in one language could have altered the other language's state | A locale state not carried forward on update | **Fixed in Phase F**, verified by the mixed-state gate (`ar:draft`/`en:published`) | CLOSED |
| D5 | Medium | Cover-image usage was under-reported in the media-usage registry: images referenced by the homepage hero were not tracked | Deleting such an image was not blocked with the correct explanation | Usage registry did not scan nested block fields | **Fixed** (registry extended to nested block fields and to all content collections), re-verified today | CLOSED |

**Defects accepted as noise, with proof (not bugs):** the single 38-pixel screenshot difference on the Arabic home page at 1440px is text antialiasing — a same-state recapture of the identical page produced 75 pixels of the same magnitude (channel delta ≤ 2) while 24/24 text captures were byte-identical. Documented so it is never "re-discovered".

---

## 28. CONTENT AUTHORITY MAP — WHERE EVERY PUBLIC STRING COMES FROM

| Public surface | Primary authority | Fallback | Locale rule |
|---|---|---|---|
| Home page sections | **Pages CMS** (`home`, 8 blocks, published) | The shipped block content, per locale | Arabic page ⇒ Arabic only; a missing Arabic field is a named publish blocker, never falls back to English |
| `/about`, `/contact`, `/start-a-project` | **Pages CMS** | shipped per-locale composition | same |
| `/privacy`, `/terms` | **Pages CMS** | shipped legal composition | same |
| Services hub + 7 capability pages | **Services CMS** (published, ar+en) | shipped capability copy for the **same** locale | same; a partially-translated capability serves shipped Arabic to Arabic visitors, never English |
| Navigation (header) | **Navigation global** | shipped item list | per-locale labels |
| Footer groups / legal links | **Footer global** | shipped groups | per-locale labels |
| Phone / WhatsApp | **Contact settings global** | shipped constants (identical verified number) | locale-independent |
| City / region / maps link | **Site settings global** | shipped constants | per-locale display line |
| Business hours | **Business hours global** | *(empty → the UI shows "to be confirmed")* | — |
| Social accounts | **Social accounts global** | *(empty → section omitted)* | — |
| Articles listing | **Insights collection** (0 records) | shipped honest empty state | — |
| Work listing | **Projects collection** (0 records) | shipped honest empty state | — |
| Capability names used *inside* other components (home "lands" section, problems section, work teaser) | shipped copy — explicitly allowed by the phase rules, with the cross-check below | — | — |
| **Cross-authority check (Phase F)** | The seven capability **names** are resolved from a single authority (the services adapter's label function) so the CMS and the home page cannot disagree | — | — |

**Rule that makes this auditable:** a published document for a locale *always* wins; otherwise the shipped content for that same locale is served. There is no third path, no partial merge, and no cross-language inheritance.

---

## 29. STATIC FALLBACK REGISTRY (what still lives in code, and why)

"Still static" is not the same as "not yet migrated". Some of it is deliberate; some is pending.

| File / module | What it carries | Why it is still static | Classification |
|---|---|---|---|
| `src/content/services.ts` | The seven capabilities' shipped copy + slugs | Kept **on purpose**: it is the fallback that keeps the site intact if the CMS is unreachable, and the identity source for slugs | DELIBERATE — keep |
| `src/content/work.ts` | Empty case-study array + honest empty-state copy | The data type exists so real projects have a target; nothing invented | DELIBERATE — keep |
| `src/content/insights.ts` | Empty article array + honest empty-state copy | same | DELIBERATE — keep |
| `src/content/site.ts` | Verified facts: brand names, phone/WhatsApp, city/region, maps URL, canonical origin, year | Facts must not depend on the database to be correct; the CMS mirrors them | DELIBERATE — keep |
| `src/content/home.ts` | Problems, process, principles, positioning copy for the home sections | Home sections are **CMS-driven**; this file is the fallback copy | DELIBERATE — keep |
| `src/lib/content/route-registry.ts` | The internal link keys + labels used by the admin select | Needs a stable, code-level set of destinations; links are chosen by key | DELIBERATE — keep (see D1) |
| `src/app/sitemap.ts` | The URL set, priorities, alternates | Derived from real routes; must include *system* pages regardless of content state | DELIBERATE — keep |
| `src/lib/content/fallback.ts` | The fallback resolution helper | Part of the adapter contract | DELIBERATE — keep |
| `src/lib/routes.ts` | Locale-aware route helpers | Routing contract | DELIBERATE — keep |
| `src/components/forms/ProjectBriefForm.tsx` | The form's field list and UI, land choices | Form *structure* is a component concern; only its **copy** is coming from the CMS-in-progress | PARTIAL — copy from CMS is not wired yet |
| `src/lib/blocks/schema.ts` | The block registry (18 types) | Single source of truth for the validator + renderer | DELIBERATE — keep |

**Audit conclusion:** no file here is a "forgotten TODO". Each is either an intentional fallback / a contract, or an item the phase rules explicitly deferred. The one *partial* item (form copy) is flagged in §62 D6.

---

## 30. FORMS — CURRENT STATE

One public form exists: **the project brief** (`/start-a-project`), plus its endpoint `POST /api/brief`.

| Aspect | Today |
|---|---|
| Fields | Name, phone (Saudi normalisation), optional email, optional company, capability interests, message/notes, budget/stage, preferred contact, UTM campaign capture, hidden honeypot, consent checkbox |
| Validation | One Zod schema shared by client and server |
| Submit path | Browser → `POST /api/brief` → validate → honeypot check → normalise phone → deliver |
| Captcha | **None.** Replaced intentionally by honeypot + rate limiting |
| Rate limiting | Enabled in production only: 6 requests / 10 minutes per client IP; the 7th returns **429** (proven today with distinct spoofed forwarding headers) |
| Honeypot | Fixed in Phase E: a filled honeypot now gets a **silent 200** (`delivered:false`), not a validation error. Permanent regression test |
| Success UX | Clear confirmation state, WhatsApp handoff offered |
| Failure UX | Inline field errors in Arabic/English; on delivery failure the WhatsApp handoff is emphasised |
| Spam controls verified | 14/14 checks in the forms gate (re-run today) |
| **Storage of submissions** | **NONE** (§62 D2) |
| **Notification of owners** | **NONE** unless a webhook is configured; falls back to a server-side `console.error` |
| Confirmation email to the visitor | Not implemented |
| CSV / export | No leads model yet |
| Double-submit protection | Button disabled while submitting; server-side idempotency is not implemented |
| Data retention policy | **Not defined** (nothing is stored yet; this must be decided with the leads model in Phase H) |

```
FORM_SUBMISSION_PERSISTENCE = NONE
```

---

## 31. LEADS — CURRENT STATE

```
LEADS_DB_TABLE     = does not exist (0 matching tables in the live database)
LEADS_ADMIN_PAGE   = does not exist (no sidebar entry)
LEADS_API          = does not exist
LEAD_NOTIFICATION  = requires BRIEF_WEBHOOK_URL (not configured): submissions are accepted and dropped
FIXTURE_LEADS      = 0 (nothing to fake — nothing stored)
```

**What exists:** the public form, the validated endpoint, the rate limiter, the honeypot, campaign capture, and the honest WhatsApp handoff. **What does not exist:** persistence, a review surface, statuses (new/contacted/won/lost), assignment, notes, export, CRM sync, or notifications.

**Classification:** *not implemented* (Phase H is authorized under the overnight mandate but was not executed). This is the single most consequential functional gap between "a nice website" and "a working lead pipeline" — anything a prospective client submits today survives only in the WhatsApp handoff they were offered, and that is only true because the design offers it *before* trusting the form.

---

## 32. ANALYTICS — CURRENT STATE

```
ANALYTICS_DASHBOARD     = not implemented (no screen, no route, no module)
GA4 / GTM INTEGRATION   = not implemented in code
GOOGLE SEARCH CONSOLE   = not verified; no verification token configured anywhere
FIRST-PARTY METRICS DB  = not implemented (no events table, no aggregation)
```

**What actually happens on a page view today:** nothing is collected. The public site loads no third-party scripts at all (confirmed by reading the served HTML and the CSP, which would block them anyway). That is *why* there is nothing to consent to yet (§34).

**Honest consequence:** there is **no traffic history**, and none can be reconstructed. When analytics is switched on, history begins that day. Also: the site cannot currently prove to the owner that it works in production — an argument for enabling at least server-side basics early after launch.

---

## 33. INTEGRATIONS — CURRENT STATE

| Integration | Status | Evidence |
|---|---|---|
| WhatsApp (deep links) | **Active, verified** | Links built server-side from the contact global; smoke tests assert the verified number only; 3 tests green today |
| Maps / directions link | **Active, verified** | Stored `mapsUrl`; smoke test asserts the link is the approved Maps short URL |
| Google Maps embed | **Registered block, not rendered, unpublishable** | Block registry: `mapEmbed` has no renderer, so the validator refuses it |
| Contact form → email | **Not implemented** | No provider |
| Contact form → webhook / n8n / CRM | **Supported, not configured** | `BRIEF_WEBHOOK_URL` (+ optional bearer token) read by `/api/brief`; when unset the request is accepted and logged |
| WhatsApp Business API | Not implemented | — |
| Payment / booking systems | Not implemented (not requested) | — |
| Email (transactional) | Not implemented — **external credential needed** (owner gate G4) | Payload would log to console |
| External storage/CDN | Not implemented — owner gate G2 | Local disk only |
| Analytics providers | Not implemented — owner gate G3 | Phase I |
| Pixel providers | None configured (Phase J) | — |

---

## 34. CONSENT — CURRENT STATE

```
COOKIE_CONSENT_BANNER = does not exist
CONSENT_RECORDS       = not implemented
NECESSARY_COOKIES     = only the admin session cookie (admin area), SameSite=Lax, httpOnly, Secure in production
NON-ESSENTIAL COOKIES = none — no analytics, no pixels, no third-party embeds anywhere in the public site
```

**Reasoning that will matter at launch:** the current site is, by construction, clean enough to need no banner. The moment Phase I/J add GA4 (which sets cookies) or any pixel, a consent surface becomes a **legal prerequisite**, not a nice-to-have, and must ship in the *same* release as the tag — not after. The Consent Management design is part of the Phase J mandate and was not started.

**What must never happen (future constraint):** an unreviewed production tracking script. The mandate bans it explicitly, and the current CSP (`script-src 'self' 'unsafe-inline'`) would block any third-party script until the CSP origin list is deliberately extended.

---

## 35. CUSTOM SCRIPTS — CURRENT STATE

**Not implemented, by design.** There is no script field in any global, no origin allowlist registry, no admin screen, and no way to inject third-party code into the public site. This is the safest possible state and it is deliberate: from the foundation phase, the rule is that a *Super-Admin-only, high-risk, audited, environment-scoped, CSP-aware* script capability may exist later — but only with an emergency disable and an explicit review — and never as an editor convenience.

**Verified today (public HTML):** the only scripts on a public page are Next.js's own bundles. No inline marketing snippet, no tag manager, no pixel, no chat widget.

---

## 36. SEO — CURRENT STATE (measured from served HTML today)

| Element | Status | Verified detail |
|---|---|---|
| Canonical URLs | **Complete** | Every public page prints one absolute canonical. Canonical origin = `https://sevnland.com` (the closed decision from Phase D) |
| Title tags | **Complete** | Unique per page and per locale; served titles read correctly in Arabic and English |
| Meta descriptions | **Complete** | Unique per page and locale, from the SEO contract on each CMS document |
| hreflang | **Complete** | Three alternates on every page: `ar-SA`, `en`, `x-default`; also emitted as a `Link` response header on `/ar` |
| Sitemap | **Complete** | `/sitemap.xml` = **28 URLs**, includes alternates, **excludes `/privacy` and `/terms` on purpose** (they are `noindex`) |
| Robots | **Complete** | `/robots.txt`: `Allow: /` with `Disallow: /api/`, `/admin`, `/*/preview` |
| Open Graph | **Complete (static images)** | `og:title`, `og:description`, `og:image`, `og:locale`, `twitter:card`. **The image is `https://sevnland.com/og/og-ar.png` / `og-en.png` — an external absolute URL pointing at the production domain whose availability is `NOT VERIFIED` (nothing is deployed).** A CMS override field exists (Media is empty, so nothing overrides) |
| Structured data (JSON-LD) | **Complete for what exists** | Organization + WebSite on all pages; Service + Offer + FAQPage on capability pages; BreadcrumbList where applicable. Everything is derived from real content — no ratings, no review counts, no price, no availability claims |
| Breadcrumbs | **Present** (visible + structured) | On capability and content pages |
| `robots` per page | **Complete** | `index, follow` by default; `noindex, nofollow` for legal pages and preview; the 404 route carries no misleading directives |
| Internal linking | **Complete** | Navigation and footer are CMS-driven and use route **keys**, so no link can point at a non-existent path. Capability pages cross-link through one label authority |
| URL structure | **Stable** | `/ar/…`, `/en/…`; capability slugs are immutable by design. Custom pages get validated slugs with reserved words protected |
| Trailing slash / case handling | Consistent | Single canonical form served; the proxy's 404 table is authoritative |
| 404 behaviour | **Verified** | Unknown paths return a real HTTP 404 with the 404 page, no canonical, no hreflang |
| Rich results | **Not claimable yet** | There are no articles, projects, reviews or events, so no rich-result type is asserted. **No unverified rich-result markup exists anywhere** |
| SEO Control Center | **PLANNED — NOT IMPLEMENTED** | Phase G: per-URL metadata overrides, keyword tracking, redirect manager, Search Console surface, schema management. Today, SEO fields live on each document (a deliberate, sufficient contract for a 20-page site) |
| Search Console | **OWNER-GATED** | No verification token, no sitemap submission |
| `sitemap` freshness | Verified today | 28 URLs, generated from live routes |

**Honest summary:** the *technical* SEO layer is complete and verifiable. The *measurement* layer (Search Console, analytics) does not exist, and the OG image path depends on a production deployment that has not happened.

---

## 37. REDIRECTS — CURRENT STATE

```
REDIRECT_MANAGER   = not implemented (no table, no admin screen, no middleware rules)
REDIRECT_RULES     = 0 custom rules
REDIRECT_DB_TABLE  = does not exist
301/308 HANDLING   = not applicable yet (no legacy URL set has been migrated)
```

**What exists:** the reserved-slug validator refuses to let a custom page take a path that would shadow a system route, and a *published* document's slug is deliberately immutable (a change is blocked and pointed at the future Redirect Manager). The 404 table in the proxy is authoritative for unknown paths.

**Why this is not a launch blocker today:** the site is not live, so no inbound link equity exists to preserve; and no content has moved. It becomes important the moment the site replaces an existing WordPress presence (see §61) or the first published slug ever needs to change.

---

## 38. STRUCTURED DATA (JSON-LD) — WHAT IS CLAIMED, AND WHAT IS DELIBERATELY MISSING

**Present (derived from real, recorded facts):** `Organization` (name, brand names ar/en, city/region, country SA, maps URL, contact points from the contact global), `WebSite` (with locale alternates), `Service` + `Offer` + `FAQPage` on capability pages, `BreadcrumbList` on content pages.

**Deliberately absent, and it must stay absent until real data exists:** aggregate ratings, review counts, price ranges, opening hours (the hours global is empty — publishing `openingHours` now would be an invented claim), `sameAs` social profiles (the social global is empty), `numberOfEmployees`, `foundingDate`, `awards`, `award` markup, and any `Article`/`Project` markup (no records exist).

**Verified today:** legal pages carry `noindex` and **no JSON-LD at all** — correct, since they are not public marketing surfaces.

**Rule that governs all future additions:** a structured-data block is only ever emitted from a stored, verified value. There is currently no code path that can emit a claim the owner has not entered.

---

## 39. PERFORMANCE — WHAT WAS MEASURED, AND WHAT WAS NOT

### Measured today (built output, first-party assets)

| Bundle class | Files | Bytes |
|---|---|---|
| Public site JS (shared + page chunks reachable from the public site) | 13 | **914,439** |
| Admin JS (Payload admin chunks) | 16 | 2,565,382 |
| Files in both sets (shared runtime/vendor) | 6 | 459,310 |
| Admin code reachable from the public site? | — | **NO** (`ADMIN_CODE_LEAK: NO`) |

The public payload is roughly **0.9 MB of JavaScript across 13 files** on a cold path (compressed transfer is considerably smaller; the measurement is uncompressed). For a Next.js App Router site of this shape — CMS-independent public pages, no UI kit, no state library, no analytics — that is a reasonable starting point, and the deliberate absence of third-party scripts is why the *interactive* cost is low.

### What was NOT measured

```
LIGHTHOUSE / CORE WEB VITALS PERFORMANCE SCORE = NOT VERIFIED
REAL-NETWORK LCP/INP/CLS                   = NOT VERIFIED
MOBILE THROTTLED TRANSFER                  = NOT VERIFIED
TTFB ON A REAL HOST                        = NOT VERIFIED
CDN BEHAVIOUR                              = NOT VERIFIED
```

**Why it is honest to say so:** the project has never been deployed. No host, no CDN, no DNS. Measuring Lighthouse on `localhost` would produce a number with no predictive value, and this report refuses to invent one. Everything below is what *is* structurally true today:

- Pages are server-rendered with static shells and streamed dynamic parts; `/ar` returns `x-nextjs-prerender: 1` and `x-nextjs-cache: HIT`, and cache directives are `s-maxage=60, stale-while-revalidate=3540`.
- The public site loads **no third-party JavaScript** (verified in the served HTML and enforced by the CSP).
- Fonts: the design system uses system/self-hosted faces with `font-src 'self'` — no third-party font requests.
- Images: shipped assets are pre-declared and the CMS pipeline emits derivatives rather than originals (the pipeline is built and tested; there are simply 0 uploaded assets).
- Animation: Motion with short, bounded durations and reduced-motion support; no scroll-jacking, no parallax, no cursor replacement.
- The database queries behind a page are bounded (indexed reads by slug/id through cached adapters), and Payload's own admin is isolated from the public bundle (proved by `ADMIN_CODE_LEAK: NO`).

---

## 40. ACCESSIBILITY — CURRENT STATE

```
AUTOMATED RESULT = 18 / 18 axe tests passed (WCAG 2.0 / 2.1 level A + AA + best-practice rule sets)
PAGES COVERED    = /ar, /en, /ar/services, /ar/services/web-commerce-experiences, /ar/start-a-project, /ar/contact
VIEWPORTS        = desktop + mobile projects in the Playwright configuration
FRESH RUN TODAY  = yes (`.phase-f-evidence/a11y.log`)
```

**What is verified structurally:** exactly one `<h1>` per page; document `lang` and `dir` correct in both locales; every interactive element is reachable and named; skip-link present; focus states visible; form fields have labels and programmatic error association; no colour-contrast violations under the configured rule set; the brief form's error summary is announced; the map/WhatsApp links carry accessible names; reduced-motion honoured (animation is disabled, not merely shortened).

**What is NOT verified (stated plainly):**

- **No manual screen-reader pass** (VoiceOver/TalkBack/NVDA). Automated tooling catches around a third of real-world accessibility problems.
- **No expert human audit.** axe cannot judge whether Arabic-language alt text is *meaningful*, only that it exists.
- **Keyboard-only journeys** are partially covered (menu open/dismiss, form submission) but no systematic tab-order walk-through has been recorded.
- **Zoom to 200% / text-only scaling** is untested.

**Accessibility of the admin:** Payload's admin UI is built on accessible primitives and the custom screens use native controls; the axe suite covers the **public site only**. Admin accessibility is `NOT VERIFIED` as an audited surface.

---

## 41. RESPONSIVE / RTL — CURRENT STATE

| Viewport class | Public site | Admin |
|---|---|---|
| 390 (phone) | Verified: RTL/LTR correct, no horizontal overflow on primary pages, drawer and sticky CTAs behave | Verified (dashboard, lists, forms, media library, picker) |
| 430 (large phone) | Covered by mobile project runs | covered by responsive script |
| 768 (tablet) | Verified | Verified |
| 1024 (small laptop) | Verified | Verified |
| 1280 / 1440 (desktop) | Verified, including the pixel baselines | Verified |
| 1920+ | Not separately captured | Not separately captured |

**Arabic-specific behaviour:** the entire public layout is direction-aware (logical properties, no hardcoded `left/right`), Arabic numerals and punctuation render correctly, and — critically — **Arabic and English never fall back to each other visually**: a half-translated capability page shows Arabic to Arabic readers and only reveals English on the English route.

**Not verified:** landscape phone at very short heights, foldable/ultra-wide sizes, and browser text-zoom combinations.

---

## 42. BROWSER SUPPORT — CURRENT STATE

```
AUTOMATED BROWSER MATRIX = Chromium only (Playwright: Desktop Chrome for ar/en desktop; Pixel 7 for mobile)
FIREFOX                  = NOT VERIFIED
SAFARI / WebKit          = NOT VERIFIED
EDGE                     = NOT VERIFIED (Chromium engine, but untested)
REAL IOS / ANDROID       = NOT VERIFIED — needs physical devices (owner gate G5)
```

**Engineering posture that reduces the risk:** the public site is server-rendered HTML with a small amount of progressive enhancement, no bleeding-edge CSS in critical layout, no scroll hijacking, no WebGL/canvas, and Motion used for bounded transitions with a reduced-motion escape. The realistic risk areas on Safari are the usual suspects — `backdrop-filter` on the header if used, `aspect-ratio` on older iOS, and sticky-positioning edge cases inside RTL containers. None of these can be *declared* safe today; they are simply low-probability and cheap to fix once seen.

**Conclusion:** the honest statement is "designed for evergreen browsers, verified in Chromium, unverified elsewhere". Physical-device verification is an owner gate precisely because it cannot be done here.

---

## 43. SECURITY — IMPLEMENTED VS PLANNED (with the holes named)

### Implemented and verified today

| Control | Verified observation |
|---|---|
| Content-Security-Policy | `default-src 'self'`; `base-uri 'self'`; `object-src 'none'`; `img-src 'self' data: blob:`; `font-src 'self'`; `style-src 'self' 'unsafe-inline'`; `script-src 'self' 'unsafe-inline'`; `connect-src 'self'`; `form-action 'self'` |
| HSTS | `max-age=63072000; includeSubDomains; preload` (production only) |
| Other headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`, `X-DNS-Prefetch-Control: on` |
| Framing policy | **Deliberately not set in the app** (documented in `next.config.ts`) so that staging/preview embedding works; it must be set at the hosting layer once the production domain is fixed — currently `NOT VERIFIED` at any layer because there is no host |
| Auth security | Server-side sessions, 2-hour tokens, 5-attempt lockout with 10-minute lock, audited logins and failures, immediate revocation by suspension |
| Cookie flags | `SameSite=Lax`, `httpOnly`, `Secure` in production (named TLS-less sandbox escape hatch that must never be set in production) |
| Authorization | RBAC enforced server-side on every collection, global and custom endpoint; admin UI restrictions are cosmetic only |
| Media privacy | Private originals **403** anonymously (re-verified today); SVG upload restricted to Super Admin; visibility changes individually permissioned |
| Upload pipeline | MIME sniffing via `sharp`, size caps, derivatives, EXIF handling |
| Rate limiting | `/api/brief`: 6 requests / 10 min / IP in production, 7th → **429** (proved today) |
| Spam | Honeypot with a silent-drop path (fixed and regression-tested) |
| Input validation | One Zod schema per write path; rich text is structured (lexical), never raw HTML |
| GraphQL endpoints | The playground route is **404** (disabled); the GraphQL API route is currently **500 due to a defect (D1)**, which incidentally means it exposes nothing |
| Secrets | Only `.env` (git-ignored). No secret in source; env vars are referenced by name in code |
| Dependencies | See §44 |

### Holes and gaps, stated plainly

1. **No framing protection anywhere yet** (no `X-Frame-Options`, no `frame-ancestors`). This is a deliberate, documented deferral — but it must be closed at the hosting layer before launch, or the site can be clickjacked.
2. **CSP uses `'unsafe-inline'` for scripts and styles.** Next.js streams inline bootstrap scripts, so a nonce/hash migration is real work, not a config toggle. Present risk is low *because* there are no third-party scripts — but it also means the CSP is not the strong control it looks like. Mitigation path: nonce-based CSP as part of Phase M hardening.
3. **No rate limiting on authentication endpoints** beyond Payload's per-account lockout; there is no IP-level throttle on `/api/users/login`.
4. **No CSRF token beyond `SameSite=Lax` + Payload's origin checks** (`csrf` configured for the server URL + trusted origins).
5. **GraphQL is down (D1)** — no exposure, but also no working API for integrations.
6. **No security review / penetration test.** Nothing external has ever probed this application. What is described here is *configuration and code review*, not a professional assessment.
7. **No WAF, no DDoS protection, no bot management** (hosting-layer concerns, none exists yet).
8. **No secrets rotation procedure** and no key-management story (no host yet).
9. **No audit of read access to personal data** — nothing personal is stored yet (leads do not exist), which is precisely why it must be designed *with* Phase H rather than retrofitted.
10. **`ALLOW_VERIFICATION_WRITES`, `PAYLOAD_ALLOW_INSECURE_COOKIES`, `ALLOW_PRODUCTION_SEED`** are three dangerous escape hatches that exist for local verification. Each must be **absent or `false`** in any real deployment. Documented here so that it is impossible to claim they were overlooked.

---

## 44. DEPENDENCY AUDIT — CURRENT STATE

```
npm audit (no --force, no fixes applied):
  critical = 0
  high     = 9
  moderate = 5
  TOTAL    = 14 advisories
```

| Advisory chain | Where it lives | Ships to visitors? | Real exposure | Decision |
|---|---|---|---|---|
| `esbuild` dev-server issue (`<=0.24.2`) | Build/dev tooling (also reached through `tsx`, used by scripts) | No | Only a malicious page opened in a local dev session could exploit the dev server | **Accepted for now** — dev-only; replaced when the toolchain updates. Never expose a dev server publicly |
| `drizzle-kit` / `@esbuild-kit/*` | Migration generation tooling (dev) | No | Local developer machine only | Accepted; revisit at Phase M |
| `sass` → `chokidar` → `braces`, `micromatch`, `fast-glob` | File-glob internals of dev tooling (Sass, Tailwind/PostCSS ecosystem) | No | ReDoS/glob patterns on developer input | Accepted; no user input reaches these |
| `@next/eslint-plugin-next` | Lint tooling | No | Dev-only | Accepted |
| `graphql` transitive advisories (if any land here) | Server runtime library | Yes (in principle) | The GraphQL route is currently **down**, so no exposure path exists today | Re-evaluate **with** the D1 fix |

**Judgement.** None of the 14 advisories is in a browser-shipped or public-facing runtime path. Applying `npm audit fix --force` would break Payload/Next peer ranges, which is precisely why the mandate forbids it. The written triage lives at `docs/admin-control-center/security/DEPENDENCY_ADVISORY_TRIAGE.md`. **Required follow-up:** re-run the audit at Phase M (hardening) and after the D1 fix, and record any *runtime* advisory as a release blocker.

---

## 45. ENVIRONMENT VARIABLES — NAMES ONLY (never values)

Referenced in code (by name, from `.audit/inventory.txt`; `.env` itself is git-ignored):

| Variable | Purpose | Required in production |
|---|---|---|
| `DATABASE_URI` | PostgreSQL connection string | **Yes** |
| `PAYLOAD_SECRET` | Payload encryption/session secret | **Yes — must be a long random value** |
| `PAYLOAD_TRUSTED_ORIGINS` | Additional allowed origins for admin auth/CSRF | Yes (staging/preview hostnames) |
| `RUNTIME_ORIGIN` | The origin the server binds/talks to | Yes |
| `SITE_CANONICAL_URL` | Canonical origin used in metadata, sitemap, JSON-LD, OG URLs | **Yes — `https://sevnland.com`** |
| `SEED_SUPER_ADMIN_EMAIL` / `_NAME` / `_PASSWORD` | First-run owner account seeding | Yes at first deploy, then removed |
| `MEDIA_DIR` | Media storage root (defaults to `./media`) | Yes if media lives outside the app directory |
| `ALLOW_PRODUCTION_SEED` | Guard that must be explicitly set to seed a production database | Must stay **unset/false** |
| `ALLOW_VERIFICATION_WRITES` | Guard for write-permitted verification suites (dev DB only) | Must stay **unset** |
| `PAYLOAD_ALLOW_INSECURE_COOKIES` | TLS-less sandbox escape hatch | Must stay **unset** |
| `BRIEF_WEBHOOK_URL` / `BRIEF_WEBHOOK_TOKEN` | Optional lead delivery destination | Not required today; becomes the interim delivery path until Phase H |
| `FORCE_SERVICE_SEED` / `FORCE_PAGE_SEED` | Idempotent seed re-run switches | Not required |
| `NEXT_PUBLIC_SERVER_URL` | Public origin for client-side helpers | Yes |
| `QA_BASE`, `ADMIN_BASE`, `MEDIA_TEST_BASE`, `CACHE_TEST_BASE`, `BASE` | Test harness base URLs | No (test-only) |
| `ADMIN_SHOT_DIR` | Screenshot output folder for the responsive script | No (test-only) |

**No secret values appear in this report, in any log in `.audit/`, or in the repository.**

---

## 46. STORAGE — CURRENT STATE

```
PROVIDER          = local disk
PATH              = ./media (MEDIA_DIR override available)
CURRENT CONTENT   = 0 files (the folder exists and is empty; `.gitkeep` style behaviour)
PUBLIC DELIVERY   = served through the app's own media route
PRIVATE DELIVERY  = gated route, 403 anonymously (verified)
CDN               = none
BACKUP            = none exists at the storage layer (§48)
PRODUCTION DECISION = OWNER GATE G2 (provider + region + custom domain + private-link TTL)
```

**What is already built so a provider swap is a driver change, not a rewrite:** the media collection owns storage policy (`staticDir`/`MEDIA_DIR`), the policy module (`src/lib/media/policy.ts`) owns visibility rules, the usage registry owns reference integrity, and no component ever builds a media URL by hand — everything goes through the adapter. Uploading to object storage later means adding the storage adapter, not touching content code.

**Honest risk today:** because nothing is uploaded, nothing is at risk. The risk appears the moment the panel is used in production before G2 is decided — uploads would land on local disk, which is typically ephemeral on modern hosting platforms. **Recommendation: decide G2 before the first production upload.**

---

## 47. EMAIL — CURRENT STATE

```
PROVIDER          = none configured
SENDING           = not implemented (Payload would log to console if asked)
RECEIVING         = not implemented (no inbound mail handling — not needed)
TEMPLATES         = none
LEAD NOTIFICATION = via optional webhook only (not configured)
PASSWORD RESET    = would be invoked but cannot deliver
STATUS            = BLOCKED — EXTERNAL CREDENTIAL (owner gate G4)
```

**Why this matters more than it looks:** the admin's "forgot password" flow is part of the product. In production without a provider, an owner who forgets their password has **no recovery path** — the only remedy would be a database-level reset by a technical operator. That is a hard launch blocker for an operationally usable system, and it is the cheapest of the five blockers to close (any transactional email provider + one set of credentials).

---

## 48. BACKUP / RESTORE — WHAT IS TRUE TODAY

```
DOCUMENTED            = yes (in the deployment notes: how the database and media folder should be backed up)
TESTED (prod-like)    = NO — no hosting environment exists to test against
MANUAL LOCAL RESTORE  = yes: the empty-database reconstruction (9 migrations + seeds) ran today and reproduced
                        the schema exactly (210 tables / 1,646 columns / 159 enums / 695 index shapes)
POINT-IN-TIME RECOVERY = not configured (no host)
MEDIA BACKUP          = nothing to back up yet (0 assets); no tooling written
RETENTION POLICY      = not defined
```

**Honest assessment:** the project can rebuild its **database schema and seed content** from version control alone — that is proven today. What has **not** been proven is a restore of a *production* database with real content in it, because there is no production database. The backup procedure must be designed *with* the hosting choice (owner gate G5) and tested once, end-to-end, before launch. Until then, "we have backups" would be a false claim.

---

## 49. QA — FRESH VS HISTORICAL (what was re-executed today versus merely reported earlier)

Historical reports are kept as history and are **not** the basis of any claim in this document. Everything marked "fresh" below was executed in this session against the current working tree and the running production build.

### Fresh today (executed, with output on disk)

| Suite | Result | Log |
|---|---|---|
| Full project build (production) | **Success** (~26–46 s warm) | `.phase-f-evidence/build.log` |
| Phase A harness | PASS | `.phase-f-evidence/regression-e.log` |
| Phase B auth/RBAC | PASS | `.phase-f-evidence/regression-bcd.log` |
| Phase C globals | PASS | `.phase-f-evidence/regression-bcd.log` |
| Phase D media library | PASS | `.phase-f-evidence/regression-bcd.log` |
| Media binary gate | PASS (private 403 anonymous) | `.phase-f-evidence/regression-media.log` |
| Media publish gate | 400 + asset stays private + cleanup 200 | `.phase-f-evidence/regression-media.log` |
| Phase E pages/blocks | **64 passed / 0 failed** (see note) | `.phase-f-evidence/regression-e.log` |
| Phase E text equivalence | PASS (terms byte-equal 1281/1281 and 1516/1516) | `.phase-f-evidence/regression-e.log` |
| Custom page create → publish → cleanup | ALL GREEN (route correctly 404s after cleanup) | `.phase-f-evidence/regression-e.log` |
| Version restore | revision 124 restored → HTTP **200**; revisions 125/124/123 present | `.phase-f-evidence/regression-e.log` |
| Locale safety | 0 failures | `.phase-f-evidence/regression-e.log` |
| Services CMS gate (Phase F) | **48 passed / 0 failed** | `.phase-f-evidence/verify-services-cms.mjs` |
| Services visual equivalence | 15/16 pixel-identical (1 known AA-noise case) | `.phase-f-evidence/visual/visual-equivalence.log` |
| Services text equivalence | **24/24 byte-identical** | `.phase-f-evidence/text/` |
| Forms gate | ALL GREEN (7th request → 429) | `.phase-f-evidence` forms re-run |
| Playwright smoke | **55 passed / 5 skipped** | re-run today |
| axe accessibility | **18 / 18 passed** | `.phase-f-evidence/a11y.log` |
| Lint | 0 errors, 1 warning (pre-existing, `ProjectBriefForm`) | `.phase-f-evidence/regression-e.log` |
| Typecheck | clean (`npx --no-install tsc`) | `.phase-f-evidence/regression-e.log` |
| Empty-DB reconstruction | 9 migrations; schema identical | `.phase-f-evidence/db-reproduction.log` |
| QA capture (public, 26 screenshots) | exit 0 | `qa/screenshots/`, `qa/findings.json` |
| Pixel regression vs accepted baselines | **25/26 zero-diff**; 1 known-noise (38 px) | `.audit/pixel-regression.txt` |
| Public HTTP probe (24 routes) | all 200/404 as expected, SEO fields present | `.audit/public-probes.txt` |
| Protected-surface probe (anonymous) | 403 on all protected endpoints | `.audit/public-probes.txt` |
| Preview probe (authenticated) | 200 + noindex + no-store; 404 anonymous | `.audit/probe-auth.txt` |
| Dependency audit | 14 advisories (0 critical) | `.audit/security-performance.txt` |
| Bundle measurement | public 914 kB / admin 2.57 MB / no admin leak | `.audit/security-performance.txt` |

**Note on the Phase E count.** Today's run reports **64 passed / 0 failed**. The sealed Phase E report claimed 68/0. The source has not changed since the seal commit, and the static count of assertions in the file is 64, so the most likely explanation is that some checks are loop-expanded at runtime and the two numbers count different things. Nothing is failing either way. The report treats **64/0 as current** and marks **68/0 as `PREVIOUSLY REPORTED — NOT REVERIFIED`**.

**Note on the QR/scan of 26 screenshots:** `qa/findings.json` contains exactly two entries, both for the intentional 404 probe route (`/ar/this-page-does-not-exist`): one console 404 each. There are **no overflow, contrast, or layout findings** in the fresh capture.

### Historical (previously reported, deliberately NOT re-run today)

| Item | Why it was not re-run | Standing |
|---|---|---|
| Physical iOS/Android device testing | Requires devices | `NOT VERIFIED` |
| Firefox / WebKit runs | Chromium-only configuration today | `NOT VERIFIED` |
| Real-host performance / Lighthouse | Requires a host | `NOT VERIFIED` |
| Production email delivery | Requires credentials | `NOT VERIFIED` |
| Object-storage transfer test | Owner gate G2 | `PREVIOUSLY REPORTED — NOT REVERIFIED` |

### Test suites that DO NOT exist yet (and what that means)

`tests/` contains exactly two files — `smoke.spec.ts` (304 lines, navigation/conversion/mobile surface) and `a11y.spec.ts` (30 lines, axe over six routes). There are **no unit tests** for the adapters, validators, permission logic or media policy, and **no component tests**. Coverage today is behavioural end-to-end plus the phase harnesses (which are TypeScript scripts, not a test framework). **This is a real debt** (§64) — the phase harnesses are thorough but they are not a maintained regression suite that a future developer inherits.

### Test counts summary

```
PLAYWRIGHT (smoke)              = 55 passed, 5 skipped
AXE (a11y)                      = 18 passed
PHASE E HARNESS                 = 64 passed, 0 failed   [68/0 PREVIOUSLY REPORTED — NOT REVERIFIED]
SERVICES CMS GATE               = 48 passed, 0 failed
FORMS GATE                      = all green (14 checks, incl. explicit 429)
UNIT TESTS                      = 0 (none exist)
CI PIPELINE                     = none (no .github directory)
```

---

## 50. VISUAL REGRESSION — CURRENT STATE

```
BASELINE SET      = qa/final/ (26 captures, accepted before the Phase E content migration)
FRESH CAPTURE     = qa/screenshots/ (26 captures, this audit)
PIXEL DIFF RESULT = 25 / 26 captures ZERO differing pixels
                   1 capture  = home-ar-1440, 38 pixels, max channel delta 2 (antialiasing)
SCREEN CLASSES    = ar/en × {home, services hub, capability detail, work, insights, about,
                    contact, start-a-project, privacy, terms, 404} × {390, 1440}
CONTENT EQUIVALENCE = 24/24 text captures byte-identical (services migration)
```

**Interpretation.** The site's appearance has not moved since the accepted baseline. The single 38-pixel delta is the same known case diagnosed earlier: a same-state recapture of the *identical page* produced 75 pixels of the same magnitude (channel delta ≤ 2), which proves it is the browser's text rasterisation, not a code change. It was accepted with an addendum rather than papered over.

**Process status:** the pixel-diff tooling (`scripts/pixel-diff.mjs`, plus the three diagnostics under `.phase-f-evidence/`) works and is reusable, but **it is not part of an automated gate** — it runs when a human/agent invokes it. Wiring visual regression into CI is part of Phase M/N.

---

## 51. ADMIN UX — CANDOUR SUMMARY FOR A NEW OPERATOR

The full walkthrough is §20; this is the part a handover would need.

**In week one an operator can do, unsupervised:** sign in; edit any of the six pages section-by-section; edit the seven capabilities; upload and describe media; preview drafts; publish/unpublish per language; restore version 124 if something goes wrong; read the audit log; change nav/footer/contact details.

**In week one an operator will *ask for*:** a way to search across content (not built — Phase K); a way to see all media usage in one screen (usage exists per-asset, not as a site map — Phase K); a way to see what changed since yesterday (audit log shows events, not a diff view — Phase K); a "site health" check; bulk actions; and a proper mobile experience for quick edits (works, but is a shrunk desktop).

**Three rough edges worth naming honestly:** (1) empty states outnumber content today, so the panel looks emptier than it is; (2) Payload's default form styling dominates the look — consistent, but not yet bespoke; (3) an operator cannot recover their own password in production without an email provider (G4).

**What would genuinely confuse someone:** nothing, if §20's list is read first. There is no screen that shows a capability the system cannot deliver — no "Analytics" menu that opens a blank chart, no "Connected" badge without a connection.

---

## 52. SITE HEALTH — CURRENT STATE

```
DASHBOARD/DIAGNOSTICS SCREEN = not built (no route, no module, no scheduled job)
UPTIME MONITORING            = none (no host)
ERROR TRACKING (Sentry etc.) = not integrated
LOG AGGREGATION              = none (server logs are files on the running machine)
```

**What the operator can discover today, and how:** publish failures are explained inline at publish time; media references are enforced at delete time; audit events show recent activity; `/api/…` failures surface in server logs. That is *reactive* observability, not a health dashboard.

**Planned (Phase K):** reachability checks per public route, sitemap sanity, orphan-media report, empty-required-field report, cache-tag sanity, and a single "status" screen inside the admin.

---

## 53. SCHEDULED CONTENT — CURRENT STATE

```
SCHEDULER            = none (no cron, no queue worker, no jobs table in use)
SCHEDULED PUBLISHING = not implemented
```

**What exists today:** article documents carry a `publishedAt`; publishing a document whose `publishedAt` is in the future is **refused** with an explanation, so no one can be surprised by a half-scheduled state. Pages and services have no scheduling fields at all.

**Consequence:** an editor cannot queue "publish Tuesday 08:00". They must be present. For a five-person business this is a convenience gap, not a blocker; it becomes a real gap when the blog starts running on a calendar.

---

## 54. DESIGN SYSTEM — CURRENT STATE

**Codified in code, verified visually.** Tokens rain through Tailwind's theme layer plus a small set of shared primitives; the pixel baselines are the de-facto visual specification.

| Element | State |
|---|---|
| Colour system | Deep ink base with a single restrained accent (`#7A9CC6`) used sparingly; no purple gradients anywhere (banned) |
| Radii | 10–12 px for controls, 16–20 px for surfaces, as specified |
| Typography scale | Arabic-first pairing with correct line-height for Arabic script; self-hosted, no third-party requests |
| Spacing | Consistent scale; sections share vertical rhythm; no arbitrary one-off spacing in shipped sections |
| Motion | UI 160–260 ms, reveals 350–650 ms, all reduced-motion aware; no scroll hijacking, no forced smooth scroll, no custom cursor, no heavy parallax |
| Icons | Phosphor only (one icon family, no mixing) |
| Logo | Shipped assets only, never re-drawn/glowed/mirrored; dark-on-transparent 500×500 variant available |
| Banned patterns | No bento-everywhere, no identical icon-card rows, no pill badges, no glassmorphism/neumorphism, no all-rounded sections, no giant 3D object, no fake counters, no stock-office photography — none of these appear in shipped pages |
| Documentation | **Partial.** Tokens and rules exist in code and were enforced through build and visual verification, but there is no living style-guide page or Storybook |

**Gap named honestly:** a designer joining today would read the CSS and the pixel baselines, not a design-system document. Writing that document is a Phase L/M task.

---

## 55. FILE TREE — WHAT THE PROJECT ACTUALLY CONTAINS

```
seven-lands-website/
├── src/
│   ├── app/                      routes: [locale]/(public pages), (payload)/(admin+api), robots.ts, sitemap.ts
│   ├── collections/              Users, Roles, Media, Pages, Services, Projects, Insights, AuditEvents
│   ├── globals/                  SiteSettings, ContactSettings, BusinessHours, SocialAccounts, Navigation, Footer
│   ├── components/               layout / sections / blocks / forms / admin (custom screens) / ui primitives
│   ├── content/                  shipped fallback copy: site, home, services, work, insights
│   ├── features/                 feature-scoped logic (e.g. brief form schema)
│   ├── lib/                      auth (access, permissions, audit), content (adapter, cache tags, route registry),
│   │                             pages/, services/, projects/, insights/, media/, blocks/, schema.ts, seo
│   ├── migrations/               9 migration files + index (schema authority)
│   ├── messages/                 ar.json / en.json (UI strings)
│   └── scripts/                  seeds: super admin, pages, services (idempotent, guarded)
├── public/                       brand assets, og images, favicons (shipped, not CMS media)
├── media/                        local media storage (currently empty)
├── tests/                        smoke.spec.ts, a11y.spec.ts (Playwright)
├── scripts/                      qa-capture.mjs, pixel-diff.mjs, admin-responsive.mjs, cache-freshness.mjs, measure-nav-cost.mjs
├── qa/                           final/ baselines, screenshots/ fresh, findings.json, playwright-report.json, review/
├── docs/                         admin-control-center/ (00–20 + INDEX + README + spike + security triage),
│                                 phase-a…e reports, overnight/ (gates + log), PENDING-OWNER-INPUTS.md, RELEASE-CANDIDATE.md
├── .phase-*-evidence/            per-phase verification logs and harnesses (a…f)
├── .audit/                       this audit's raw evidence (report-only)
├── AGENTS.md, README.md, eslint.config.mjs, next.config.ts, playwright.config.ts, package.json, tsconfig.json
```

---

## 56. HARDCODED-CONTENT CLASSIFICATION (what is in code, and whether that is a problem)

| Hardcoded item | Where | Why it is right | Risk if left |
|---|---|---|---|
| Brand name defaults | `src/content/site.ts` | The brand must remain correct even if the database is unreachable; the CMS mirrors it and wins when filled | none (mirror verified identical today) |
| Canonical origin | config (`SITE_CANONICAL_URL`, fallback in code) | A canonical URL is infrastructure, not content | none |
| Phone / WhatsApp / Maps URL | `src/content/site.ts` + contact global | Verified facts, server-derived links, tests assert the number | none (edit in one place later) |
| Street address, email | **absent** in both places | Never invented | Owner input required (G1) |
| Business hours, social accounts | Empty by design (DB empty ⇒ UI shows "to be confirmed" / omits) | No invented claims | Owner input required (G1) |
| Capability copy (7 lands) | `src/content/services.ts` as the fallback; CMS is authoritative | Fallback is a safety net, proven byte-identical to the CMS version | none; the upcoming Phase F seal documents this |
| Projects / insights content | Empty arrays + honest empty-state copy | Nothing to say yet | Owner input (real work/articles) |
| Home page copy | `src/content/home.ts` as the fallback for CMS blocks | Same fallback doctrine | none |
| Legal text | Placeholder notice on the CMS pages | Cannot invent legal wording | **Owner/legal review required** before removing `noindex` |
| UI strings (buttons, labels, errors) | `src/messages/{ar,en}.json` | Correct place for interface language | none |
| SEO titles/descriptions (default) | Per-document CMS fields; code defaults as fallback | Consistent with the same doctrine | none |
| Icons, illustrations, patterns | code components / shipped assets | Design assets, not content | none |
| Route labels for the admin link picker | `src/lib/content/route-registry.ts` | Must be a closed, code-level set | the colon in one key's value breaks GraphQL (**D1**) |
| Analytics IDs | **not present anywhere** | Nothing to hardcode yet | Phase I |
| Feature flags | None exist; behaviour is code + permissions | Simplicity | none |

**Verdict:** everything hardcoded is either a *verified fact*, a *fallback mirror of content*, or a *contract* (routing, permissions, registry). Nothing that should be editorial is trapped in code, and nothing that should be code is hidden in the CMS. The only defects emerging from this classification are D1 (registry value shape) and D6 (form copy not yet read from the CMS).

---

## 57. DOCUMENTATION STATUS

| Document | Status today |
|---|---|
| `README.md` | Current; explains structure, commands, philosophy |
| `AGENTS.md` | Current; contains the operating rules adopted from the owner's mandate |
| `docs/admin-control-center/00–20 + INDEX + README` | Extensive foundation and phase-A design set; **dated by later phases** in places (they describe the target design; the build has since implemented it) |
| `docs/admin-control-center/PHASE_A_SPIKE_REPORT.md` | Historical; its compatibility conclusions were borne out (Next 16 + Payload 3.90 verified in production build today) |
| `docs/admin-control-center/security/DEPENDENCY_ADVISORY_TRIAGE.md` | Current; matches today's `npm audit` (14 advisories, 0 critical) |
| `docs/phase-a…d/` reports | Historical, accurate for their time |
| `docs/admin-control-center/phase-e/PHASE_E_REPORT.md` | Accurate; **modified in the working tree after the seal commit** (uncommitted edit) |
| `docs/admin-control-center/phase-f/` | **Empty — the Phase F report was not written** (the audit interrupted the phase) |
| `docs/admin-control-center/overnight/OVERNIGHT_EXECUTION_LOG.md` | Covers Phase E seal; **does not cover Phase F** |
| `docs/admin-control-center/overnight/OWNER_GATES.md` | Accurate except **G4's wording claims submissions are stored — false today** (D2) |
| `docs/PENDING-OWNER-INPUTS.md` | Current and accurate (owner-data table §14) |
| `docs/RELEASE-CANDIDATE.md` | Accurate as of **2026-10-07**; predates Phase F |
| **This document** | State of Record as of 2026-10-08 |

**Documentation debt:** three documents need a one-line truthfulness edit (G4 wording, overnight log Phase F entry, Release-Candidate date note), and Phase F needs its report before it can be sealed. None of these is engineering work; all are part of sealing Phase F.

---

## 58. PHASE TABLE A–N (the overnight program, as actually executed)

| Phase | Scope | Status | Evidence | Notes |
|---|---|---|---|---|
| **Base** | Public website | COMPLETE & approved | phase reports A–D, tests | Design frozen; visual baselines accepted |
| **A** | Foundation / spike | CLOSED & approved | Phase A report | Next 16 + Payload 3.90 validated in practice |
| **B** | Auth, users, roles, audit | CLOSED & approved | Phase B suite **PASS today** | 6 users, 5 roles, 479 events |
| **C** | Global settings | CLOSED & approved | Phase C suite **PASS today** | 6 globals live |
| **D** | Media library | CLOSED & approved | Phase D suite **PASS today**; media binary gate PASS | 0 assets by design; production storage = G2 |
| **E** | Pages CMS + blocks migration (about/contact/start + home earlier) | **SEALED** (commit `bc3040a`) | Phase E report; 12/12 text, 0 px visual, form gate 14/14 | One accepted 3-px delta in privacy-ar-1440 (later re-measured as 0) |
| **F** | Domain content: Services + Projects + Insights + DB reconstruction | **IMPLEMENTED & VERIFIED — NOT SEALED, NOT COMMITTED** | services gate 48/0; text equivalence 24/24; 15/16 pixel-identical; empty-DB reconstruction identical (210 tables) | Report not written; work lives in the working tree |
| **G** | SEO Control Center + Redirect Manager | **NOT STARTED** | — | Today: per-page SEO fields only; no redirect table |
| **H** | Leads & Forms v2 | **NOT STARTED** | — | Today: submissions are accepted and dropped (D2) |
| **I** | Analytics & Executive Dashboard | **NOT STARTED** | — | Today: no collection, no screen (G3) |
| **J** | Integrations & Consent | **NOT STARTED** | — | Today: no pixels, no consent surface |
| **K** | Admin Ops (search, bulk, health, scheduling) | **NOT STARTED** | — | Today: none of these exist |
| **L** | Authority Convergence (remove static fallbacks where safe) | **NOT STARTED** | — | Today: fallbacks are deliberately retained |
| **M** | Full Hardening (CSP nonces, dependency sweep, security review) | **NOT STARTED** | — | Today: framework-wide advisories accepted and triaged (§44) |
| **N** | Release Candidate (`docs/release/`) | **NOT STARTED** | — | Today: no release pack, no deploy pipeline, no rollback runbook |

**Honest summary of the overnight mandate:** it authorized F→N behind per-phase gates. The session produced **Phase F only**, and even that is unsealed; G–N never began. Everything in this report about G–N is *scope*, not progress.

---

## 59. OVERNIGHT EXECUTION SUMMARY (as executed)

```
OVERNIGHT_STATUS = PARTIAL
PHASE F  = IMPLEMENTED + VERIFIED, UNSEALED (no report, no commit)
PHASE G  = NOT STARTED
PHASE H  = NOT STARTED
PHASE I  = NOT STARTED
PHASE J  = NOT STARTED
PHASE K  = NOT STARTED
PHASE L  = NOT STARTED
PHASE M  = NOT STARTED
PHASE N  = NOT STARTED
PRODUCTION_MUTATED = NO
OWNER GATES OPEN = G1 (business data) · G2 (storage) · G3 (analytics) · G4 (email) · G5 (backups + devices + launch permission)
RECOMMENDED_NEXT_OWNER_ACTION = approve sealing Phase F (write its report + checkpoint commit),
                                then choose the next phase to execute (list in §72)
```

The mandate's end-of-session report format was **not produced** because the owner's audit request superseded it mid-run. This document covers the state that the overnight report would have described, with the same evidence standard.

---

## 60. WORKING-TREE INVENTORY AT AUDIT TIME (what exists on disk but is unsealed)

Everything in this section is **complete work that is not committed** (Phase F), plus the audit's own artifacts. It is safe on disk but outside version control.

| Item | Size/shape | Belongs to |
|---|---|---|
| `src/collections/{Services,Projects,Insights}.ts` + `src/lib/{services,projects,insights}/**` + `src/scripts/seed-services.ts` | New domain content system | Phase F |
| `src/migrations/20261008_1035…`,`…1036…` + `src/migrations/index.ts` | 2 new migrations (**already applied to the live dev DB**, batch 3–4) | Phase F |
| Public pages + sections rewire (`page.tsx`, services routes, work/not-found, `LandsSystem`, `ServicesIndex`, `Problems`, `WorkTeaser`, `PageBlocks`, `schema.ts`) | Content-authority convergence (CMS → fallback) | Phase F |
| `src/lib/media/usage.ts`, `src/lib/content/tags.ts`, `src/lib/auth/audit.ts`, `AuditEvents.ts`, `payload.config.ts`, `payload-types.ts` | Supporting contracts (usage registry, cache tags, 12 new audit actions, generated types) | Phase F |
| `.phase-f-evidence/**` (harnesses, logs, text captures, visual captures + diagnostics) | Verification evidence | Phase F (untracked) |
| `docs/admin-control-center/overnight/**` | Owner gates + overnight log | Untracked |
| `docs/admin-control-center/phase-e/{PHASE_E_REPORT,PLAN}.md` | Edits made at seal time | Phase E (uncommitted edit) |
| `.phase-d-evidence/verify-phase-d-samples.json` | Fixture sample file rewritten by the suite run | Incidental |
| `.audit/**` | This audit's evidence | Audit (report-only) |
| `eslint.config.mjs` | Evidence-folder lint ignores | Audit (disclosed §0) |

**Implication:** a new machine cloning the repository today would get the *Phase E* system, not the system described in §§10–12. Sealing Phase F (report + commit) is therefore the single highest-value housekeeping action available.

---

## 61. EXISTING PRODUCTION PRESENCE — `sevnland.com` (measured read-only today)

The domain currently serves the **old WordPress site**, which has never been touched by this build:

```
GET https://sevnland.com/          → 200
  x-powered-by  = PHP/8.3.33
  server        = LiteSpeed · platform: hostinger · panel: hpanel
  link          = <https://sevnland.com/wp-json/> (WordPress REST)
  x-litespeed-cache = hit
  HTML          = WordPress block theme, dir="rtl" lang="ar", <title>sevnland.com</title>
GET https://sevnland.com/og/og-ar.png → 404
GET https://sevnland.com/og/og-en.png → 404
```

**What this means:**
1. **No deployment has occurred** and none is at risk; the live site is untouched (`PRODUCTION_MUTATED = NO`, verified from the outside).
2. The live WordPress site looks like a **placeholder install** (page title is the bare domain; standard block theme) — so there is little content value at stake, but that is the owner's call, not ours.
3. **The OG image URLs used by the new site currently 404 on the live domain.** The files exist in the repository (`public/og/og-ar.png` 45,612 B; `public/og/og-en.png` 42,844 B), so a normal deployment of the new site to that origin fixes this automatically — but until then, any social share of `sevnland.com` shows a broken/absent preview image. **This replaces the earlier "NOT VERIFIED" with a measured fact.**
4. Swapping the live site later is a **DNS/hosting cutover decision** (owner gate territory: production mutation). The current host (Hostinger/LiteSpeed) can run Node apps, but the hosting plan's Node support, the reverse-proxy/Nginx configuration, TLS, and whether the platform permits the app's runtime requirements are all `NOT VERIFIED` — a hosting compatibility check must precede any cutover.
5. **The mandatory pre-cutover step** (from the earlier phase rules): do not deploy over the live site without an explicit owner go-ahead, do not change DNS or email DNS, and do not remove the WordPress installation until the replacement is confirmed working on the real domain.

---

## 62. DEFECT REGISTRY BY SEVERITY (consolidated)

Cross-reference: §27 holds the same IDs with root causes and fix history. This table adds severity, blocking status and reachability.

| ID | Title | Severity | Status | Blocks launch? | Reachable by a visitor? |
|---|---|---|---|---|---|
| **D1** | `/api/graphql` returns 500 (illegal enum name from a colon in select options) | **High** (API) | **OPEN** — pre-existing at `bc3040a`; fix deferred, out of audit scope | No (nothing uses GraphQL; the site and admin use REST) | No — visitors never touch it. **But the playground is not exposed (404), so nothing leaks.** Any future integration must not assume GraphQL works |
| **D2** | Form submissions accepted then dropped; G4 doc wording wrong | **High** (business) | **OPEN** — Phase H territory | **Yes** — a lost enquiry is a lost client | Yes — a visitor can submit and receive a success while nothing is retained. Mitigated only by the visible WhatsApp handoff |
| **D3** | Honeypot branch was unreachable (bots got a 422 validation error) | High (spam) | **FIXED** in Phase E, regression-tested | No | Previously yes; closed |
| **D4** | Per-locale publish state could be disturbed by the other language's publish | Medium | **FIXED** in Phase F, verified | No | No |
| **D5** | Media usage under-reported for homepage-hero covers (delete not blocked) | Medium | **FIXED**, re-verified today | No | No |
| **D6** | Brief-form copy is not yet read from the CMS (component-owned strings) | Low | **OPEN** — deliberate deferral | No | Not a defect for visitors; it is a gap in editorial control |
| **D7** | OG image URLs 404 on the live domain (files exist only in the repo) | Medium (until deploy) | **OPEN — auto-resolves on deployment** if `public/og` is served at the same origin | Only if the new site is deployed without its static assets | Only via social-share crawlers today |
| **D8** | The 404 page carries no `title`, canonical or robots meta | Low (cosmetic SEO) | **OPEN** | No | Yes, but harmless: a 404 must not be indexed, and it returns a correct HTTP 404 |
| **D9** | Privacy/terms are `noindex` and excluded from the sitemap | Informational — **by design** | Intended | No | Yes — they are linked from the footer and reachable |
| **D10** | Five test-credential accounts exist in the **development** database | Medium if ever copied to production | **OPEN item** — a policy control, not a code bug | No, provided production starts from migrations + the guarded seed (which it did during reconstruction: 1 user) | No |
| **D11** | `pages._status = draft` while both locales are published | Informational — per-locale states are the authority, and today's probes prove the pages serve as published | Intended behaviour | No | No — this is exactly what makes per-locale publishing possible |
| **D12** | Phase E check count discrepancy (fresh 64/0 vs sealed 68/0) | Low (reporting) | **OPEN** — most likely loop-expanded checks; nothing failing | No | No |

**Reading the registry honestly:** the two defects that matter to the business are **D2 (dropped submissions)** and, for any future integration work, **D1 (GraphQL)**. Everything else is either fixed, cosmetic, or intended behaviour that merely needed to be stated.

---

## 63. READINESS SPLIT (ready for what, exactly)

| Destination | Ready? | What it means |
|---|---|---|
| **Local development** | ✅ **READY** | Full build, full test battery green today, reproducible database |
| **Staging (private, password-protected)** | ✅ **READY WITH TWO TASKS** (≈1–2 hours of work) | Needs: environment variables set for the staging host (including `PAYLOAD_TRUSTED_ORIGINS`), and one real smoke test on that host. No blockers found in this audit for staging |
| **Controlled client demo (staging, invited viewers)** | ⚠️ **READY WITH CAVEATS** | Demo can show everything except: lead capture persistence (explain the WhatsApp handoff), analytics, and legal pages (still marked placeholder). Visual/behavioural quality is demo-grade |
| **Public launch (sevnland.com)** | ❌ **NOT READY** | Five blockers (§66). Two are engineering work not yet done; three are owner decisions/provisioning |
| **Paid-traffic landing (ads → site)** | ❌ **NOT READY** | Requires launch readiness **plus** analytics + consent + pixel configuration (Phases I/J) — otherwise spend cannot be measured or attributed |
| **Content team working daily** | ⚠️ **PARTIALLY** | Pages/services editing, media, preview, per-locale publish are all real. Blocked from: saving enquiries, scheduling, searching content, seeing any traffic |
| **Executive reporting** | ❌ **NOT READY** | No analytics, no dashboard, no data source |

---

## 64. TECHNICAL DEBT (an explicit register)

| # | Debt | Why it matters | Where it is paid off |
|---|---|---|---|
| 1 | **Phase F is uncommitted** | The newest system (services CMS) exists only on this machine's working tree | Sealing Phase F (report + commit) — immediate |
| 2 | **No automated test suite for unit-level logic** (adapters, validators, permissions, media policy) | The phase harnesses are scripts; a future developer inherits no unit safety net | Phase M/N |
| 3 | **Tests are Chromium-only; no CI** | Regressions in Safari/Firefox, or in any direction, are invisible until a human looks | Phase M + owner device testing |
| 4 | **CSP relies on `'unsafe-inline'`; no nonce pipeline** | Weakens a header that looks strong | Phase M hardening |
| 5 | **No framing protection anywhere** (`X-Frame-Options`/`frame-ancestors` deliberately deferred to hosting) | Clickjacking risk once public | Hosting config at staging; must precede launch |
| 6 | **Phase harnesses are not maintained as a test framework** | Verification is reproducible today but will rot | Phase M: migrate the valuable harnesses into Playwright/unit tests |
| 7 | **No visual-regression gate in automation** | The pixel tooling is manual | Phase M/N |
| 8 | **Docs drift after each phase** (three documents need edits, see §57) | An operator reading older docs could believe a false state | Sealing each phase properly, starting with F |
| 9 | **Payload default admin styling dominates custom screens** | Design coherence will matter for the owner's product feel | Phase K/L |
| 10 | **No scheduled-content capability** | A content calendar is impossible | Phase K |
| 11 | **Error tracking / log aggregation absent** | Production incidents will be invisible until someone complains | Phase M/N |
| 12 | **14 dependency advisories accepted (dev/build chains)** | Must be re-evaluated, never silently ignored | Phase M |
| 13 | **The "colon in select option" value shape (D1)** | It breaks GraphQL at schema-build time; any future enum-shaped use of route keys will hit the same wall | Fix together with G-phase registry work |
| 14 | **No formal design-system documentation** | Onboarding and consistency debt | Phase L/M |

---

## 65. RISK REGISTER (the things that could actually go wrong)

| Risk | Likelihood | Impact | Current exposure | Mitigation / control |
|---|---|---|---|---|
| A visitor submits the form during launch week and the enquiry is lost | **High** (D2) | Lost client; reputational | **Present today** | Do not launch publicly until leads are stored; the WhatsApp handoff is the interim safety net; a webhook can be configured today as a stopgap |
| The site is deployed to a host that cannot run the stack | Medium | Failed launch attempt | Low (nothing deployed) | §67 pre-staging checklist: verify Node + Postgres + build on staging first |
| Production database is built incorrectly (from a dev dump rather than migrations) | Medium if rushed | Test accounts/verification data in production | Low today (no production DB) | Always: migrations + guarded seed. The reconstruction gate proved this works; make it the only method |
| Media uploaded in production lands on ephemeral disk and vanishes | Medium (G2 undecided) | Lost client imagery | None today (0 assets) | Decide G2 before the first production upload |
| Legal pages go live without review | Medium | Compliance exposure | Currently `noindex` and marked placeholder | Keep `noindex` until the owner/legal signs off; remove the notice only then |
| SEO regression during the launch cutover (two sites, one domain) | Medium | Lost indexability confusion | None today | Clean cutover plan (Phase N) + Search Console verification before/after |
| A crashed admin session cannot be recovered (no email provider) | Medium (G4) | Owner locked out; recovery requires DB intervention | Present from first production day | Configure a transactional email provider (cheapest blocker to close) |
| Someone uses GraphQL in an integration without knowing D1 | Medium | Integration failure | Present | D1 is documented here and in §62; fix it before any GraphQL use |
| Ad spend starts before analytics/consent exist | Medium | Unmeasurable spend; consent exposure | Not yet possible (nobody is advertising to it) | Sequence: I + J before any paid traffic |
| A dependency advisory becomes a real runtime exploit | Low | Varies | Accepted and triaged | Re-run audit at M; treat runtime-path advisories as release blockers |
| Single-person knowledge (bus factor) | **High** | Continuity | Present | This document + phase reports + evidence folders are the transfer mechanism; keep them current |

---

## 66. LAUNCH BLOCKERS (five — anything else is a gap, not a blocker)

| # | Blocker | Type | Owner action needed? | Effort to close |
|---|---|---|---|---|
| **1** | **Lead submissions are dropped** — no storage, no notification (D2) | Engineering (Phase H) + optionally a webhook today | No (stopgap webhook is owner infra, or wait for H) | Phase H is the real fix; a webhook is a 10-minute stopgap |
| **2** | **No backups exist on any hosting environment** (§48) | Infrastructure | **Yes — G5** (choose host; enable backup policy) | Configure at hosting; test one restore |
| **3** | **No production media storage decision** (§46) | Owner decision + implementation | **Yes — G2** | Decide provider; implement driver; rebuild nothing else |
| **4** | **Legal pages need owner/legal review** before they lose `noindex` | Legal | **Yes — G1/legal** | Owner review; wording update; remove notice |
| **5** | **No email provider → no password recovery, no notifications** (§47) | External credential | **Yes — G4** | Provide provider credentials; configure adapter |

**Not blockers (important distinction):** absent analytics, absent SEO Center, absent redirect manager, missing business hours/social accounts, empty portfolio and articles, missing pixels, admin search/bulk/health, design-system documentation. These are gaps that degrade value; none of them prevents a safe, honest launch of the current site if the owner accepts the honest empty states (which the site presents well).

---

## 67. PRE-STAGING CHECKLIST (what to do before the first non-local deployment)

**Repository**

- [ ] Seal Phase F: write `docs/admin-control-center/phase-f/PHASE_F_REPORT.md`, commit the working tree, and tag the checkpoint.
- [ ] Confirm `.env` is absent from the artifact and no secret is in source control.
- [ ] Confirm the three escape hatches are unset: `ALLOW_VERIFICATION_WRITES`, `ALLOW_PRODUCTION_SEED`, `PAYLOAD_ALLOW_INSECURE_COOKIES`.

**Environment**

- [ ] Provision PostgreSQL (managed) and record its version — must support the migration set (PostgreSQL 17 proven; 15+ expected to work, **verify on staging**).
- [ ] Set: `DATABASE_URI`, `PAYLOAD_SECRET` (long random, unique per environment), `RUNTIME_ORIGIN`, `SITE_CANONICAL_URL` (staging URL for staging), `PAYLOAD_TRUSTED_ORIGINS` (the staging host), `MEDIA_DIR` (persistent volume), seed variables for the first run only.
- [ ] Decide media storage **before** first upload (G2) or accept local-disk-only on staging deliberately.

**Deployment mechanics**

- [ ] Verify the host's Node runtime (20.x proven) and that the build runs on the host or in CI, not just locally.
- [ ] Run migrations explicitly as a deploy step (`npx payload migrate`) — never rely on schema push (it is disabled).
- [ ] Run the guarded seed once to create the owner account, then unset the seed variables.
- [ ] Serve through HTTPS only; ensure the platform sets cookies securely (`PAYLOAD_ALLOW_INSECURE_COOKIES` stays unset).

**Hosting-layer controls (must be set at the platform, not in the app)**

- [ ] Framing policy: `Content-Security-Policy: frame-ancestors 'none'` (or an allowlist incl. the preview host) **or** `X-Frame-Options: SAMEORIGIN`.
- [ ] Confirm the app's own headers survive the platform's proxy (CSP/HSTS/Referrer-Policy/Permissions-Policy/nosniff).
- [ ] Rate-limit `/api/*` at the edge as a second layer (the app's own limiter is in-memory and per-instance).

**Verification on staging (the same probes this audit ran, re-run there)**

- [ ] Run `.audit/probe-public.mjs` against the staging origin (all routes 200, SEO fields, security headers).
- [ ] Run the smoke + a11y suites against staging, then the QA capture.
- [ ] Confirm `/robots.txt` and `/sitemap.xml` on staging are acceptable (a staging site should usually be `noindex` at the platform level).
- [ ] Confirm the admin is reachable, the owner account works, and a password reset is possible *if* email is configured.
- [ ] Confirm private media returns 403 anonymously **on staging** (hosting proxies can break binary responses).

---

## 68. DEPLOYMENT — CURRENT STATE

```
DEPLOYED               = NO
STAGING_URL            = none
PRODUCTION_URL         = none (sevnland.com still serves the untouched WordPress site — §61)
HOSTING PLATFORM       = undecided (candidate observed: the current Hostinger/LiteSpeed account — Node
                         capability, reverse proxy rules and Postgres availability NOT VERIFIED)
DEPLOY PIPELINE        = none (no CI, no Dockerfile, no platform config)
RELEASE PACK           = none (`docs/release/` not created — Phase N)
ENVIRONMENTS           = local only
```

**What deployment will require (scope, not progress):** a Node-capable host with a persistent, publicly-reachable origin; a managed PostgreSQL database; persistent media storage or a decision to use local disk for a while; environment variables per §45; migration + seed as deploy steps; HTTPS with correct cookie flags; the hosting-layer framing/rate-limit controls; and a cutover plan for the domain that also covers WordPress retirement (an owner-gated production mutation).

---

## 69. ROLLBACK STRATEGY — WHAT WOULD BE POSSIBLE TODAY

| Layer | Rollback mechanism available today | Tested? |
|---|---|---|
| Application code | Git checkout of the last checkpoint (`bc3040a`) | Yes — the repository is one commit deep and the working tree is described in §60, so a rollback would be `git stash`-free and surgical |
| Database schema | Migrations are forward-only files; a rollback means **restoring a database backup** (the migration set has no `down` contract in use) | **No** — no production backup exists; on local, the empty-DB reconstruction is the proven path |
| Content changes | Payload versions + restore per document (pages/services/projects/insights/settings) — **verified today** (restore → HTTP 200) | Yes |
| Published content state | Unpublish per locale (returns the shipped fallback for that locale) — **verified** | Yes |
| Media | Binary replacement is versioned by upload; deletion is blocked while referenced; no "undelete" for removed files beyond backups (none exist) | Partially |
| DNS / hosting cutover | Not applicable yet; no change has been made | n/a |

**The honest gap:** *if* the site were public tomorrow and a bad content change shipped, recovery is solid (versions + unpublish). But *if* the database were lost, there is **no tested production restore**. That is blocker #2, and no amount of application-level cleverness replaces it.

---

## 70. PRIORITIZATION — P0 / P1 / P2 (what to do, in what order, and why)

### P0 — before any public launch

1. **Leads:** store every submission and notify the owner (Phase H), or wire the webhook stopgap immediately.
2. **Backups + restore drill** on the chosen host (G5).
3. **Media storage decision** implemented before uploads are allowed (G2).
4. **Email provider** for password recovery and notifications (G4).
5. **Legal pages reviewed**, placeholder notice removed, `noindex` lifted (owner/legal).
6. **Hosting-layer security:** framing policy + edge rate limits (pre-staging checklist).
7. **Seal Phase F** (report + commit) — no new capability, just truth on disk.

### P1 — first weeks after launch

8. Analytics + Search Console (Phase I) with the consent surface shipped in the *same* release (Phase J).
9. Site health + admin search + audit filtering (Phase K).
10. SEO Center + Redirect Manager (Phase G) — especially before any URL ever changes.
11. Real content: portfolio entries and first articles (owner data + CMS already ready).
12. Dependency sweep and CSP nonce work (Phase M).
13. Migrate phase harnesses into the maintained test suite.

### P2 — later / as-needed

14. Consent management refinement once a policy exists.
15. Design-system documentation and admin visual polish.
16. Custom scripts capability (only with the Super-Admin/high-risk doctrine).
17. Scheduled publishing, bulk operations, exports.

---

## 71. WHAT NOT TO DO (boundaries that must survive handover)

These are not style preferences; they are the rules that keep the project honest and safe.

1. **Do not deploy over the live site, change DNS, or touch email DNS** without explicit owner approval (the live WordPress site is untouched and must stay that way until a deliberate cutover).
2. **Do not introduce unverified business facts** — no invented clients, projects, testimonials, metrics, prices, years, awards, counts or hours. The empty states are the correct output of missing data.
3. **Do not weaken the media privacy model** — private stays private; never flip visibility automatically; never publish a page that references a private asset.
4. **Do not bypass the migration-only schema rule** (`push: false`). Schema changes go through generated migrations.
5. **Do not convert the block system into a free-form builder** — no raw HTML, no arbitrary CSS/spacing/animation controls, no nesting, no unrendered block types published.
6. **Do not add third-party scripts without the consent + CSP work** — and never a production tracking script that has not been reviewed.
7. **Do not touch the shipped design through a content change** — content migrations must be visually identical (the pixel baselines are the proof).
8. **Do not seed a production database by copying a development dump** (test credentials live there — D10).
9. **Do not delete content documents casually** — prefer unpublish; deletion has no undelete without backups.
10. **Do not run `npm audit fix --force`** — it breaks Payload/Next peer ranges for advisories that live in build tooling.
11. **Do not measure Lighthouse on `localhost` and call it performance.** Measure on a host or say "not verified".
12. **Do not let a document drift into describing a state that no longer exists** — update or date it (the debts in §57 are exactly this failure, small).

---

## 72. MINIMAL OWNER DECISIONS (the smallest set that unblocks everything)

| # | Decision | Why only the owner can make it | Format needed | Unblocks |
|---|---|---|---|---|
| 1 | **Official business contact data**: email, full address, hours, social profiles | Facts, not judgment | A list of values (Arabic + English) | Contact completeness, local SEO, footer/social, hours UI |
| 2 | **Production storage**: provider (e.g. R2/S3-compatible), region, custom domain, private-link lifetime | Paid resource + vendor choice | Provider + region + domain + TTL preference | Media in production; G2 |
| 3 | **Analytics**: GA4 measurement ID + Search Console access | External account credentials | ID + verified property access | Phase I/J; measured traffic |
| 4 | **Email provider** for the system's own messages (password reset, lead notifications) | External account + credentials | Provider + API key (delivered securely) | Blocker #5; G4 |
| 5 | **Launch permission + hosting**: which host, when to cut over, whether to keep WordPress as-is until then | Production mutation + commercial risk | Host name + go-ahead | Blocker #2; staging plan (§67) |
| 6 | *(Optional but valuable)* Legal review of privacy/terms | Legal responsibility | Reviewed text | Blocker #4 (can also be "keep noindex and launch without legal pages") |

**Nothing else is waiting on the owner.** Every remaining engineering item (Phases G–N, M) is decidable and executable without any of these answers — which is exactly why the safest default for each has already been applied: empty values, explicit "not configured" states, local storage, and no invented facts.

---

## 73. EVIDENCE INDEX (where every claim in this report comes from)

| Claim area | Raw evidence |
|---|---|
| Git/branch/HEAD/working tree | `.audit/git.txt` |
| Node/npm/package versions | `.audit/stack.txt` |
| Database shape, ledger, counts | `.audit/database.txt`, `.audit/db-content.txt` |
| CMS content (globals, collections, identity) | `.audit/cms-content.txt`, `.audit/cms-content-identity.txt` |
| Public routes, SEO fields, headers, robots, sitemap | `.audit/public-probes.txt` |
| Preview behaviour (anonymous vs authenticated) | `.audit/probe-auth.txt`, `.audit/probe-preview.txt` |
| GraphQL defect (D1) root cause | `.phase-f-evidence/server.log` + `curl` output recorded in session; select options at `src/lib/content/route-registry.ts` |
| Live domain / WordPress / OG 404 | `.audit/live-domain.txt` |
| Dependencies + bundle sizes | `.audit/security-performance.txt` |
| Env var names, docs tree, tests, scripts | `.audit/inventory.txt`, `.audit/app-structure.txt`, `.audit/config.txt`, `.audit/tests-admin.txt` |
| Content-authority and static-fallback classification | `.audit/content-authority.txt`, `.audit/content-modules.txt` |
| Fresh regression battery (all suites) | `.phase-f-evidence/regression-{e,bcd,media,tests,e-gates}.log`, `.phase-f-evidence/a11y.log` |
| Services CMS gate + equivalence | `.phase-f-evidence/verify-services-cms.mjs` output, `.phase-f-evidence/visual/visual-equivalence.log`, `.phase-f-evidence/text/**` |
| DB reconstruction gate | `.phase-f-evidence/db-reproduction.log` |
| Visual regression vs accepted baselines | `.audit/pixel-regression.txt`, `qa/final/**`, `qa/screenshots/**` |
| QA findings | `qa/findings.json`, `qa/playwright-report.json`, `.audit/qa-capture.log` |
| Owner gates (business inputs, storage, analytics, email, launch) | `docs/admin-control-center/overnight/OWNER_GATES.md`, `docs/PENDING-OWNER-INPUTS.md` |

---

## 74. OPEN VERIFICATION BACKLOG (what could not be proven here, and how to close it)

| Item | Why it is open | How to close |
|---|---|---|
| Performance / Core Web Vitals | No host | Measure on staging with Lighthouse + field data after launch |
| Firefox / WebKit behaviour | Not configured | Add Playwright projects |
| Real iOS/Android behaviour | No devices | Owner device pass (G5) |
| Production email delivery | No credentials | Configure provider and send one real message |
| Object-storage behaviour | No provider chosen (G2) | Provider + one upload/download/privacy test |
| A 68-check Phase E reading | Count discrepancy (D12) | Reconcile the harness count in Phase M |
| Restore from a *production* backup | No production backup | G5 drill |
| Admin accessibility | Not audited | Add admin routes to the axe suite |
| Screen-reader journeys | No manual pass | A recorded manual audit |
| Legal wording | Owner/legal | Review + text |

---

## 75. DOCUMENT CONTROL

- **Scope:** whole project, as of 2026-10-08.
- **Truth rule:** any future document that contradicts this one must state which is newer; where code and a report disagree, current verified code/runtime wins **and the discrepancy is named**.
- **Update triggers:** every sealed phase, every deployment, every decision from §72 being answered, and after any defect fix (move the ID, don't delete the line).
- **What this document deliberately does not contain:** estimates of effort or price, invented metrics, or a promise about dates.

---

## 76. الملخص التنفيذي للمالك (ARABIC BUSINESS SUMMARY)

### ماذا أصبح لدينا؟

موقع سفن لاند الجديد **مكتمل تقنيًا**: عشرون صفحة حقيقية بالعربية والإنجليزية — الواجهة الرئيسية، صفحة الخدمات وسبع صفحات قدرات، الأعمال، الرؤى، من نحن، تواصل، ابدأ مشروعك، والشروط والخصوصية — بتصميم ثابت ومُتحقَّق منه بالبكسل، وبنية عربية أولًا (RTL) مع إنجليزية كاملة، وواجهة متوافقة مع الجوال، وتحسين محركات بحث كامل (روابط قانونية، خرائط موقع، بيانات منظّمة، صور مشاركة).

وخلف الموقع **لوحة تحكم عربية** حقيقية: تسجيل دخول آمن، أدوار وصلاحيات (خمسة أدوار)، سجل تدقيق لا يمكن تعديله، إدارة وسائط، وإدارة كاملة للصفحات والخدمات: تحرير، معاينة قبل النشر، نشر وإلغاء نشر للعربية والإنجليزية كلٌّ على حدة، ونسخ سابقة قابلة للاسترجاع.

والأهم: **الموقع لا يقول أي شيء غير صحيح**. لا عملاء وهميين، ولا مشاريع مُختلقة، ولا شهادات، ولا أرقام، ولا ساعات عمل مخترعة. كل ما لا يوجد بعد يظهر بحالة صادقة ومهنية.

كما أُثبت اليوم أن **قاعدة البيانات كاملة قابلة لإعادة البناء من الكود وحده** (تسع هجرات أنتجت نفس البنية تمامًا: 210 جداول)، وهذا يعني قابلية إعادة الإنتاج والنقل بأمان.

### ماذا يستطيع الموظف عمله الآن؟

- الدخول للوحة بمستخدم حقيقي، وإدارة المستخدمين والأدوار.
- تعديل الصفحة الرئيسية و«من نحن» و«تواصل» و«ابدأ مشروعك» والشروط والخصوصية **قسمًا قسمًا** (ترتيب، إخفاء، تعطيل) دون أي مبرمج.
- تحرير السبع قدرات (الاستراتيجية، الهوية، المحتوى، التواصل الاجتماعي، الأداء، الويب والتجارة، التقنية والأتمتة) بالعربية والإنجليزية.
- رفع الصور وكتابة وصف بديل بالعربية والإنجليزية لكل صورة (لا يُنسخ تلقائيًا بين اللغتين).
- معاينة أي تعديل قبل نشره على شكل الصفحة الحقيقي.
- النشر أو الإلغاء لكل لغة على حدة، مع رسائل عربية واضحة تسمّي الحقل الناقص عند الرفض.
- استرجاع نسخة سابقة لأي صفحة أو خدمة عند الخطأ.
- تعديل بيانات التواصل، القائمة العلوية، والتذييل، وقراءة سجل التدقيق.
- كل ذلك من الجوال أيضًا (بشكل مصغّر لكنه يعمل).

### ما الذي لا يزال ناقصًا؟

1. **حفظ طلبات العملاء**: النموذج يعمل ويتحقق من البيانات، لكن الطلب **لا يُحفظ ولا يُرسل إشعار** إلا إذا رُبط بنظام خارجي — هذا أهم نقص وظيفي.
2. **التحليلات والتقارير**: لا يوجد ربط بـ GA4 أو Search Console، ولا لوحة أرقام. لا سجل زيارات إطلاقًا حتى الآن.
3. **الموافقات والتتبّع**: لا عداد زيارات ولا بكسلات ولا نافذة موافقة (لأنه لا يوجد تتبّع أصلًا).
4. **مركز SEO وإدارة التحويلات**: موجود لاحقًا في الخطة، وغيابه لا يضرّ اليوم لأن الموقع لم يُنشر بعد.
5. **الصيانة والأدوات الإدارية**: البحث الشامل، العمليات الجماعية، النشر المجدول، وفحص صحة الموقع.
6. **المحتوى الحقيقي**: لا مشاريع ولا مقالات ولا شهادات — لأنها لم تُزوَّد بعد، والموقع يعرض حالة «لا يوجد بعد» بصدق.
7. **بيانات الأعمال**: البريد الرسمي، العنوان التفصيلي، ساعات العمل، وحسابات التواصل — لم تُزوَّد بعد.
8. **النسخ الاحتياطي والاستعادة على الاستضافة**: موثّق ومُختبر محليًا فقط.
9. **لا توجد بيئة تجريبية (Staging) ولا نشر**: الموقع القديم على sevnland.com ما زال كما هو دون أي مساس.

### ما الذي يمنع الإطلاق؟ (خمسة أمور فقط)

1. **طلبات العملاء لا تُحفظ** — أخطر نقص تجاري.
2. **لا نسخ احتياطي على أي بيئة استضافة** (لم تُحدَّد الاستضافة بعد).
3. **لا قرار لتخزين الوسائط في الإنتاج** (التخزين الحالي قرص محلي فقط).
4. **الصفحتان القانونيتان (الخصوصية والشروط)** تحتاجان مراجعة المالك/المستشار قبل إزالة تعطيل الفهرسة.
5. **لا مزوّد بريد** → لا يمكن للمالك استعادة كلمة المرور في الإنتاج ولا وصول إشعارات.

كل ما عدا هذه الخمسة **تحسينات** لا تمنع إطلاقًا آمنًا وصادقًا.

### ما الذي يحتاج مني كمالك؟

1. بيانات التواصل الرسمية (بريد، عنوان تفصيلي، ساعات عمل، حسابات تواصل).
2. قرار تخزين الوسائط (المزوّد والمنطقة والدومين ومدّة روابط المعاينة الخاصة).
3. معرّف GA4 وصلاحية Search Console.
4. مزوّد بريد واعتماداته (لاستعادة كلمة المرور والإشعارات).
5. موافقة الإطلاق واختيار الاستضافة وتوقيت التحويل عن الموقع القديم.
6. (اختياري) مراجعة قانونية لنصّي الخصوصية والشروط.

**لا يوجد أي بند هندسي متوقف على هذه القرارات** — كل مسار عملي آخر يمكن تنفيذه فورًا.

### ما الخطوة التالية؟

**الخطوة الأولى المقترحة (لا تحتاج منك أي قرار):** إغلاق المرحلة F المنجزة — تقريرها + حفظها في النسخة المحفوظة (Commit) — لتثبت على القرص وليس فقط في مساحة العمل.

**ثم (بأي ترتيب تختار):** المرحلة H (طلبات العملاء) لأنها الأهم تجاريًا، أو المرحلة I (التحليلات) إن كانت الأولوية قياس الأداء، أو تجهيز بيئة تجريبية (Staging) لرؤية الموقع على رابط حقيقي.

هذا التقرير هو **الصورة الكاملة الحالية للمشروع**. لن يبدأ أي تنفيذ جديد قبل توجيهك.

---

## 77. PROJECT_STATE_OF_RECORD

```
PROJECT_STATE_OF_RECORD
GENERATED_AT            = 2026-10-08 (Asia/Riyadh)
SCOPE                   = Entire project: public website, admin control center, CMS, content systems,
                          database, security, SEO, media, forms, leads, analytics, integrations, QA,
                          performance, accessibility, deployment readiness, owner gates, remaining work.
DOCUMENT                = docs/PROJECT_FULL_STATUS_2026-10-08.md

REPOSITORY
  BRANCH                = master
  HEAD                  = bc3040a7815fd24928d03d6a7c3d2624b659797d  (Phase E sealed)
  COMMITS               = 1
  WORKING_TREE          = 25 modified tracked files (+885 / −134) + 14 untracked paths (Phase F + audit evidence)
  COMMITTED_DURING_AUDIT = NO

SYSTEM
  STACK                 = Next.js 16.4.0 · React 19.3.0 · Payload 3.90.2 · PostgreSQL 17.11 · Tailwind 4.3.3 ·
                          next-intl 4.14.9 · TypeScript 5.9.3 · Node 20.20.2
  APP                   = one deployable Next.js app: public site + Payload admin + REST API
  DATABASE              = 210 tables · 1,646 columns · 159 enums · 9 migrations (batches 1–4)
  DB_REPRODUCTION       = PROVEN (empty DB + migrations = identical schema)

PHASES
  A_FOUNDATION          = CLOSED / APPROVED
  B_AUTH_RBAC_AUDIT     = CLOSED / APPROVED (suite PASS today)
  C_GLOBAL_SETTINGS     = CLOSED / APPROVED (suite PASS today)
  D_MEDIA_LIBRARY       = CLOSED / APPROVED (suites PASS today)
  E_PAGES_CMS           = SEALED (commit bc3040a; 12/12 text · 0 px visual · form gate 14/14)
  F_DOMAIN_CONTENT      = IMPLEMENTED + VERIFIED — NOT SEALED, NOT COMMITTED
                          (services 7 published ar+en · projects 0 · insights 0 · 48/0 gate ·
                           24/24 text equivalence · 15/16 pixel-identical, 1 AA-noise)
  G_SEO_REDIRECTS       = NOT STARTED
  H_LEADS_FORMS         = NOT STARTED
  I_ANALYTICS           = NOT STARTED
  J_INTEGRATIONS_CONSENT= NOT STARTED
  K_ADMIN_OPS           = NOT STARTED
  L_AUTHORITY_CONVERGENCE = NOT STARTED
  M_HARDENING           = NOT STARTED
  N_RELEASE_CANDIDATE   = NOT STARTED

CONTENT_AUTHORITY
  PAGES                 = CMS (6 system pages, ar+en published; per-locale states are the authority)
  SERVICES              = CMS (7 published ar+en) with shipped byte-identical fallback
  PROJECTS              = 0 real / 0 fixtures (honest empty state)
  INSIGHTS              = 0 real / 0 fixtures (honest empty state)
  MEDIA                 = 0 real / 0 fixtures (local disk; production storage = owner gate G2)
  GLOBALS               = 6 live; contact channels verified; hours + social intentionally empty
  STATIC_FALLBACKS      = retained deliberately (classified in §29/§56)

VERIFICATION (fresh, this session)
  BUILD                 = SUCCESS
  PHASE_E_HARNESS       = 64 passed / 0 failed   [68/0 PREVIOUSLY REPORTED — NOT REVERIFIED]
  SERVICES_CMS_GATE     = 48 passed / 0 failed
  FORMS_GATE            = ALL GREEN (7th request → 429)
  PLAYWRIGHT_SMOKE      = 55 passed / 5 skipped
  AXE_ACCESSIBILITY     = 18 / 18
  VISUAL_REGRESSION     = 25/26 zero-diff (1 = 38 px AA noise, proven)
  PUBLIC_PROBES         = all routes 200/404 as expected; SEO fields present; headers verified
  PROTECTED_PROBES      = 403 anonymous on all protected endpoints; preview gate verified
  DB_RECONSTRUCTION     = PASS (identical schema)
  LINT / TYPECHECK      = 0 errors / clean
  CI_PIPELINE           = none

DEFECTS (current, by severity)
  D1_GRAPHQL_500        = OPEN — High (API only) — pre-existing at bc3040a — REST unaffected
  D2_SUBMISSIONS_DROPPED= OPEN — High (business) — launch blocker — Phase H territory
  D3_HONEYPOT_DEAD_BRANCH = FIXED (Phase E, regression-tested)
  D4_LOCALE_STATE_WRITE = FIXED (Phase F, verified)
  D5_MEDIA_USAGE_UNDERCOUNT = FIXED (verified today)
  D6_FORM_COPY_NOT_FROM_CMS = OPEN — Low — deliberate deferral
  D7_OG_IMAGE_404_ON_LIVE_DOMAIN = OPEN — Medium until deployment (files exist in repo)
  D8_404_META_ABSENT     = OPEN — Low (cosmetic SEO)
  D9_LEGAL_NOINDEX       = INTENDED (until owner/legal review)
  D10_TEST_CREDENTIALS_IN_DEV_DB = POLICY CONTROL (production must start from migrations + guarded seed)
  D11_PAGES_STATUS_DRAFT_FLAG = INTENDED (per-locale states authoritative)
  D12_PHASE_E_COUNT_DISCREPANCY = OPEN — Low (reporting only)

OWNER_GATES_OPEN        = G1 business data · G2 production storage · G3 analytics credentials ·
                          G4 email provider · G5 backups + device testing + launch permission
OWNER_ACTION_REQUIRED_NOW = NO

DEPLOYMENT
  DEPLOYED              = NO
  STAGING_YET            = NO
  LIVE_DOMAIN            = sevnland.com currently serves the untouched WordPress site (verified read-only)
  DNS_CHANGED            = NO
  PRODUCTION_MUTATED     = NO
  PAID_RESOURCES_CREATED = NO

LAUNCH_BLOCKERS         = 5 (lead persistence · backups · media storage decision · legal review · email provider)
READINESS               = local READY · staging READY WITH 2 TASKS · public launch NOT READY
RECOMMENDED_NEXT_OWNER_ACTION = (1) approve sealing Phase F (report + commit); (2) then direct the next
                          track: H — leads (commercial priority), or I — analytics, or a staging
                          environment first. No new execution has begun pending the owner's direction.

NEXT_STEP                = AWAITING OWNER DIRECTION — NO EXECUTION STARTED
```
