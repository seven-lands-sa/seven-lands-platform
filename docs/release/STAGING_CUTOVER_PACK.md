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
SITE_CANONICAL_URL=https://sevnland.com
RUNTIME_ORIGIN=https://sevnland.com
NEXT_PUBLIC_APP_URL=https://sevnland.com

# Database Connection (Managed PostgreSQL 16 or 17)
DATABASE_URI=postgresql://<user>:<password>@<host>:5432/<dbname>?sslmode=require

# Payload CMS Security Secret (Cryptographically random 64-char string)
PAYLOAD_SECRET=<generated_high_entropy_secret>

# Trusted Origins (Must match canonical domains and staging previews)
PAYLOAD_TRUSTED_ORIGINS=https://sevnland.com,https://staging.sevnland.com

# Node Environment
NODE_ENV=production
```

---

## 3. Owner Gates Checklist (Operational Sign-Offs)

Before DNS cutover, the owner must provide/approve the following 5 items:

- [ ] **Owner Gate G1 (Real Business Data):**
  - Verify confirmed office business hours in `/admin/globals/business-hours`.
  - Add official social media handles (LinkedIn, X/Twitter, Instagram) in `/admin/globals/social-accounts`.
  - Enter initial real client projects in `/admin/collections/projects` when NDAs permit.

- [ ] **Owner Gate G2 (Cloud Media Storage Adapter):**
  - Provision an S3-compatible bucket (Cloudflare R2 or AWS S3).
  - Configure `@payloadcms/plugin-cloud-storage` with bucket name, access key ID, secret key, and public asset CDN domain.

- [ ] **Owner Gate G3 (Legal & Compliance Review):**
  - Review Arabic and English copy on `/privacy` and `/terms` with legal counsel.
  - Confirm privacy consent banner copy in `/admin/globals/consent-settings`.

- [ ] **Owner Gate G4 (Transactional Email):**
  - Provide SMTP or Resend API key for Payload CMS (`nodemailerAdapter` or `@payloadcms/email-nodemailer`).
  - Configure sender address: `notifications@sevnland.com`.
  - Verifies admin password reset link delivery.

- [ ] **Owner Gate G5 (DNS & Staging Restore Drill):**
  - Restore `drill_pre_release.dump` to the staging database using `pg_restore`.
  - Perform live verification on physical iOS (Safari) and Android (Chrome) devices.
  - Update DNS A / CNAME records on domain registrar from legacy WordPress Hostinger instance to the new server IP / CDN.

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
