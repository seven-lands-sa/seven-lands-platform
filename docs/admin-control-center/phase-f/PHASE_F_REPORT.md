# Phase F Seal Report: Services, Projects & Insights Collections

**Date:** 2026-10-09  
**Status:** SEALED  
**System:** Seven Lands / سفن لاند (Next.js 16 + Payload CMS 3 + PostgreSQL 17)  

---

## 1. Executive Summary

Phase F (Domain Content Collections: Services, Projects, Insights) has been thoroughly audited, verified against local live PostgreSQL 17 runtime, and is hereby **SEALED**.

All collection definitions, schema migrations, seeded reference data, localization behavior, and frontend consumer routes are intact and operational.

---

## 2. Inventory & State of Record

### Collections Verified
1. **Services (`src/collections/Services.ts`)**:
   - Slug: `services`
   - Fields: Title, Slug, Land Tag, Excerpt, Hero/Narrative, Deliverables, Outcomes, FAQ, Order, Draft/Publish workflow.
   - Status: Active & Populated (7 seeded services matching the Seven Lands capability architecture).
2. **Projects (`src/collections/Projects.ts`)**:
   - Slug: `projects`
   - Fields: Title, Slug, Client, Industry, Capabilities (relation to Services), Summary, Challenge, Solution, Results, Showcase Media.
   - Status: Active (0 rows in initial dev baseline; awaiting owner portfolio content G1).
3. **Insights (`src/collections/Insights.ts`)**:
   - Slug: `insights`
   - Fields: Title, Slug, Published Date, Authors, Categories, Content (rich text & blocks), Cover Image, Draft/Publish workflow.
   - Status: Active (0 rows in initial dev baseline; awaiting editorial content).

### Migrations Included
- `20261008_103522_phase_f_services_projects_insights.ts` (Creates tables: `services`, `services_locales`, `projects`, `projects_locales`, `insights`, `insights_locales`, and relation joins).
- `20261008_103658_phase_f_service_glyph_registry.ts` (Configures glyph registry and SVG symbol associations).

---

## 3. Verification Gates Results

| Gate / Check | Target | Actual Result | Status |
|---|---|---|---|
| PostgreSQL Cluster | 127.0.0.1:5432 | Accepting connections | PASS |
| Applied Migrations | 9 total | 9 applied (`payload_migrations` = 9) | PASS |
| Services Row Count | 7 capability lands | 7 rows | PASS |
| Projects Row Count | Schema active | 0 rows (ready for G1) | PASS |
| Insights Row Count | Schema active | 0 rows (ready for editorial) | PASS |
| TypeScript Check | `npm run typecheck` | 0 errors | PASS |
| ESLint Check | `npm run lint` | 0 errors (1 compiler hint) | PASS |
| Next.js Production Build | `npm run build` | 72/72 static & ISR pages generated | PASS |
| Playwright E2E & Smoke | `npm run test:e2e` | 55 passed, 0 failed, 5 skipped | PASS |
| Production Mutated | Remote live check | NO (local runtime isolated) | PASS |

---

## 4. Sealing Declaration

Phase F is formally locked and sealed. No further modifications are permitted to Phase F domain content schemas without an approved migration. Development proceeds directly to **Phase H (Durable Leads & Form Persistence)**.
