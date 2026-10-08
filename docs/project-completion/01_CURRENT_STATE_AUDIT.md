# 01. CURRENT STATE AUDIT

**Date:** 2026-10-08 / 2026-10-09 · **Status:** Authoritative Local Audit

---

## 1. Executive Summary

The **Seven Lands (سفن لاند)** project is a bilingual (Arabic-first, RTL) corporate website and professional Admin Control Center built on Next.js 16, Payload CMS 3, and PostgreSQL.

Following the migration to the local machine, the runtime environment was systematically rebuilt and verified:
- Node.js `v20.20.2` and npm `10.8.2` (managed via Volta).
- Git `2.47.1.windows.1` (MinGit user-scope toolchain).
- PostgreSQL `17.1` cluster initialized and serving locally (`127.0.0.1:5432`).
- Fresh local database `seven_lands_dev` reconstructed strictly from version-controlled migrations (all 9 applied) and guarded seeds executed.
- Next.js production build (`npm run build`) succeeded with 72/72 static/prerendered pages generated.
- Production server (`next start`) booted cleanly, serving `/ar` and `/en` at HTTP 200, and Payload Admin at `/admin` at HTTP 200.
- Playwright end-to-end smoke and axe accessibility suites executed: **55 passed / 5 skipped / 0 failed** across `ar-desktop`, `ar-mobile`, and `en-desktop`.
- Security, locale safety, media binary, and RBAC verification test suites executed: **100% green**.

---

## 2. What Exists and Works Today

### Public Frontend
- **20 Real Routes** served at HTTP 200 in both Arabic (`ar`, default RTL) and English (`en`, LTR).
- **SEO & Social Sharing:** Dynamic and static metadata, canonical URLs, 3 hreflang tags per route (`ar-SA`, `en`, `x-default`), Open Graph, Twitter Cards, robots.txt, and sitemap.xml.
- **Design & Layout:** Tailwind 4 design system, responsive viewports (390px, 768px, 1024px, 1440px), Motion animations honoring `prefers-reduced-motion`.
- **Pages CMS Authority:** Public pages (`home`, `about`, `contact`, `start-a-project`, `privacy`, `terms`) consume dynamic content from the Pages collection with seamless fallback to shipped static content.
- **Services CMS Authority:** The 7 capability domains (`strategy-business-growth`, `branding-creative`, `content-production`, `social-digital-presence`, `performance-acquisition`, `web-commerce-experiences`, `software-automation-technology`) are modelled in Payload, seeded as drafts, and integrated into public routes with fallback.

### Admin Control Center & Backend
- **Payload CMS 3 Admin UI:** Localized in Arabic RTL by default, fully functional at `/admin`.
- **Authentication & Sessions:** Payload cookie-based sessions, brute-force lockout, server-side revocation on user suspension.
- **RBAC:** 5 immutable system roles (`super_admin`, `admin`, `editor`, `marketing`, `viewer`) with granular permissions enforced on every collection, global, and endpoint.
- **Audit Logging:** Immutable append-only audit trail (`audit_events`) recording system actions.
- **Globals:** 6 singletons (`SiteSettings`, `ContactSettings`, `BusinessHours`, `SocialAccounts`, `Navigation`, `Footer`) live in DB and cached.
- **Media Library:** Private-by-default architecture, MIME sniffing, Sharp derivative generation, EXIF stripping, custom admin picker, and usage-tracking delete guards.

---

## 3. What Is Partial or Blocked

### 1. Lead Persistence (Defect D2 — RESOLVED IN PHASE H)
- Dedicated `leads` collection created in Payload CMS with PostgreSQL 17 backing table (`leads`).
- Public brief form submissions to `POST /api/brief` now durably persist to PostgreSQL before returning HTTP 200 `{ ok: true, reference: lead.reference }`.
- Permanent V1 status workflow active (`NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`, `SPAM`).
- Authorized CSV export endpoint implemented with Excel UTF-8 BOM and formula sanitization.
- Zero data loss, zero PII leakage, and audit logging verified live on local runtime.

### 2. GraphQL Endpoint (Defect D1 — High Severity API Defect)
- `POST /api/graphql` returns **HTTP 500**.
- Root Cause: Internal route registry values in `src/lib/content/route-registry.ts` contain colons (e.g., `capability:strategy-business-growth`), which violate GraphQL enum naming specifications, causing the GraphQL schema builder to crash. (REST APIs and Payload Admin are unaffected).

### 3. Projects & Insights Collections
- Schema, admin forms, and publish validators exist.
- Collections are currently empty (`0` records). Honest empty states are rendered on `/work` and `/insights`.

### 4. Owner Business Inputs (G1–G5)
- Official business email is absent.
- Full street address is absent (only city/region is present).
- Business hours and social account URLs are intentionally unpopulated (`0` rows).
- Legal pages (`/privacy`, `/terms`) carry an explicit placeholder notice and are flagged `noindex`.
- External production storage (S3/R2) and transactional email providers are not yet configured.

---

## 4. What Is Stale or Misleading in Old Documentation
1. **Lead Storage Claims:** Some prior phase summaries suggested submissions were durably stored. Verified reality: No lead collection exists.
2. **Phase F Status:** Previously marked as "unsealed / uncommitted". The code and migrations are present in the working tree, verified, and running against PostgreSQL.
3. **GraphQL Operability:** Older checklists listed GraphQL as an available interface. Verified reality: Crashes on schema generation due to enum naming rules.
