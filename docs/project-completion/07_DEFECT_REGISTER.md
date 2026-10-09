# 07. DEFECT REGISTER

Authoritative tracking of known defects, security bugs, and architectural anomalies identified during onboarding and verification.

---

## Active Defect Register

### [D1] GraphQL Endpoint Crashes with HTTP 500
- **Severity:** HIGH (API / Integration)
- **Status:** `FIXED` (Verified Live on Local Runtime)
- **Area:** `POST /api/graphql`
- **Description:** Any query sent to the GraphQL endpoint previously resulted in an unhandled internal error (HTTP 500) during GraphQL schema construction.
- **Root Cause:** In `src/lib/content/route-registry.ts`, internal route key choices contained colons (e.g., `capability:strategy-business-growth`). Payload uses these select option values to construct GraphQL enum identifiers. Colons are illegal characters in GraphQL enum names (`/[_A-Za-z][_0-9A-Za-z]*/`), triggering a validation exception during GraphQL schema construction.
- **Resolution (Amendment A Compliant):**
  1. Preserved route identity, public paths (`/services/${slug}`), and stored meaning.
  2. Sanitized internal capability route enum keys from `capability:${slug}` to `capability_${slug}` to comply with GraphQL enum specification `[_a-zA-Z0-9]`.
  3. Applied explicit database migration `20261008_223729_phase_g_graphql_enum_sanitize.ts` using SQL `REPLACE("route", 'capability:', 'capability_')` to safely update stored enum values in PostgreSQL.
  4. Maintained backward compatibility in `internalRoute()` helper.
  5. Tested GraphQL queries: 5/5 PASSED with HTTP 200 responses.
- **Execution Target:** Phase G (SEALED).

---

### [D2] Form Submissions Dropped Without Durable Lead Persistence
- **Severity:** HIGH / CRITICAL (Commercial Launch Blocker)
- **Status:** `FIXED` (Verified Live on Local Runtime)
- **Area:** Public Project Brief (`/start-a-project` & `POST /api/brief`)
- **Description:** Validated brief submissions return `{ ok: true, delivered: false }` (HTTP 202) when no external webhook is configured. No database row is created; no email notification is transmitted.
- **Root Cause:** A dedicated `leads` collection / table was not part of Phases A–F. It was scheduled for Phase H.
- **Impact:** Prospective client inquiries submitted via the web form were previously lost unless the visitor initiated the optional WhatsApp handoff.
- **Resolution:** Implemented Phase H:
  1. Created dedicated `leads` collection (`src/collections/Leads.ts`) in Payload CMS with PostgreSQL 17 backing table.
  2. Applied database migration `20261008_220122_phase_h_leads_collection.ts`.
  3. Integrated V1 Status Model: `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`, `SPAM`.
  4. Updated `POST /api/brief` route to guarantee durable persistence in PostgreSQL before returning HTTP 200 `{ ok: true, reference: lead.reference }`. Failure in secondary notifications (webhook/email) never causes lead loss.
  5. Implemented authorized CSV export endpoint (`GET /api/leads/export`) with Excel UTF-8 BOM and formula sanitization.
  6. Verified zero data loss, zero PII leakage, and complete audit logging (`lead_created`, `lead_status_changed`, `lead_exported`).
- **Execution Target:** Phase H (SEALED).

---

### [D3] Honeypot Unreachable Due to Pre-Parsing Refusal
- **Severity:** HIGH (Spam Protection)
- **Status:** `FIXED` (Verified)
- **Area:** `src/features/brief/schema.ts`
- **Description:** Bot submissions filling the hidden `website` field previously triggered a 422 validation error before reaching the silent-drop handler.
- **Resolution:** Updated Zod schema to accept arbitrary strings in `website`, allowing the route handler to cleanly catch bots and return silent HTTP 200 without alerting them.

---

### [D4] Multi-Locale Concurrent Publication Overwrite
- **Severity:** MEDIUM (Localization Data Integrity)
- **Status:** `FIXED` (Verified)
- **Area:** `src/lib/pages/publish.ts` & `src/lib/services/publish.ts`
- **Description:** Publishing in English previously risked resetting or corrupting Arabic publication flags.
- **Resolution:** Rewritten to merge locale publication states explicitly and verify array row IDs prior to committing.

---

### [D5] Media Usage Registry Missing Nested Block Image References
- **Severity:** MEDIUM (Media Integrity)
- **Status:** `FIXED` (Verified)
- **Area:** `src/lib/media/usage.ts`
- **Description:** Images used in deeply nested blocks (such as Hero cover images) were not registered in usage counts, permitting accidental deletion.
- **Resolution:** Usage scanner expanded to recurse through all block array fields across Pages, Services, Projects, and Insights.

---

### [D6] Project Brief Form Copy Hardcoded in Component
- **Severity:** LOW (Content Authority Debt)
- **Status:** `OPEN`
- **Area:** `src/components/forms/ProjectBriefForm.tsx`
- **Description:** Form field labels, placeholders, and step headers are hardcoded in the component instead of being retrieved from the CMS or localized message dictionaries.
- **Impact:** Editors cannot modify form copy from the Admin panel.
- **Recommended Fix:** Connect step labels and hints to CMS fields in `start-a-project` page blocks.
- **Execution Target:** Phase H / Phase L.

---

### [D7] OpenGraph Images 404 on Uncutover Live Domain
- **Severity:** MEDIUM (Social Sharing Quality)
- **Status:** `OPEN` (External Dependency)
- **Area:** `https://sevnland.com/og/og-ar.png` & `og-en.png`
- **Description:** Metadata points to canonical production domain for OG images. Because `sevnland.com` still hosts the legacy WordPress site, crawlers trying to fetch the image receive HTTP 404.
- **Impact:** Social shares display fallback or missing link previews until production deployment cutover occurs.
- **Resolution:** Auto-resolves upon public deployment of Next.js assets to the canonical domain.
