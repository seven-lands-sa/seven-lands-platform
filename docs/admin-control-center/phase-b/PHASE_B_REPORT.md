# PHASE B REPORT — Authentication, Users, RBAC & Security Foundation

Scope executed: **Phase B only**. No business collections, no content migration, no Phase C work,
no production mutation.

Every number below was produced by running the system in this phase. Evidence files are named where
they exist, and the commands to reproduce them are in `SECURITY_VERIFICATION.md`.

---

## A. PHASE_B_STATUS = **PASS**

| Gate | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`, strict) | **clean** |
| Lint (`eslint .`) | **0 errors**, 2 warnings — the pre-existing React Compiler × react-hook-form `watch()` notice in the brief form; no new warning was introduced |
| Build (production, Turbopack) | **exit 0**, 66 static pages, `Cache Components enabled`, `/admin` partial-prerender |
| Playwright (public site) | **55 passed / 5 skipped / 0 failed** — identical to the Phase A baseline |
| Local API authorization matrix | **34 / 34** — `PHASE_B_SERVER_ENFORCEMENT = PASS` |
| REST + GraphQL against the production build | **36 / 36** — `PHASE_B_LIVE_ENFORCEMENT = PASS` |
| Migrations from an empty database | **applied in 112 ms**, 13 tables, no drift |
| Seed idempotency | re-run updated 5 roles in place, created nothing, changed exactly one audit row |
| PPR / cacheComponents | preserved — 40 prerendered routes, `/ar` still `PARTIALLY_STATIC`, `partialPrefetching` untouched |
| PUBLIC_CONTENT_CHANGED | **NO** — 0 files changed under `src/app/[locale]`, `src/components`, `src/content`, `src/i18n` |
| PRODUCTION_MUTATED | **NO** |

## B. DEPENDENCY ADVISORIES — before / after

Phase B added **no new dependencies**, so the picture is unchanged from the Phase A triage:

| | all deps | production deps |
| --- | --- | --- |
| before triage (Phase A, §2) | 20 | 16 |
| **at the end of Phase B** | **13** (5 moderate · 8 high) | **9** (5 moderate · 4 high) |

The remaining items are the known, documented leaves: `braces`/`chokidar` reach the tree through
development tooling, `esbuild 0.18.20` through `drizzle-kit`'s dev server, and `undici`/`dompurify`
through Payload's own pins. `npm audit fix --force` remains rejected — its "fix" is a Payload
downgrade. Full reasoning: `docs/admin-control-center/security/DEPENDENCY_ADVISORY_TRIAGE.md`.

## C. AUTHENTICATION

- Payload's auth for the hard parts (hashing, sessions, reset, lockout); **authorization is ours**.
- `tokenExpiration` 2 h · `useSessions: true` · cookies `SameSite=Lax`, `Secure` in production.
- Brute force: 5 attempts → 10-minute lock; **unlocking requires `users.suspend`** because lifting a
  lockout is a security action.
- Suspension is enforced in `beforeLogin` — a position Payload only reaches *after* the password is
  verified, so refusing a suspended account cannot be used to discover which emails exist. Verified:
  a suspended user cannot log in, resolves to **0** permissions, and has all stored sessions cleared
  **immediately** (1 session before → 0 after; access refused on the next call).
- First Super Admin is seeded from environment variables, never from code; the dev password lives in
  the git-ignored `.env` and must be replaced in any real deployment.

## D. USERS

`src/collections/Users.ts` — Arabic-labelled (`مستخدم`/`المستخدمون`), list columns
name · email · status · roles · last login, grouped under **النظام**. Fields: name, roles (required,
many), status (`ACTIVE`/`SUSPENDED`), preferred admin language, `lastLoginAt` (read-only, written by
the login hook). Every change is audited; the permission-relevant fields carry their own access rules:

| Field | Create | Update | Rationale |
| --- | --- | --- | --- |
| `roles` | `users.update` | `users.update` | assigning roles is the escalation path |
| `status` | `users.suspend` | `users.suspend` | no pre-suspended / pre-activated accounts |

Deleting a user requires the new high-risk `users.delete` permission (Super Admin only by default),
and is blocked outright for the last active Super Admin.

## E. RBAC

36 permissions in 9 groups, every one a `resource.action` string (`pages.publish`, `media.upload`,
`audit.read`…). **There is no `isAdmin` boolean anywhere in the codebase.** Authorization flows
through exactly one function — `resolvePermissions()` — from `user.roles[]` to role documents to a
permission set, memoised per request. Collections declare `requirePermission("media.upload")`; they
never contain an authorization algorithm and never see a role name.

Roles are **data**: the five system roles are seeded documents. A custom sixth role created in the
admin is enforced identically — proven by creating and deleting a throwaway role during verification.

## F. ROLE MATRIX

Full table (36 permissions × 5 roles, generated from the live database) in
`phase-b/PERMISSION_MATRIX.md`. Counts: مدير النظام 36 (fullAccess) · مدير 26 · محرر 17 · تسويق 15 ·
مشاهد 8.

Section §10 is enforced mechanically: the set withheld from ADMIN is **derived** from the
catalogue's `highRisk` flags minus three documented delegations (`leads.read`, `leads.export`,
`settings.update`), so a high-risk permission added by a later phase cannot silently land in ADMIN.
`audit.read` is consequently Super-Admin-only, which is the correct reading of §10 for the security
record.

## G. ACCESS TESTS

Two independent layers, both behaviour-based, always with a positive control:

| Layer | Personas | Result |
| --- | --- | --- |
| Local API, `overrideAccess: false` | anonymous + 5 roles + suspended | **34/34** |
| REST / GraphQL, production build | same, over HTTP with real tokens | **36/36** |

```
users.read    anonymous=deny  super_admin=allow  admin=allow  editor=deny   marketing=deny   viewer=deny   suspended=deny
audit.read    anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
media.read    anonymous=deny  super_admin=allow  admin=allow  editor=allow  marketing=allow  viewer=allow  suspended=deny
users.create  anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
roles.manage  anonymous=deny  super_admin=allow  admin=deny   editor=deny   marketing=deny   viewer=deny   suspended=deny
```

Operation-level proof over HTTP: editor uploads media **201**, editor deleting media **403**,
viewer reading media **200**, viewer uploading **403**, anonymous on every collection **403**.

## H. AUDIT LOG

`audit-events` is write-once: `create`, `update` and `delete` are `denyAll` for **every** caller
including a Super Admin — verified over both layers (403/403/403 with the row still intact
afterwards). The single writer is `recordAuditEvent()`, running as the system from collection hooks.

12 actions, including `role_changed`. Role edits record a **permission diff** — the seed re-run
produced exactly one audit row (`إضافة 0، إزالة 1`) for the one role that actually changed, and
nothing for the four that did not. Server-side writes with no request user are attributed to
`system` so the log never shows a blank actor. `actor` is `ON DELETE SET NULL`: deleting an account
does not erase its history.

## I. GRAPHQL

Pinned explicitly in the config rather than relying on defaults, then verified in a production build:

| Probe | Result |
| --- | --- |
| `GET /api/graphql-playground` | **404** — not served in production |
| introspection query to `/api/graphql` | **refused**: *"GraphQL introspection is not allowed, but the query contained `__schema` or `__type`"* |
| `maxComplexity` | 1000 |

Nothing in this project consumes GraphQL (the admin uses REST), so this costs nothing.

## J. DATABASE

Local development PostgreSQL 17 only. The Phase A spike migration and its tables were **deleted**
(§4/§26) and replaced by one real migration:

```
migration: src/migrations/20261007_162549_phase_b_auth_users_rbac.ts
applied  : 112 ms against an EMPTY schema (proves a fresh database builds from migrations alone)
tables   : 13 — users(+sessions, +_rels), roles, media(+locales), audit_events, payload_*
integrity: users.email unique · roles.key unique · audit actor FK ON DELETE SET NULL
```

`audit_events.resource_id` is spelled correctly — the first generated migration produced
`resource_i_d`, which is why the field was renamed to `resourceId` and the migration regenerated.

## K. ADMIN UX

- **Arabic-first and RTL by default**: `<html data-theme="light" dir="RTL" lang="ar">` verified on the
  production build; `Accept-Language: en` switches to `dir="LTR" lang="en"`.
- Permission checkboxes render in the §16 order — **المحتوى · الوسائط · العملاء المحتملون · تحسين
  الظهور · التسويق والتتبع · التحليلات · إعدادات الموقع · المستخدمون · النظام** — each group a
  collapsible block with one Arabic-labelled checkbox per rule.
- Role assignment and suspension are separate, separately-permissioned fields; system roles cannot
  be deleted or re-keyed, only tuned.
- Media shows per-locale fields (`النص البديل`, `التعليق`) as locale tabs, plus tags and a focal
  point.
- The destructive door only opens for the right person: the fields a lesser role may not set are
  simply absent/stripped for them, and the audit log has no edit affordance at all.
- **Post-delivery addendum (2026-10-07) — the admin was driven in a real browser**, on both the
  loopback and the hosting-preview origin: login → dashboard (`النظام`: المستخدمون · الأدوار
  والصلاحيات · سجل الأحداث; `المحتوى`: الوسائط), and the `users` list rendering all six accounts
  with role and status in Arabic. Screenshots:
  `qa/review/admin-{dashboard,users,roles}-preview-check.png`.
- **Known rendering note — inherited, not introduced by this phase.** Every *authenticated* `/admin`
  request logs `Next.js encountered the unstable value new Date() while prerendering` from Payload's
  own `authenticate()`. Next catches it and serves the route dynamically anyway — 200, full UI,
  ~46 ms — and the public site never triggers it. This is Phase A finding ③ (`new Date()` is rejected
  during prerender under `cacheComponents`) reaching the admin through Payload's code, consistent
  with Payload's documented cacheComponents caveat. Nothing was disabled to silence it:
  `cacheComponents` and PPR are untouched and `/admin` still builds as ◐ Partial Prerender.

## L. PUBLIC REGRESSION = **NONE**

| Check | Result |
| --- | --- |
| Public routes on the Phase B build | `/ar` `/en` `/ar/services` `/ar/work` `/en/contact` `/ar/privacy` → **200** |
| Playwright (smoke + a11y) | **55 passed / 5 skipped / 0 failed** — same as the Phase A baseline |
| axe accessibility checks inside that run | 18 checks, 0 violations |
| Visual QA capture (13 routes × 2 viewports) | 24/26 clean; the only findings are the expected 404 console error on the deliberately-missing route |
| Source diff | **0 files** changed under `src/app/[locale]`, `src/components`, `src/content`, `src/i18n` |
| `src/proxy.ts` | matcher unchanged — `admin` was already excluded in Phase A |
| **PUBLIC_CONTENT_CHANGED** | **NO** |

## M. BUNDLE ISOLATION (§24)

Measured on the Phase B build, live (`.phase-b-evidence/containment.log`):

```
assets in the build ............. 69 (js + css)
loaded by public routes ......... 15  · 1,044,798 B
loaded by /admin ................ 16  · 2,607,104 B
admin-only ......................  9  · 2,035,200 B
shared /admin ∩ public ..........  7  ·   571,904 B
Payload markers inside public assets ... 0
largest admin-only assets ... 1,056,943 B · 579,878 B · 292,555 B (the admin CSS)
```

The 7 shared chunks were each inspected for `payloadcms` / `@payloadcms` / `create-first-user` /
`payload.config`: **all clean** — they are React, Next and Turbopack runtime modules.
**ADMIN_CODE_IN_PUBLIC_CLIENT_BUNDLE = NO.** (Method note: check for `payloadcms`, never the bare
word `payload` — React's own runtime contains `_payload` and `createInitialRSCPayloadFromFallbackPrerender`.)

## N. SECURITY

Detailed in `phase-b/SECURITY_VERIFICATION.md`, including the last-active-Super-Admin invariant
(strip/suspend/delete all refused; allowed once a second Super Admin exists), field-level
protections against privilege escalation, session revocation on suspension, and the media
permission boundary. Seven real defects were found by running the system and fixed in this phase —
most notably an `afterLogout` hook that Payload does not give a `user` (logout auditing would have
been silently dead), and a hand-written `ADMIN_WITHHELD` list that had drifted from the catalogue.

**Addendum (2026-10-07, after delivery — found while making the live preview usable).** Payload
accepts its auth cookie only from an `Origin` listed in `payload.config.csrf` (or with no `Origin`
and `Sec-Fetch-Site ∈ {same-origin, same-site, none}`). That is correct protection, but it meant the
admin could not be used from the hosting preview origin while `serverURL` was localhost: login
succeeded, then the cookie was refused and `/api/users/me` returned `user:null`. `csrf` is now
`[serverURL, ...PAYLOAD_TRUSTED_ORIGINS]` (`PAYLOAD_TRUSTED_ORIGINS` = comma-separated, no
wildcard; dev only). Verified in a real browser on the preview origin: login → dashboard renders in
Arabic RTL, `users` and `roles` list screens render with data, and an authenticated write returns
`201`; `Origin: https://evil.example` still resolves to `{"user":null}`. JWT header auth was never
affected — which is why the 36/34 assertion harnesses passed before this was noticed.

## O. HEADER DECISION — `Critical-CH` (§25)

Investigated, quantified in Phase A, and **left as-is deliberately** pending your decision.

`withPayload` adds two headers to **every** response, including public pages:
`Accept-CH: Sec-CH-Prefers-Color-Scheme` and `Critical-CH: Sec-CH-Prefers-Color-Scheme`. The
pre-Payload build sends neither. `Critical-CH` tells the browser the hint is critical and makes it
**restart the navigation** to resend it — one extra round trip per public page load.

Controlled experiment (4× CPU throttle, 1.6 Mbps / 150 ms RTT):

```
BEFORE, no hint sent .................... 824 ms
AFTER,  no hint sent .................... 1028 ms   (+204)
AFTER,  hint pre-sent by the client ..... 876 ms   (recovers ≈152 ms — exactly one 150 ms RTT)
```

Therefore the LCP penalty is a browser retry caused by a header only the admin needs — not rendering
or bundle weight. Nothing in the public site uses `Sec-CH-Prefers-Color-Scheme`.

| | |
| --- | --- |
| **CURRENT_SETTING** | both headers applied globally by `withPayload` |
| **REQUIRED_CHANGE** | scope `Accept-CH` / `Critical-CH` to `/admin` in the existing middleware (~3 lines) |
| **WHY** | ~150 ms of LCP on every public page load, paid for a hint only the admin consumes |
| **PUBLIC_IMPACT** | public response headers change; rendered output is unaffected |
| **ALTERNATIVES** | ① scope to `/admin` (recommended, needs your approval); ② leave as-is and accept ~150 ms; ③ strip the headers entirely (loses the admin's dark/light preference detection) |
| **RECOMMENDATION** | ① — to be applied in the next phase, with the A/B measurement repeated |

The residual ~+52 ms of the delta is the ~2 KB of framework chunks the route group adds.

## P. FILES

**Created** — `src/lib/auth/{permissions,roles,access,audit,invariants,current-user}.ts` ·
`src/collections/{Users,Roles,AuditEvents,Media}.ts` ·
`src/scripts/{seed-auth-foundation,verify-phase-b}.ts` ·
`src/migrations/20261007_162549_phase_b_auth_users_rbac.{ts,json}` ·
`src/app/(payload)/**` (the 9 integration files, byte-identical to Payload's official blank
template) · `docs/admin-control-center/phase-b/{PERMISSION_MATRIX,AUTH_ARCHITECTURE,SECURITY_VERIFICATION,PHASE_B_REPORT}.md` ·
`.phase-b-evidence/**`.

**Modified** — `src/payload.config.ts` (real collections, `admin.user: users`, explicit GraphQL
lockdown, localization `ar`/`en` with `fallback: false`, upload ceiling, `csrf` from
`serverURL` + `PAYLOAD_TRUSTED_ORIGINS`) · `.gitignore` · `.env`
(dev-only, git-ignored) · `qa/final/**` (regenerated baseline + manifest).

**Removed (§4)** — `src/spike/**`, `media-spike/**`, the spike migration, and its tables in the dev
database. No spike authority remains anywhere in the config.

**Unchanged** — every file under `src/app/[locale]`, `src/components`, `src/content`, `src/i18n`,
`src/lib/{seo,schema,routes,analytics,path,utils}.ts`, `src/proxy.ts`, `tests/**`.

## Q. PRODUCTION_MUTATED = **NO**

No deployment, no DNS change, no WordPress change, no email change, no production database or
storage, no deletion of live data. All work happened against a local development PostgreSQL and a
TLS-less local production build used for verification only.

## R. **STOP_FOR_DECISION**

Phase B is complete and passing. I am stopping here as instructed — Phase C has not been started,
and no business collection, content migration or SEO/analytics/leads work was begun.

Three items need your word before the next phase:

1. **`Critical-CH` scoping (§25)** — apply the recommended `/admin` scoping and recover ~150 ms per
   public page load, or keep Payload's behaviour? (Everything else about the public site is
   untouched; this is the only measured public-facing performance cost of the whole architecture.)
2. **Public delivery of media files** — the library is deliberately **not** anonymously readable
   (file endpoint → 403), so unpublished uploads cannot leak. When the content collections arrive,
   public delivery needs an explicit model: a public read path limited to *published* documents, or
   pre-generated public URLs recorded on the document. Recommend deciding this at the start of
   Phase C rather than letting the first content collection imply it.
3. **Dependency advisories** — no action is required now; note that the `undici` "fix" `npm audit`
   suggests is a Payload downgrade and must stay rejected.
