# Seven Lands — Admin Control Center (planning)

**Status: PLANNING ONLY. Nothing in this folder has been implemented.**
No dependencies were installed, no database created, no authentication added, no frontend
behaviour changed. These documents are the deliverable of the architecture phase and require
owner review before any code is written.

Read in this order:

1. `00_CURRENT_PROJECT_AUDIT.md` — what actually exists today, measured from the repository.
2. `01_ADMIN_VISION_AND_SCOPE.md` — what the control center is for, and what it deliberately is not.
3. `02_ARCHITECTURE_OPTIONS.md` — the three realistic paths, compared honestly.
4. `03_RECOMMENDED_ARCHITECTURE.md` — the decision, with reasons and rejected alternatives.
5. `04_INFORMATION_ARCHITECTURE.md` — the sidebar and the business language of the admin.
6. `05_DATA_MODEL.md` — entities, relationships, and how localization is stored.
7. `06_CONTENT_BLOCK_SYSTEM.md` — pages composed of typed blocks (controlled flexibility).
8. `07_GLOBAL_SETTINGS_MODEL.md` — site settings, contact, hours, branding, SEO defaults.
9. `08_MEDIA_ARCHITECTURE.md` — media library, storage, processing, safety.
10. `09_USERS_ROLES_PERMISSIONS.md` — RBAC with real resource/action permissions.
11. `10_SEO_AND_SOCIAL_SHARING.md` — page SEO, fallback hierarchy, OG media.
12. `11_ANALYTICS_AND_REPORTING.md` — GA4 + Search Console + the lead funnel.
13. `12_TRACKING_PIXELS_AND_SCRIPTS.md` — governed integrations, consent, custom code.
14. `13_LEADS_AND_FORMS.md` — the brief pipeline and lead management.
15. `14_SECURITY_MODEL.md` — the public/admin boundary, secrets, uploads, headers.
16. `15_DRAFTS_REVISIONS_PUBLISHING.md` — draft, preview, schedule, restore.
17. `16_MIGRATION_PLAN.md` — moving today's hardcoded content without breaking anything.
18. `17_IMPLEMENTATION_PHASES.md` — ordered phases with dependencies and complexity.
19. `18_QA_AND_ACCEPTANCE_CRITERIA.md` — definition of done per module.
20. `19_RISKS_AND_OPEN_DECISIONS.md` — what can go wrong, and what only the owner can decide.
21. `20_FINAL_IMPLEMENTATION_MASTER_PLAN.md` — the master plan and the decision record.

**One-line summary of the recommendation:**

> Build the Seven Lands Admin Control Center on **Payload CMS 3, embedded inside the existing
> Next.js application**, behind a thin content-adapter layer in the frontend, with the current
> typed static content kept as a fallback provider until migration is verified.

---

## Phase A status (2026-10-07)

Phase A of `17_IMPLEMENTATION_PHASES.md` — the architecture spike — has been **executed and passed**
against this exact project. Read `PHASE_A_SPIKE_REPORT.md` for the verdict, evidence and the
carry-forward list. The public website is unchanged; the static content provider is still
authoritative.
