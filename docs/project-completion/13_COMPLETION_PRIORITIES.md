# 13. COMPLETION PRIORITIES

Work must be sequenced strictly according to commercial risk, data loss prevention, and launch blockers—NOT arbitrary phase letters.

---

## Priority Tiers

### P0 — Immediate / Launch Blockers (Commercial & Operational Risk)
1. **Seal Phase F Baseline:** Commit current verified working-tree changes to Git to secure the local repository foundation.
2. **Leads Persistence & Notification (Phase H / Defect D2):**
   - Create `Leads` collection in Payload CMS with PostgreSQL schema and migration.
   - Enforce permanent V1 workflow statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`, `SPAM`.
   - Store every validated `/api/brief` submission in PostgreSQL with full audit logging before returning success response. Secondary notification failure must never drop a lead.
   - Implement admin review interface in Payload with lead statuses and click-to-dial/WhatsApp links.
3. **Resolve GraphQL Schema Crash (Defect D1):**
   - When addressed in Phase G, preserve route identity and stored meaning; no blind direct rename of `capability:slug` (Amendment A).
4. **Production Media Storage Adapter (Owner Gate G2):**
   - Integrate Cloudflare R2 / AWS S3 plugin for Payload CMS to ensure persistent file storage.
5. **Transactional Email Configuration (Owner Gate G4):**
   - Configure email transport for admin password resets and lead notifications (unconfigured email is non-blocking for lead persistence).
6. **Disaster Recovery & Backup Automation (Owner Gate G5):**
   - Establish verified database dump and restore pipeline for production.

---

### P1 — Post-Launch / Operational Integrity (First 2 Weeks)
1. **SEO Control Center & Redirect Manager (Phase G):**
   - Admin UI for managing custom 301/308 redirects, custom URL metadata overrides, and Search Console monitoring.
2. **Analytics & Dashboard (Phase I) & Consent (Phase J):**
   - Connect GA4 measurement ID and build a privacy-first executive traffic overview in the Admin panel.
   - Deploy cookie consent banner synchronized with analytics activation.
   - **Launch Policy (Amendment D):** Non-blocking for normal organic launch, but strictly mandatory prior to launching any paid ads / marketing campaigns.
4. **Admin Search & Site Health Diagnostics (Phase K):**
   - Global admin search, broken link checker, and orphaned media detection.
5. **Real Business Data Integration (Owner Gate G1):**
   - Populate confirmed business hours, social profiles, and real portfolio case studies as provided by the owner.

---

### P2 — Polish & Long-Term Hardening
1. **CSP Nonce Implementation (Phase M):**
   - Migrate Next.js inline script hydration to cryptographic nonces, eliminating `'unsafe-inline'`.
2. **Scheduled Publishing Automation:**
   - Background worker for scheduled post and page releases.
3. **Living Design System Documentation:**
   - Formalize component and token guidelines for onboarding future design/frontend contributors.
