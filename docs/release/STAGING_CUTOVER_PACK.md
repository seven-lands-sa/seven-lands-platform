# Seven Lands — Staging & Production Cutover Pack

**Target:** Staging Deployment & Production Release Cutover  
**System:** Seven Lands / سفن لاند (Next.js 16 + Payload CMS 3 + PostgreSQL 17)  
**Document Version:** 1.0  
**Authority:** Master Completion Plan — Milestone 5  

---

## 1. Overview & Purpose

This pack provides the exact, non-destructive step-by-step procedure for deploying the Seven Lands Local Release Candidate (RC) to staging and performing the final cutover to production without downtime, data loss, or regression.

---

## 2. Pre-Requisites & Environment Configuration

### Target Environment Variables (`.env.production`):
```bash
# Public & Canonical Identity
SITE_CANONICAL_URL=https://7-lands.com
RUNTIME_ORIGIN=https://7-lands.com
NEXT_PUBLIC_APP_URL=https://7-lands.com

# Database Connection (Managed PostgreSQL 16 or 17 - Neon Serverless)
DATABASE_URI=postgresql://<user>:<password>@<host>:5432/<dbname>?sslmode=require

# Payload CMS Security Secret (Cryptographically random 64-char string)
PAYLOAD_SECRET=<generated_high_entropy_secret>

# Trusted Origins (Must match canonical domains and staging previews)
PAYLOAD_TRUSTED_ORIGINS=https://7-lands.com,https://staging.7-lands.com,https://www.7-lands.com

# Node Environment
NODE_ENV=production
```

---

## 3. Owner Gates Checklist (Operational Sign-Offs)

Before DNS cutover, the owner gates must be resolved:

- [ ] **Owner Gate G1_BUSINESS_DATA (Business Identity & Content):**
  - Verify confirmed office business hours in `/admin/globals/business-hours`.
  - Add official social media handles (LinkedIn, X/Twitter, Instagram) in `/admin/globals/social-accounts`.
  - Enter initial real client projects in `/admin/collections/projects` when NDAs permit.

- [ ] **Owner Gate G2_PRODUCTION_STORAGE (Cloud Media Storage Adapter):**
  - Provision an S3-compatible bucket (Cloudflare R2 recommended).
  - Configure cloud storage with bucket name, access key ID, secret key, and public asset CDN domain.

- [ ] **Owner Gate G3_LEGAL_APPROVAL (Legal & Compliance Review):**
  - Review Arabic and English copy on `/privacy` and `/terms` for `7-lands.com`.
  - Confirm privacy consent banner copy in `/admin/globals/consent-settings`.

- [ ] **Owner Gate G4_TRANSACTIONAL_EMAIL (Transactional Email):**
  - Configure Resend API key for Payload CMS and application notifications.
  - Configure sender address: `notifications@7-lands.com`.
  - Verifies admin password reset and lead notification delivery.

- [ ] **Owner Gate G5_HOSTING_AND_CUTOVER (DNS & Hosting Cutover):**
  - Deploy to Vercel connected to Neon PostgreSQL.
  - Perform live verification on physical iOS (Safari) and Android (Chrome) devices.
  - Configure DNS records on IONOS domain registrar (`7-lands.com`).

- [ ] **Owner Gate G6_ANALYTICS_ACCESS (Analytics & Search Verification):**
  - Provision Google Analytics 4 ID and Search Console verification token.

---

## 4. Staging Deployment Execution Sequence

### Step 1: Provision Managed Database
```bash
# Create staging database
createdb -U postgres seven_lands_staging

# Restore the verified Release Candidate baseline dump
pg_restore -U postgres -d seven_lands_staging -v d:/seven-lands/backups/drill_pre_release.dump
```

### Step 2: Run Database Migrations
```bash
# Ensure zero pending migrations
npx payload migrate
```

### Step 3: Build & Start Production Artifact
```bash
# Install exact dependencies
npm ci

# Build optimized production bundle with Turbopack and PPR
npm run build

# Start production server
npm run start -- --port 3000
```

### Step 4: Smoke Test Staging Endpoint
```bash
# Execute automated smoke tests against staging URL
QA_BASE=https://staging.sevnland.com npx playwright test tests/smoke.spec.ts
```

---

## 5. DNS Cutover & Rollback Plan

### Production Cutover Steps:
1. Lower TTL on `sevnland.com` DNS records to 300 seconds 24 hours prior to cutover.
2. Put legacy WordPress site in read-only mode.
3. Switch DNS `A` records to point to the new Seven Lands hosting server.
4. Verify SSL certificate auto-issuance (Let's Encrypt / Cloudflare).
5. Verify `/sitemap.xml`, `/robots.txt`, and submit test lead on `/ar/start-a-project`.
6. Confirm lead reaches PostgreSQL `leads` table with generated reference ID.

### Rollback Strategy (Zero Risk):
- If critical issues occur within the first 60 minutes, revert DNS `A` record back to the Hostinger IP (`TTL = 300`).
- No changes were made to Hostinger files or legacy database; the legacy site remains intact until cutover sign-off.
