# Admin Control Center — PHASE A: Architecture Spike Report

**Date:** 2026-10-07 · **Status: PASS** · **Next action: STOP — owner review before Phase B**

Scope executed: *Phase A only* — prove the architectural foundation against this exact project.
No business collections, no auth product, no content models, no migration of website content, no
frontend redesign, no deployment.

Every number below was re-measured on 2026-10-07 with the commands recorded in §R. Nothing is quoted
from an earlier pass without re-verification.

---

## A. BASELINE

| Field | Value | Evidence |
| --- | --- | --- |
| NEXT | **16.4.0** (Turbopack) | `node -e require('./node_modules/next/package.json').version` |
| REACT | **19.3.0** (react, react-dom) | same method |
| TYPESCRIPT | **5.9.3**, strict, `noEmit` | same method |
| NODE | **20.20.2** | `node -v` |
| PACKAGE_MANAGER | **npm 10.8.2** | `npm -v` |
| CACHECOMPONENTS | **`true`** — enabled before, during and after the spike, never disabled | `next.config.ts` line 43; build log prints "Cache Components enabled" |
| PUBLIC_BUILD_BASELINE | **PASS** — pre-Payload snapshot rebuilt from `backups/phase-a-baseline-20261007-1412.tar.gz`: build exit 0 in 23 s, **40 prerendered routes** | `npm ci && npm run build` in a clean extraction of the tarball |
| PUBLIC_TESTS_BASELINE | **55 passed / 5 skipped / 0 failed** — identical before and after, re-run today | `npx playwright test` |

`partialPrefetching: true` and `reactStrictMode: true` remain set; both are still active.

## B. PAYLOAD

| Field | Value |
| --- | --- |
| PAYLOAD_VERSION | **3.90.2** — `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, pinned exactly (`--save-exact`). Support packages: `sharp 0.35.5`, `graphql 16.14.2`, `sass 1.105.1` (dev) |
| OFFICIAL_SUPPORTED_NEXT_RANGE | Payload's installation docs list `15.2.9–15.2.x`, `15.3.9–15.3.x`, `15.4.11–15.4.x` and **`16.2.6+`**. Official Next 16 support landed in **Payload 3.73.0** (upstream PR #14456). The installed package's own peer range is the authoritative check: **`>=16.3.3 <17.0.0`** — Next **16.4.0 satisfies it**. |
| INSTALL_RESULT | **PASS** — `added 199 packages`; no peer conflicts; **no `--legacy-peer-deps`**; `next`, `react` and the existing tree untouched. |
| Documented caveat | Payload states `cacheComponents` "can be enabled alongside Payload without causing errors in the admin panel" but that "full compatibility is not guaranteed". Treated as a gate and **tested** (§H) — it passed. |
| Re-verification before install (A3) | `npm view payload@3.90.2 peerDependencies`, `npm view @payloadcms/next@3.90.2 peerDependencies`, Payload's official installation page, and the upstream PR/release history — checked live before installing, not taken from the planning pack. |

## C. ADMIN

| Field | Value |
| --- | --- |
| ADMIN_ROUTE | **`/admin`** — route group `src/app/(payload)/`, its own root layout (the project has no `app/layout.tsx`, so no public restructuring was required). Plus `/api/[...slug]`, `/api/graphql`, `/api/graphql-playground`. `/ar/admin` returns **404**, so there is no locale clash. |
| ADMIN_RENDER | **PASS** — `curl -D - http://127.0.0.1:3000/admin` → **HTTP 200**, 99,057 bytes, 0.042 s. Renders Payload's login shell. |
| RTL_STATUS | **PASS** — `<html data-theme="light" dir="RTL" lang="ar">` with Arabic strings present (تسجيل الدخول ×6, البريد الإلكتروني ×22, كلمة المرور ×30). With `Accept-Language: en` the same page renders `<html dir="LTR" lang="en">` with English strings. Config: `i18n: { supportedLanguages: { ar, en }, fallbackLanguage: 'ar' }` — the option is `fallbackLanguage`, **not** `fallbackLng`. |
| ADMIN_BUNDLE_ISOLATION | **PASS — see §I.4.** 69 js/css assets in the build; the 12 public routes load 15 of them (1,044,798 B); the other **54 files (2,342,374 B)** — including Payload's 1,056,943 B and 579,878 B admin chunks and its 292,555 B admin stylesheet — are referenced by **no public route**. Overlap **0**. |

## D. DATABASE

| Field | Value |
| --- | --- |
| DATABASE | **local development PostgreSQL 17.11** (`pg_lsclusters`: `17 main 5432 online`), database `seven_lands_dev`, role `seven_lands`, bound to 127.0.0.1. No production database, no paid resource. |
| CONNECTION | **PASS** — 10 tables created: `payload_kv`, `payload_locked_documents(+_rels)`, `payload_migrations`, `payload_preferences(+_rels)`, `spike_items`, `spike_media`, `spike_users`, `spike_users_sessions`. |
| MIGRATIONS_CREATED | **1** — `src/migrations/20261007_141651_phase_a_spike.ts` (+ generated `.json` and `index.ts`), applied in **43 ms** (`payload_migrations` batch 1; `dev` row is Payload's dev-push marker). |

## E. TEMPORARY SPIKE COLLECTION

`spike-items` (document) · `spike-media` (upload) · `spike-users` (auth) — all under `src/spike/`,
all marked temporary in-file, all removable in one commit. Evidence re-run today:

| Operation | Result |
| --- | --- |
| CREATE | **PASS** — Local API `id=11`, REST `id=12` |
| READ | **PASS** — both paths, values verified |
| UPDATE | **PASS** — both paths, re-read confirms |
| DELETE | **PASS** — both paths; subsequent read throws NotFound / returns HTTP 404 |
| Anonymous REST write | **403** |
| Anonymous Local API read | denied — the call throws and leaks 0 documents (asserted on behaviour, not on message text) |
| Authenticated Local API read (positive control) | allowed |
| Local API check script | **`npx payload run src/spike/phase-a-check.ts` → ALL CHECKS PASSED (13 checks)** |

## F. PAYLOAD LOCAL API FROM A SERVER COMPONENT

| Field | Value |
| --- | --- |
| SERVER_COMPONENT_TEST | **PASS** — a real Server Component (`getPayload({ config })` → `payload.find`) rendered live database content into the HTML (item count, titles, media count, media file URL) and emitted `PHASE_A_PROBE_OK`. The page prerendered **with the cached read baked in**, and the values changed after `revalidateTag`. |
| NETWORK_HTTP_REQUIRED | **NO** — the Local API executes in-process; no HTTP request to itself. |
| Evidence location | Probe sources archived at `docs/admin-control-center/phase-a/PROBE_page_spike-probe.tsx.txt` and `PROBE_route_revalidate.ts.txt`; transcript in `.phase-a-evidence/runtime-verification.log`. The probe route itself was **deleted before the final build**, so the public route surface is exactly its original set. |

## G. MEDIA

| Field | Value |
| --- | --- |
| UPLOAD | **PASS** — 1200×800 PNG accepted, `alt` stored (`صورة اختبار المرحلة أ`), 14,269 bytes |
| IMAGE_PROCESSING | **PASS** — sharp derivatives **measured on disk**, not assumed: original `1200×800` (14,269 B), `thumbnail 400×300` (2,476 B), `card 768×512` (6,334 B) |
| STORAGE_USED | **local disk adapter** (`media-spike/`, outside `/public`, served through Payload's file endpoint) — no S3/R2, no paid commitment. Production storage remains an owner decision. |

## H. NEXT.JS INTEGRATION

| Field | Value |
| --- | --- |
| CACHECOMPONENTS | **enabled and unchanged** — the project's `cacheComponents: true` was never disabled, downgraded or worked around. |
| PPR / RENDERING | **PRESERVED — verified by comparing prerender manifests of the two builds** (`/home/user/.before-app/.../.next/prerender-manifest.json` vs `.next/prerender-manifest.json`): **40 prerendered routes in both**, and `/ar` is `{"renderingMode":"PARTIALLY_STATIC","experimentalPPR":true,"compute":"static"}` on both sides. **No public route lost prerendering.** |
| REVALIDATION_PROTOTYPE | **PASS** — `'use cache'` + `cacheTag('spike-items')`, invalidated from a route handler. Measured: `revalidateTag(tag,'max')` leaves **exactly one stale response** (stale-while-revalidate) before freshness; `revalidateTag(tag,{ expire: 0 })` is fresh on the **first** request. Publish flows must use the immediate form. |
| ANY_FRAMEWORK_SETTING_CHANGED | **NO.** Read from `node_modules/@payloadcms/next/dist/withPayload/withPayload.js`, `withPayload` modifies only: `experimental.turbopackServerFastRefresh` (disabled), `serverExternalPackages` (appended), the `Accept-CH`/`Critical-CH`/`X-Powered-By` response headers, and the `PAYLOAD_CACHE_COMPONENTS_ENABLED` env var. `cacheComponents` and `partialPrefetching` are untouched. |
| Framework findings that must shape Phase B | ① `revalidateTag` now **requires** a cacheLife profile argument. ② `await connection()` at page level is a build error under cacheComponents unless wrapped in `<Suspense>` or the route declares `export const instant = false` — it must not be used in a public page body. ③ Page-level `new Date()` is rejected during prerender as an unstable value. ④ Tagged cached reads are the correct production pattern. |

## I. PUBLIC REGRESSION

### I.1 Build, types, lint, tests

| Check | Command | Result |
| --- | --- | --- |
| BUILD | `npm run build` | **PASS** — exit 0, 68 pages generated |
| TYPECHECK | `npx tsc --noEmit` | **clean** |
| LINT | `npm run lint` | **0 errors, 1 warning** — the pre-existing React Compiler × RHF `watch()` note. (The generated-migration warnings are silenced by ignoring `src/migrations/**`.) |
| PLAYWRIGHT | `npx playwright test` | **55 passed / 5 skipped / 0 failed** — identical to the pre-Phase-A baseline |
| A11Y | inside that run | **18 axe checks, 0 violations** |

### I.2 The decisive test: the pre-Payload app rebuilt and compared side by side

The baseline snapshot (`backups/phase-a-baseline-20261007-1412.tar.gz`, verified to contain **zero**
payload references) was extracted to a separate directory, `npm ci`, built (**exit 0, 23 s, 40
prerendered routes**) and served on port 3200 alongside the Phase A build on 3000. Both were driven
by the same browser code path, 13 routes × 2 viewports.

```
route                            status   visible text   DOM skeleton
13 public routes (incl. a 404)   0 diff   0 diff ✅      0 diff ✅

PIXEL COMPARISON — full-page screenshots, 13 routes × {390, 1440} = 26 pairs
  exactly identical (0.0000%) ......... 24
  sub-pixel noise ..................... 2   (0.0012% and 0.0001% of pixels; >10/255: 0.0010% / 0.0000%)
```

**PUBLIC_VISUAL_REGRESSION = NONE.** **PUBLIC_CONTENT_CHANGED = NO** — visible text and DOM skeleton
are identical on every route; the only differences in the raw HTML are build-specific chunk hashes
inside the RSC flight payload. Script: `.phase-a-evidence/compare-final.mjs` (log: `final-comparison.log`).

### I.3 Public client bundle — before vs after, identical method on both live builds

```
route                   BEFORE chunks  BEFORE bytes   AFTER chunks  AFTER bytes    delta
/ar                     12             819,067        12            821,038        +1,971
/en                     12             819,067        12            821,038        +1,971
/ar/services            11             788,341        11            790,300        +1,959
/ar/start-a-project     13             968,684        13            970,679        +1,995
```

Same chunk counts, **+0.24 %** bytes, ≈ +785 B over the wire after compression.
Script: `.phase-a-evidence/bundle-bytes.mjs` (log: `bundle-bytes.log`).

### I.4 Admin code in the public bundle — containment

```
static assets in the build .......... 69 (js + css)
loaded by the 12 public routes ...... 15 files — 1,044,798 B
admin / api only .................... 54 files — 2,342,374 B
overlap ............................. 0
markers in public assets ............ "payloadcms" 0 · "@payloadcms" 0 · "create-first-user" 0 · "payload.config" 0
"create-first-user" lives in ........ the admin stylesheet (292,555 B), referenced by no public route
/admin references ................... 16 static files, 9 of which no public route references
```

The 7 chunks that `/admin` and `/ar` share were checked individually: **none contains any Payload
marker**; one is byte-identical to a pre-Payload file, and the rest are React / Next / Turbopack
runtime modules (`react`, `react-dom`, `__next_f`, Next's `WarningIcon`, the Turbopack asset runtime).
That is the acceptable "small shared framework delta" — not admin product code.
Script: `.phase-a-evidence/containment.mjs` (log: `containment.log`).

**ADMIN_CODE_IN_PUBLIC_CLIENT_BUNDLE = NO.** Note for future checks: grep for **`payloadcms`**, not
the bare word `payload` — the latter matches React internals (`createInitialRSCPayloadFromFallbackPrerender`,
React's action `t.payload`, React's `lazy()` `_payload`) and produces false positives.

### I.5 Performance — and one real finding

Measured under 4× CPU throttling and a 1.6 Mbps / 150 ms RTT profile, medians of repeated runs:

| route | side | TTFB | LCP | CLS | JS transfer | requests |
| --- | --- | --- | --- | --- | --- | --- |
| /ar | BEFORE | 8 ms | 844 ms | 0.0077 | 272 kB | 42 |
| /ar | AFTER | 7 ms | 1026 ms | 0.0002 | 273 kB | 42 |
| /ar/services | BEFORE → AFTER | 8 → 7 ms | 782 → 984 ms | 0.0016 | 272 → 273 kB | 41 |
| /ar/start-a-project | BEFORE → AFTER | 8 → 6 ms | 790 → 972 ms | 0.0002 | 272 → 273 kB | 42 |

**Root cause identified and proven.** The Payload build adds two response headers to *every*
response, including public pages:

```
Accept-CH:   Sec-CH-Prefers-Color-Scheme
Critical-CH: Sec-CH-Prefers-Color-Scheme        ← the pre-Payload build sends neither
```

`Critical-CH` tells the browser the hint is critical and makes it **restart the navigation** to
resend it — one extra round trip on every public page load. Controlled experiment
(`.phase-a-evidence/perf-critical-ch.mjs`, log `perf-critical-ch.log`):

```
BEFORE, no hint sent .................... 824 ms
AFTER,  no hint sent .................... 1028 ms   (+204)
AFTER,  hint pre-sent by the client ..... 876 ms   (recovers 152 ms ≈ exactly one 150 ms RTT)
BEFORE, hint pre-sent by the client ..... 832 ms   (unchanged — BEFORE never sent Critical-CH)
```

So the LCP penalty is a **browser retry caused by a header only the admin needs**, not rendering or
bundle weight; the residual +52 ms is the +2 KB framework delta. TTFB, CLS and request counts are
unchanged or slightly better.

**Decision taken (conservative, per the approved plan):** leave the behaviour as-is for Phase A and
escalate it as an owner decision — see §N item 1. Scoping those two headers to `/admin` in the
existing middleware would recover ≈150 ms on every public page, but it changes public response
behaviour, which the owner asked to review rather than have changed silently.

## J. PLANNING AMENDMENTS (verified in the files, not asserted)

All seven approved amendments are present. Files changed:

```
01_ADMIN_VISION_AND_SCOPE.md · 03_RECOMMENDED_ARCHITECTURE.md · 05_DATA_MODEL.md ·
06_CONTENT_BLOCK_SYSTEM.md · 11_ANALYTICS_AND_REPORTING.md · 12_TRACKING_PIXELS_AND_SCRIPTS.md ·
13_LEADS_AND_FORMS.md · 15_DRAFTS_REVISIONS_PUBLISHING.md · 18_QA_AND_ACCEPTANCE_CRITERIA.md ·
19_RISKS_AND_OPEN_DECISIONS.md · 20_FINAL_IMPLEMENTATION_MASTER_PLAN.md ·
docs/admin-control-center/INDEX.md · docs/admin-control-center/README.md · README.md (root)
```

| # | Amendment | Where | Verification |
| --- | --- | --- | --- |
| 1 | Payload officially supports Next.js 16 (3.73.0 / PR #14456; docs range 16.2.6+; installed peer `>=16.3.3 <17`); the spike is reframed as "does it work with *this* project"; `SPIKE_RESULT = PASS`; Next downgrade removed from the fallback path | `03_RECOMMENDED_ARCHITECTURE.md` §"Compatibility with Next.js 16" | grep "officially supports" ✅ |
| 2 | No visible AR→EN fallback: Arabic must never appear inside the English site; fallback only for non-visible metadata, explicitly flagged; admin shows Translated / Partially translated / Missing translation | `05_DATA_MODEL.md` | grep "no AR→EN visual fallback" + "Partially translated" ✅ |
| 3 | Translation completeness gates publishing — per-locale publish table replacing the earlier draft | `15_DRAFTS_REVISIONS_PUBLISHING.md` | grep "supersedes the earlier draft" ✅ |
| 4 | Testimonials / Metrics / Logo Cloud cannot be published empty (real quote+attribution; value+label[+source]; approved real client assets) | `06_CONTENT_BLOCK_SYSTEM.md` §2 | grep "quote + attribution" ✅ |
| 5 | Custom Scripts = Super Admin / developer advanced tool: separate high-risk permission, hidden from Admin/Editor/Marketing, audited, environment-scoped, CSP-aware, production confirmation, never a normal marketing field | `12_TRACKING_PIXELS_AND_SCRIPTS.md` §5 + native integrations as the primary path | grep "Super Admin only" ✅ |
| 6 | Analytics V1 stays focused (users, sessions, pageviews, channels, landing pages, devices, leads, WhatsApp/phone clicks, form starts/submits, conversion rate, Search Console clicks/impressions/CTR/queries/pages; "غير متصل" when a source is absent; explicitly not a GA4 clone) | `11_ANALYTICS_AND_REPORTING.md` | grep "V1" ✅ |
| 7 | Leads = mini-CRM only: New/Contacted/Qualified/Won/Lost/Spam + search/filters/notes/attribution/landing page/UTM/timestamps/export/audit; no pipelines, tasks, invoices, quotations, deal automation, forecasting | `13_LEADS_AND_FORMS.md` §3b | grep "non-CRM" ✅ |

Supporting changes: `18` gained §6b (executable criteria for the amendments), `19` closes risk R1,
`20` records the Phase A result and the amendment list, `01` carries a status note, `INDEX.md`/`README.md`
point at this report.

## K. EXACT CODE CHANGES

**Created — Payload integration** (the 10 `(payload)` files are byte-identical to Payload's official
blank template):
`src/payload.config.ts` · `src/app/(payload)/layout.tsx` · `(payload)/custom.scss` ·
`(payload)/admin/[[...segments]]/page.tsx` · `(payload)/admin/[[...segments]]/not-found.tsx` ·
`(payload)/admin/importMap.js` · `(payload)/api/[...slug]/route.ts` · `(payload)/api/graphql/route.ts` ·
`(payload)/api/graphql-playground/route.ts` · `src/payload-types.ts` (generated) ·
`src/migrations/20261007_141651_phase_a_spike.{ts,json}` · `src/migrations/index.ts`

**Created — temporary spike artefacts**: `src/spike/collections/SpikeUsers.ts`, `SpikeItems.ts`,
`SpikeMedia.ts`, `src/spike/phase-a-check.ts`, `.env` (dev-only, git-ignored)

**Modified**: `package.json` (`"type": "module"` + pinned deps) · `next.config.ts` (wrapped with
`withPayload` **outside** the next-intl plugin, so both sets of additions survive; no rendering flag
touched) · `tsconfig.json` (`@payload-config` path) · `src/proxy.ts` (matcher excludes `/admin` from
locale routing — **the only public-surface change**) · `eslint.config.mjs` (ignore generated
migrations) · `.gitignore` (`/media-spike`)

**Removed after evidence capture**: the two probe routes (`/spike-probe`, `/api/spike/revalidate`) —
sources archived under `docs/admin-control-center/phase-a/`; the public route surface is back to its
original set.

**Environment (not part of the repo)**: local PostgreSQL 17.11 for the spike; a 3 GB swap file,
because the sandbox has 2 GB RAM and the production build was OOM-killed without it.

## L. PRODUCTION

**`PRODUCTION_MUTATED = NO`** — no deployment, no DNS change, no WordPress change, no email change,
no production database or storage resource, no deletion of live data.

## M. PHASE_A_STATUS = **PASS**

```
PAYLOAD_ADMIN_RENDER ............. PASS      PUBLIC_VISUAL_REGRESSION ......... NONE (24/26 pixel-identical,
PAYLOAD_VERSION .................. 3.90.2                                           2 sub-pixel)
OFFICIAL_SUPPORTED_NEXT_RANGE .... >=16.3.3 <17 ✓ 16.4.0                 PUBLIC_CONTENT_CHANGED ........... NO (text + DOM identical)
NEXT_16_4_COMPATIBILITY .......... PASS      PUBLIC_CLIENT_BUNDLE_BEFORE ...... 819,067 B (/ar)
CACHECOMPONENTS_COMPATIBILITY .... PASS      PUBLIC_CLIENT_BUNDLE_AFTER ....... 821,038 B (+0.24%)
PPR_COMPATIBILITY ................ PASS      ADMIN_CODE_IN_PUBLIC_BUNDLE ...... NO
REVALIDATION_PROTOTYPE ........... PASS      STATIC_CONTENT_AUTHORITY ......... PRESERVED
POSTGRES_CONNECTION .............. PASS      PUBLIC_TESTS ..................... 55 passed / 5 skipped / 0 failed
TEMP_CRUD ........................ PASS      PRODUCTION_MUTATED ............... NO
LOCAL_API_SERVER_COMPONENT ....... PASS
MEDIA_UPLOAD / IMAGE_PROCESSING .. PASS
RTL_ADMIN_FEASIBILITY ............ PASS (ar RTL + en LTR)
```

## N. RECOMMENDATION

**PROCEED_TO_PHASE_B** after this review. Four items carried forward — the first is a decision the
owner should make, not something that should be changed silently:

1. **`Critical-CH` on public responses (measured cost ≈150 ms per page load).** `withPayload` adds
   `Accept-CH`/`Critical-CH: Sec-CH-Prefers-Color-Scheme` globally, which makes browsers retry the
   navigation on public pages that have no use for the hint. Options: **(a)** scope both headers to
   `/admin` in the existing middleware and re-run the comparison suite (recover ≈150 ms; changes public
   response headers, so it needs the owner's go-ahead); **(b)** keep Payload's behaviour and accept the
   cost. Recommendation: **(a)**, executed in Phase B with the measurement repeated.
2. **Dependency advisories rose from 0 to 20 when Payload was added** (2 low / 9 moderate / 9 high).
   Triage is possible but was not in the Phase A scope; the leaf advisories are `undici`, `dompurify`,
   `braces`, `esbuild` (the rest are their transitive parents). This should be an explicit Phase B task
   with a written triage, not a silent `npm audit fix`.
3. **The spike artefacts are still present and should stay until the owner accepts Phase A** —
   `src/spike/**` (three temporary collections + the check script), the spike migration, `media-spike/`.
   They are isolated, unreferenced by any public route, and removable in one commit (see §O). Note that
   the current build therefore exposes `spike-*` **API** endpoints (authenticated; anonymous writes
   return 403). No public page or bundle references them.
4. **`qa/final/` is a stale visual baseline** (it predates the earlier copy/hardening pass). The
   before/after evidence in §I.2 was produced by rebuilding the pre-Payload app from the baseline
   tarball, which is the correct method; `qa/final/` should be regenerated before it is used as a gate.

## O. Artefacts and clean-up plan

| Path | Nature | Action after Phase A is accepted |
| --- | --- | --- |
| `src/spike/**` | temporary collections + Local-API check script | **REMOVED IN PHASE B** (2026-10-07) — see `phase-b/PHASE_B_REPORT.md` §P |
| `src/migrations/20261007_141651_phase_a_spike.*` | generated spike migration | **REMOVED IN PHASE B**, replaced by the real Phase B migration |
| `media-spike/` | local uploads from the spike | delete |
| `.env` | dev-only database URI + `PAYLOAD_SECRET` (git-ignored) | keep; production secrets belong in the host's secret store |
| `.phase-a-evidence/**` | before/after HTML, bundle measurements, containment, cache experiments, A/B screenshots and logs | evidence for this review — safe to delete afterwards |
| `docs/admin-control-center/phase-a/*.txt` | archived sources of the deleted probe routes | keep as a reproducibility record |
| `backups/phase-a-baseline-20261007-1412.tar.gz` | pre-Phase-A snapshot (rollback point A1) | keep until Phase B is accepted, then archive |

Nothing outside that list was touched. `src/content/**`, `src/components/**`, `src/app/[locale]/**`,
`src/app/api/**`, `src/i18n/**` and `src/lib/**` (except the added `src/lib/auth/` — Phase B) are
byte-identical to the pre-Phase-A archive.

## R. Reproduction commands

```bash
# 1. pre-Payload baseline app, rebuilt and served for comparison
mkdir -p /home/user/.before-app && tar xzf /home/user/backups/phase-a-baseline-20261007-1412.tar.gz -C /home/user/.before-app
cd /home/user/.before-app/seven-lands-website && npm ci && npm run build && npm run start -- --port 3200

# 2. current build beside it
cd /home/user/seven-lands-website && npm run build && npm run start -- --hostname 0.0.0.0 --port 3000

# 3. compare content + pixels (13 public routes × 2 viewports)
node .phase-a-evidence/compare-final.mjs

# 4. bundle bytes + containment
node .phase-a-evidence/bundle-bytes.mjs && node .phase-a-evidence/containment.mjs

# 5. performance and the Critical-CH experiment
node .phase-a-evidence/perf-ab.mjs && node .phase-a-evidence/perf-critical-ch.mjs

# 6. the rest of the gates
npx tsc --noEmit && npm run lint && npx playwright test
npx payload run src/spike/phase-a-check.ts
curl -D - -o /dev/null http://127.0.0.1:3000/admin | head -1
```
