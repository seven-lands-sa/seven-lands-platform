# 20 — Final Implementation Master Plan

## 1. Executive summary

Seven Lands' website is currently a well-built, fully static Next.js application: fast, honest,
bilingual, and completely dependent on a developer for any content change. The business wants to
run the site itself.

The recommended path is to add **one operational layer** — the Seven Lands Admin Control Center,
built on **Payload CMS 3 inside the existing Next.js application** — and to introduce **one new
seam** in the frontend: a content adapter (`src/lib/content/*`) that can read from either the CMS or
today's static files. Everything else about the public site stays exactly as it is: same design,
same performance budget, same URLs, same SEO.

The work is ordered so that the riskiest assumptions are tested first (Phase A spike), the highest
business value arrives early (settings, navigation, leads), and the riskiest frontend surface (the
homepage) is migrated last, behind a verified rollback.

## 2. The architecture in one diagram

```
                    ┌────────────────────────────── public ──────────────────────────────┐
Browser ──────────▶ │  Next.js 16 · App Router · PPR                                    │
                    │  components (unchanged) → src/lib/content (NEW seam)              │
                    │        provider "cms"  ───────┐        provider "static" (rollback)│
                    └───────────────────────────────┼───────────────────────────────────┘
                                                    │  Local API (no HTTP)
                    ┌────────────────── /admin ─────▼───────────────────────────────────┐
                    │  Payload 3 admin (isolated bundle, RTL, Arabic-first)             │
                    │  collections · globals · RBAC · versions · preview · uploads      │
                    └───────┬───────────────────────────┬──────────────────────────────┘
                            │                           │
                     PostgreSQL (managed)        Object storage (R2/S3)
                            │                           │
                    backups · PITR              versioning · CDN
```

## 3. Build order (authoritative)

1. **A** spike + infrastructure → **B** auth/RBAC → **C** settings → **D** media → **E** pages/blocks
2. **H** leads (highest business value, independent) can run in parallel with C–E.
3. **F** services/projects/insights → **G** SEO → **I** analytics → **J** tracking/consent/scripts → **K** revisions/audit
4. **L** migration (adapter flip) → **M** QA/perf/security → **N** release

Full phase table with complexity and dependencies: `17_IMPLEMENTATION_PHASES.md`.

## 4. Guardrails that apply to every phase

- The public site's performance, accessibility and SEO budgets are unchanged.
- No invented business facts anywhere, including in admin scaffolding and empty states.
- No secrets through admin forms; no arbitrary layout; no arbitrary CSS.
- Every mutation is authorised server-side and (where sensitive) audited.
- The static content provider stays in the repo until the owner signs off post-migration.
- Nothing touches production hosting, DNS or email until a separate, explicit approval.

## 5. Definition of success (from `01_…` §6)

Eight administrator tasks completed with no developer involvement — update contact details, add
hours and see "مفتوح الآن", add a social account, publish a case study, change the hero in both
languages, connect GA4, export leads, roll back a mistake — with all existing public QA still green.

## 6. Cost and operational footprint (indicative)

| Item | Typical monthly cost at this scale |
| --- | --- |
| Managed Postgres (small tier) | 0–25 USD |
| Object storage + CDN (R2) | ~1–5 USD |
| Email (lead notifications, resets) | 0–20 USD |
| Hosting (existing app + admin) | unchanged from the current plan |
| Payload / Next / Postgres / sharp | free, open source |

No paid CMS licence, no per-seat fee, no analytics vendor beyond Google's free tiers.

## 7. What the owner sees

1. Approve this plan (and answer the ten decisions in `19_…` §B, of which only three can delay work).
2. Observe the Phase A spike result before any money is spent on infrastructure.
3. Review staging after Phase E — the homepage becomes editable, which is the moment the value is
   visible.
4. Sign off on migration (Phase L) with a side-by-side of yesterday's site and today's.
5. Approve the separate production cutover plan — which is **not part of this project** and touches
   nothing live until explicitly authorised.

## 7b. Phase A result and owner amendments (2026-10-07)

- **Phase A executed and PASSED** on the real repository. Next.js **16.4.0 stays**; Payload
  **3.90.2** is embedded in the existing app and pinned exactly; `cacheComponents: true` and PPR
  remain enabled and are verified, not disabled. Full evidence: `PHASE_A_SPIKE_REPORT.md`.
- **Localization policy amended:** no AR→EN visual fallback. Publication per locale requires complete
  required visible fields; the admin computes Translated / Partially translated / Missing translation
  (`05_…` §5, `15_…` §3).
- **Block validation amended:** `testimonials`, `metrics`, `logo-cloud` are available types but
  unpublishable without real, attributable content (`06_…` §2).
- **Custom scripts amended:** advanced/developer capability, Super Admin only, separate high-risk
  permission, hidden from ordinary roles, audited, environment-scoped, CSP-aware, production
  confirmation required (`12_…` §5).
- **Analytics V1 scope fixed** to the owner's metric list — explicitly not a GA4 clone (`11_…` §1).
- **Leads boundary fixed:** six statuses, no pipelines/tasks/invoices/quotations/deal automation/
  forecasting (`13_…` §3b).
- **Phase B is not started.** Phase A ends at a hard stop gate.

## 8. Final statement

RECOMMENDED_ADMIN_ARCHITECTURE =
Payload CMS 3 embedded in the existing Next.js application, with PostgreSQL, S3-compatible media
storage, a content-adapter seam in the frontend, and the static content retained as rollback.

WHY =
Every requested module (localization, blocks, media, RBAC, versions, preview, scheduling, audit)
is a CMS primitive; the public site's performance and design must not change; the business must
own its content without owning a CMS; and the migration must be reversible.

REJECTED_ALTERNATIVES =
custom-built admin (3–5× cost, permanent maintenance), external headless CMS (second platform +
vendor control), settings-panel bolt-on (fails at the second editor), WordPress (contradicts the
build pack and the performance/security posture).
