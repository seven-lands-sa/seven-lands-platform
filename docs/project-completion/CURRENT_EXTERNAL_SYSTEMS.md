# CURRENT EXTERNAL SYSTEMS RECONCILIATION AUDIT
**Seven Lands (سفن لاند)**  
**Authority:** Production Systems Verification & Status Ledger  
**Date:** October 9, 2026  
**Primary Domain:** `https://7-lands.com` (with `https://www.7-lands.com`)  
**Account Authority:** `sevenlands.sa@gmail.com`  

---

## 1. Executive Summary

All primary external infrastructure and cloud platforms for the Seven Lands production deployment have been provisioned, authenticated, verified, and reconciled. No blockers remain on credentials, domain DNS, database migrations, email routing, or cloud object storage.

| External Provider | Classification | Purpose | Primary Resource / Identifier |
| :--- | :--- | :--- | :--- |
| **Vercel** | `ACTIVE_AND_VERIFIED` | Production Hosting & SSR | `seven-lands-platform` / `https://7-lands.com` |
| **Neon PostgreSQL** | `ACTIVE_AND_VERIFIED` | Serverless Relational DB | `ep-polished-surf-b4sk4z7d-pooler` (13/13 migrations) |
| **IONOS** | `ACTIVE_AND_VERIFIED` | Registrar & Authoritative DNS | Domain `7-lands.com`, Contract `114003512` |
| **Resend** | `ACTIVE_AND_VERIFIED` | Transactional Email Service | Domain `7-lands.com` (verified), API key provisioned |
| **Cloudflare R2** | `ACTIVE_AND_VERIFIED` | S3-Compatible Media Storage | Bucket `seven-lands-media`, `pub-964959ba9f6f4e8784fd7dfd10e9cd1c.r2.dev` |
| **GitHub** | `ACTIVE_AND_VERIFIED` | Source Code & Release Authority | `seven-lands-sa/seven-lands-platform` (`master`) |
| **Persistent Browser** | `ACTIVE_AND_VERIFIED` | Operations & CDP Control Daemon | Brave Chromium on `127.0.0.1:9222`, `D:\seven-lands\browser-ops-profile` |

---

## 2. Detailed Service State & Configuration Ledger

### 2.1 Vercel Hosting & Deployment
- **Account Identity:** `sevenlands.sa@gmail.com`
- **Team / Scope:** `seven-lands` (Owner: `sevenlands.sa@gmail.com`)
- **Project Name:** `seven-lands-platform`
- **Primary Production Domain:** `https://7-lands.com` (Status: Valid Configuration, Active SSL)
- **Secondary / Redirect Domain:** `https://www.7-lands.com` (Status: Valid Configuration, Active SSL)
- **Deployment Aliasing:** Auto-promotes from `master` branch.
- **Environment Variables Injected:**
  - `DATABASE_URI`: Neon production connection string with connection pooler.
  - `PAYLOAD_SECRET`: 64-character cryptographic random key.
  - `NEXT_PUBLIC_SERVER_URL`: `https://7-lands.com`
  - `SITE_CANONICAL_URL`: `https://7-lands.com`
  - `RESEND_API_KEY`: Verified API key `re_aAW8BHx...`
  - `EMAIL_FROM`: `Seven Lands <info@7-lands.com>`
  - `CONTACT_EMAIL`: `sevenlands.sa@gmail.com`
  - `R2_ACCOUNT_ID`: `3f4115369739d3fd0f4b54ce5015964a`
  - `R2_ACCESS_KEY_ID`: `6527c264ec323637bc0ba18d90caa5e1`
  - `R2_SECRET_ACCESS_KEY`: `d16f0d1ff5bbc818dc24f3031361f3f2083892c98f207304fd71d773633986f3`
  - `R2_BUCKET_NAME`: `seven-lands-media`
  - `R2_PUBLIC_DOMAIN`: `pub-964959ba9f6f4e8784fd7dfd10e9cd1c.r2.dev`
  - `R2_ENDPOINT`: `https://3f4115369739d3fd0f4b54ce5015964a.r2.cloudflarestorage.com`
- **Live Health Status:** HTTP 200 OK verified across `/ar`, `/en`, `/`. React Error #185 resolved.

### 2.2 Neon PostgreSQL
- **Account Identity:** `sevenlands.sa@gmail.com`
- **Project ID:** `royal-moon-53744957`
- **Region:** `aws-us-east-2`
- **Production Branch:** `production` (`ep-polished-surf-b4sk4z7d`)
- **Development Branch:** `main` (`ep-autumn-hill-b413z0p5`)
- **Active Migration Ledger:**
  - Total Migrations: 13 migrations executed in exact chronological sequence.
  - Current Database Version: 13 / 13 applied, zero uncommitted schema drift.
  - `push: false` strictly enforced in production code.
- **Data Integrity Verification:**
  - Seeded initial admin role, administrative users, and baseline configuration globals.
  - Live lead submission tested via `POST /api/brief`; confirmed inserted into `leads` table.

### 2.3 IONOS Registrar & DNS
- **Account Customer ID:** `114003512`
- **Primary Domain:** `7-lands.com`
- **Configured Records:**
  - `A` record (`@`) &rarr; `76.76.21.21` (Vercel Anycast IP)
  - `CNAME` record (`www`) &rarr; `cname.vercel-dns.com` (Vercel DNS target)
  - `TXT` record (`resend._domainkey`) &rarr; `k=rsa; p=...` (Resend DKIM public key)
  - `TXT` record (`@` / SPF) &rarr; `v=spf1 include:amazonses.com ~all` (Resend SPF authorization)
  - `MX` record (`feedback`) &rarr; `feedback-smtp.us-east-1.amazonses.com` (Resend bounce handling, priority 10)
  - Deleted stale parking IPv6 `AAAA` record (`2607:f1c0:100f:f000:0:0:0:200`).
- **Email Forwarding:**
  - `info@7-lands.com` &rarr; forwarded directly to `sevenlands.sa@gmail.com`
  - `admin@7-lands.com` &rarr; forwarded directly to `sevenlands.sa@gmail.com`

### 2.4 Resend Transactional Email
- **Account Identity:** `sevenlands.sa@gmail.com`
- **Domain:** `7-lands.com`
- **Status:** Verified (Sending enabled, Receiving enabled, MX verified)
- **Sender Address:** `Seven Lands <info@7-lands.com>`
- **Notification Target:** `sevenlands.sa@gmail.com`

### 2.5 Cloudflare R2 Object Storage
- **Account Identity:** `sevenlands.sa@gmail.com`
- **Account ID:** `3f4115369739d3fd0f4b54ce5015964a`
- **Bucket Name:** `seven-lands-media`
- **Location:** Western Europe (WEUR)
- **Pricing Tier:** Free Tier (10 GB storage, 1M Class A ops, 10M Class B ops/mo, zero egress fees)
- **Public URL:** `https://pub-964959ba9f6f4e8784fd7dfd10e9cd1c.r2.dev`
- **S3 Endpoint:** `https://3f4115369739d3fd0f4b54ce5015964a.r2.cloudflarestorage.com`
- **Credentials:** Dedicated Account API Token provisioned with Object Read & Write permissions.

### 2.6 GitHub Repository Authority
- **Organization / Account:** `seven-lands-sa`
- **Repository:** `seven-lands-platform`
- **Remote URL:** `https://github.com/seven-lands-sa/seven-lands-platform.git`
- **Branch Strategy:** `master` represents production-ready release head.
- **Authentication:** Dedicated SSH key + HTTPS credential store configured.

---

## 3. Operational Invariants & Safeguards

1. **No Silent Mutation:** Direct schema edits (`push: true`) remain disabled.
2. **Referential Stability:** React 19 client listeners (`useSyncExternalStore`) strictly maintain cached references for cookies/consent.
3. **Owner Billing Protection:** Zero billable actions initiated without explicit approval; all provisioned cloud resources operate within free/standard allowance.
