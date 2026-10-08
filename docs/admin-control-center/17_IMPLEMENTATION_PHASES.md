# 17 — Implementation Phases

**Status (2026-10-07): A, B, C and D are implemented and approved** (A: Payload × Next 16 spike +
infrastructure · B: auth/RBAC/audit · C: globals as content authority + byte-level media visibility ·
D: media library productization). Phase D is complete and awaiting owner review; **Phase E has not
started and must not start until the Media Library is approved.** Phase D differs from the original
plan in three ways worth knowing: storage stayed local with the R2/S3 boundary documented only, the
derivative set is thumbnail/card/content instead of five sizes, and folders were replaced by a
controlled tag vocabulary. Details: `docs/admin-control-center/phase-d/`.

Complexity: **L** low · **M** medium · **H** high. No hour estimates — ordering and dependency
truth matter more than invented precision.

| Phase | Scope | Complexity | Depends on | Key deliverable |
| --- | --- | --- | --- | --- |
| **A. Architecture & infrastructure** | compatibility spike (Payload × Next 16) · database provisioned · object storage · env/secret handling · `/admin` route isolation · CI gates | H | owner: hosting + DB decision | green spike, isolated admin route, CI running tests |
| **B. Auth, users, roles** | Payload auth · first super-admin seed · permission matrix · guards on every mutation · session hardening · user & role screens | H | A | only authorised users can reach `/admin`; matrix enforced server-side |
| **C. Settings & global data** | site-settings, contact, hours (structured), social accounts (+ icon picker), branding, consent settings · frontend reads them through the adapter | M | B | the phone number, hours and social icons become admin-editable |
| **D. Media library** | uploads, sharp derivatives, storage adapter, alt AR/EN, usage tracking, replace/delete protection | H | A | hero and logo images uploadable, correctly sized, protected |
| **E. Pages & blocks** | block registry + schemas + renderer wiring · home + static pages as block lists · reorder/enable/disable · variants | H | C, D | homepage editable section-by-section with no design regressions |
| **F. Services, projects, insights** | three collections with their templates, galleries, results model, scheduling | M–H | E | the seven Lands and future case studies/articles fully manageable |
| **G. SEO centre** | per-page SEO fields, fallback chain, OG media, redirect manager, site health checks | M | E, F | daily SEO operations without a developer |
| **H. Leads&nbsp;&&nbsp;forms** | lead storage, statuses, notes, CSV export, notifications, shared rate limiter | M | B (users/roles) | every brief submission becomes a trackable lead |
| **I. Analytics & Search Console** | GA4 Data API + GSC integration, cached cards, connection states | M | C | dashboard reports real numbers or an honest "not connected" state |
| **J. Tracking, pixels, consent, scripts** | native integration modules · CSP generation · consent banner + Consent Mode · custom-script governance | H | C, I | a pixel can be added without code and cannot silently break the CSP |
| **K. Revisions, scheduling, audit** | versions UI, restore, autosave, scheduled publish job, audit log screen | M | E, F | the "11 pm mistake" becomes survivable |
| **L. Migration** | seed script · before/after HTML diff · provider flip · content export | H | C–F | the public site is served from the CMS with byte-identical output |
| **M. QA, performance, security** | full test matrix (public + admin) · a11y audit on admin · performance budget check · pen-test checklist · restore drill | H | L | signed-off release candidate |
| **N. Release** | staging sign-off · runbook · owner training (one page, Arabic) · production cutover (separate approval) | M | M | live control center |

## Critical path

`A → B → C → D → E → L → M → N`

F, G, H, I, J, K can proceed in parallel once E is stable; I and J are the only phases that touch
third-party services and therefore the only ones with external approval delays.

## Sequencing notes

- **A is a gate, not a phase to rush.** If the spike fails, the fallback decision (`03_…` §spike)
  must be taken before any UI work — everything downstream assumes the CMS exists.
- **C before L**: migrating settings is the lowest-risk way to prove the adapter + seed pipeline
  before touching the homepage.
- **H can ship before the CMS content work is finished** — it is the highest immediate business
  value (leads are currently lost) and is independent of blocks.
- **J last among the marketing phases** because it depends on the consent decision (owner) and the
  CSP refactor.
- **K is building on platform primitives** — do not hand-roll versions; wire the UI to what Payload
  already stores.

## Effort shape (relative, not calendar)

| Group | Share of total effort |
| --- | --- |
| Infrastructure + auth + RBAC (A, B) | ~20% |
| Content system (C, D, E, F) | ~35% |
| Operations (G, H, K) | ~20% |
| Marketing stack (I, J) | ~12% |
| Migration + QA + release (L, M, N) | ~13% |

This shape is dominated by the content system because that is where the business value is; the
marketing stack is comparatively cheap **because** it reuses the existing event model.
