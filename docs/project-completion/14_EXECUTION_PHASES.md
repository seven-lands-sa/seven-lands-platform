# 14. EXECUTION PHASES

This execution sequence organizes the remaining work into disciplined, gated implementation tracks.

---

## Phase F (Sealing): Domain Content & Repository Foundation
- **Objective:** Secure the verified working-tree changes into Git history and seal Phase F.
- **Scope:**
  - Complete `docs/admin-control-center/phase-f/PHASE_F_REPORT.md`.
  - Create Git checkpoint commit for Phase F.
- **Dependencies:** None (verified on local runtime).
- **Migrations:** Migrations `20261008_103522` and `20261008_103658` already applied.
- **Acceptance Gate:** `git status` clean for Phase F files; all suites passing.

---

## Phase H: Leads Management & Form Persistence (Defect D2)
- **Objective:** Eliminate lead drop risk and establish durable client inquiry management.
- **Scope:**
  - Create `Leads` collection in Payload CMS (fields: contact info, company, selected capabilities, goal, timeline, channel, status, notes).
  - Add migration via `npx payload migrate:create` and run `npx payload migrate`.
  - Update `POST /api/brief` to write durable lead records via Payload Local API before returning HTTP 200.
  - Implement email/webhook dispatch with retry logging.
  - Configure RBAC access rules (`leads.read`, `leads.update`, `leads.delete`).
- **Dependencies:** Sealing Phase F.
- **Acceptance Gate:** 100% of valid form submissions create a row in PostgreSQL; admin panel allows filtering and status updating.

---

## Phase G: SEO Control Center & Redirect Manager (Defect D1)
- **Objective:** Resolve GraphQL enum crash and provide editorial control over redirects and metadata overrides.
- **Scope:**
  - Fix Defect D1 in `route-registry.ts` by normalizing internal route keys.
  - Create `Redirects` collection with source path, target path, status code (301/308), and locale awareness.
  - Integrate redirect evaluation into `src/proxy.ts` middleware.
- **Dependencies:** Phase H.
- **Acceptance Gate:** `POST /api/graphql` returns HTTP 200 on schema introspections; dynamic redirect rules function in browser.

---

## Phase I & J: Analytics, Integrations & Consent Management
- **Objective:** Connect traffic attribution and consent controls compliant with Saudi privacy standards.
- **Scope:**
  - Implement GA4 tracking script integration guarded by consent state.
  - Create lightweight, accessible cookie banner component.
  - Build privacy-preserving analytics summary card in Admin dashboard.
- **Dependencies:** Owner Gate G3 (GA4 ID).
- **Acceptance Gate:** Zero cookies loaded until consent granted; GA4 events triggered upon acceptance.

---

## Phase K: Admin Operations & Site Health
- **Objective:** Enhance day-to-day administrative productivity and diagnostic visibility.
- **Scope:**
  - Global admin search across Pages, Services, Projects, Insights, and Leads.
  - Site health diagnostics view (database connectivity, storage health, orphaned media scanner, broken link finder).
- **Dependencies:** Phases H & G.
- **Acceptance Gate:** Health checks report accurate real-time metrics.

---

## Phase M & N: Hardening & Release Candidate
- **Objective:** Final end-to-end security audit, backup drills, staging validation, and production cutover pack.
- **Scope:**
  - Production backup and restore dry run on staging host.
  - External storage driver deployment (R2/S3).
  - Transactional email provider integration.
  - Final visual regression sweep and release candidate documentation.
- **Dependencies:** Owner Gates G2, G4, G5.
- **Acceptance Gate:** Full staging deployment verified on real mobile devices; owner approval for DNS cutover.
