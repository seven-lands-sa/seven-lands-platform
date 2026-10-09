# Seven Lands — Agent Operational Authority & Invariants

This file establishes the authoritative operating rules and system invariants for any AI agent or software engineer working on the Seven Lands platform.

---

## 1. Project Authority & Hierarchy

- **Canonical Domain Authority**: `https://7-lands.com` is the sole canonical production domain.
- **Legacy Domain**: `sevnland.com` (and its WordPress instance) is FROZEN. Do not touch, mutate, or cut over `sevnland.com`.
- **Authoritative Docs**:
  - `docs/project-completion/`: Master Completion Plan & Phase Ledgers.
  - `docs/production/`: Infrastructure, DNS, Email, Database, and Deployment Playbooks.

---

## 2. Core Architectural Invariants

1. **Database Schema Policy (`push: false`)**:
   - `PAYLOAD_PUSH` is permanently `false`.
   - All database schema mutations MUST be executed via versioned migration files in `src/migrations/`.
   - Never run raw destructive DDL without an approved rollback path.

2. **Dual-Origin Invariant**:
   - `SITE_CANONICAL_URL`: Always set to `https://7-lands.com` in production. Used by SEO, sitemaps, OpenGraph, hreflang.
   - `RUNTIME_ORIGIN`: Transient process address. Never publish this in canonical tags or sitemaps.

3. **Durable Lead Persistence**:
   - All contact forms and project briefs must write directly to PostgreSQL before any external API / notification dispatch.
   - External notification failure (Resend, webhooks) must NEVER mark a lead submission as failed or swallow the persisted record.

4. **Media Security & Storage**:
   - Media is private by default. Access is enforced at the binary handler level with `private, no-store` headers.
   - Hosted environments use Cloudflare R2 S3 storage adapter.
   - Sharp image processing strips EXIF data automatically.

5. **Strict Bilingual & Localization Discipline**:
   - Arabic (`ar`) is the default locale (RTL-first).
   - English (`en`) is the secondary locale (LTR).
   - In Payload Local/REST API: Always specify `?locale=` explicitly. Array rows must preserve IDs across languages.

6. **Zero Fake Business Data**:
   - Never hallucinate addresses, registration numbers, fake client testimonials, or unverified staff counts.
   - Known verified contact: Phone/WhatsApp `+966507776891`, Email `info@7-lands.com`.

---

## 3. Production Safety & Owner Gates

1. **Zero Cost Invariant**: Never purchase paid add-ons, plan upgrades, or domain services. Stay strictly within free tiers.
2. **Secrets Invariant**: Never commit `.env`, API keys, database credentials, passwords, or private tokens to Git.
3. **Rollback Invariant**: Before modifying DNS on IONOS, always record existing records in `docs/production/DNS_LEDGER.md`.

---

## 4. Standard Verification Commands

```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build

# Authoritative Gate Checks
npx tsx src/scripts/verify-phase-g.ts
npx tsx src/scripts/verify-phase-e.ts
npx tsx src/scripts/verify-media-binary.ts
```
