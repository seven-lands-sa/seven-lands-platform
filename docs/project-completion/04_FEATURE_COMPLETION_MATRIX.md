# 04. FEATURE COMPLETION MATRIX

| Domain / Feature | Status | Current Authority | Verified Local Tests | Issues / Defects | Remaining Work |
|---|---|---|---|---|---|
| **Public Website (20 Routes)** | `COMPLETE` | Next.js Server Components | Playwright (55 passed) | None | Physical iOS/Android verification |
| **Arabic Website (RTL)** | `COMPLETE` | Code / CSS / Design tokens | Playwright + Axe (18 passed) | None | Screen-reader pass |
| **English Website (LTR)** | `COMPLETE` | Code / CSS / Design tokens | Playwright + Axe | None | None |
| **Responsive Design** | `COMPLETE` | Tailwind 4 CSS | 390px, 768px, 1024px, 1440px | None | Edge cases on foldables |
| **Pages CMS** | `COMPLETE` | CMS with static fallback | `verify-phase-e.ts` (64/0 passed) | None | None |
| **Typed Blocks (18 types)** | `COMPLETE` | Registry (`src/lib/blocks`) | `verify-phase-e.ts` | `mapEmbed` unrendered (by design) | None |
| **Services CMS (7 capabilities)** | `COMPLETE` | CMS with static fallback | `verify-services-cms.mjs` (48/0) | Sealed in commit `ffd47f6` | Sealed in Git checkpoint |
| **Projects Collection** | `PARTIAL` | Schema only (`0` records) | Schema verified | `0` records; honest empty state | Owner real project data |
| **Insights Collection** | `PARTIAL` | Schema only (`0` records) | Schema verified | `0` records; honest empty state | Owner real articles |
| **Media Library** | `FUNCTIONAL` | Local disk (`media/`) | `verify-media-binary.ts` (22/0) | `0` assets; local storage only | Provider selection (G2: S3/R2) |
| **Authentication & Users** | `COMPLETE` | Payload Auth (`users`) | `verify-phase-b.ts` (37/0) | No email provider for resets | Email provider (G4) |
| **RBAC (5 System Roles)** | `COMPLETE` | `src/lib/auth/permissions.ts`| `verify-phase-b.ts` | None | None |
| **Audit Log (Immutable)** | `COMPLETE` | `audit_events` table | `verify-phase-b.ts` | None | Search & retention UI (Phase K) |
| **Site Globals (6 items)** | `FUNCTIONAL` | Globals in PostgreSQL | `verify-phase-c.ts` | Hours & Social empty | Owner data inputs (G1) |
| **Leads Collection & Forms (Phase H)** | `COMPLETE` | Payload CMS + PostgreSQL | `verify-phase-h.ts` (5/5) | D2 resolved; 0 data loss | None (Mini operational lead manager) |
| **WhatsApp Integration** | `COMPLETE` | Contact global / Code | Smoke tests | None | None |
| **Technical SEO & Redirects** | `COMPLETE` | `src/collections/Redirects.ts` | `verify-phase-g.ts` (17/17) | None | Redirect Manager live |
| **GraphQL API** | `COMPLETE` | Payload GraphQL Route | Defect D1 suite (5/5 passed) | D1 resolved; enum-safe mapping | None |
| **Analytics (GA4/GSC/GTM)** | `COMPLETE` | `src/globals/TrackingSettings.ts` | `verify-phase-i.ts` (6/6) | None (Honest status `غير متصل` until credentials provided) | Owner IDs configuration |
| **Marketing Pixels & CSP** | `COMPLETE` | TrackingSettings + hardened CSP | `verify-phase-i.ts` (6/6) | None; zero tracking before consent | Owner pixel credentials |
| **Consent Management (v2)** | `COMPLETE` | `src/lib/consent.ts` + Banner | `verify-phase-i.ts` + Axe a11y | None (WCAG AA compliant) | None |
| **Admin Operations & Health** | `COMPLETE` | `/api/admin/health` & `/search` | `verify-phase-k.ts` (6/6) | None | None |
| **Database Migrations** | `COMPLETE` | 13 migration files | Reconstructed in PostgreSQL | `push: false` strictly enforced | None |
