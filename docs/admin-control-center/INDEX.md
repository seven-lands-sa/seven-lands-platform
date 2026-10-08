# Admin Control Center — Planning Index

> Documents 00–20 are the **plan**. They are not a claim about what exists — for that, read the
> phase reports at the bottom of this table. Phases A and B have been executed and passed; no
> business collection, content migration or public-site change has been made, and nothing has been
> deployed.

Read in order:

| # | Document | Contents |
| --- | --- | --- |
| — | [README.md](README.md) | How to read this pack, status, and the one-line decision |
| 00 | [00_CURRENT_PROJECT_AUDIT.md](00_CURRENT_PROJECT_AUDIT.md) | The real repository audit + technical-debt register D1–D10 |
| 01 | [01_ADMIN_VISION_AND_SCOPE.md](01_ADMIN_VISION_AND_SCOPE.md) | What the business wants to control, the 8-task success test, what is out of scope |
| 02 | [02_ARCHITECTURE_OPTIONS.md](02_ARCHITECTURE_OPTIONS.md) | Options A/B/C compared on equal dimensions |
| 03 | [03_RECOMMENDED_ARCHITECTURE.md](03_RECOMMENDED_ARCHITECTURE.md) | **The decision record** (RECOMMENDED / WHY / REJECTED) |
| 04 | [04_INFORMATION_ARCHITECTURE.md](04_INFORMATION_ARCHITECTURE.md) | Admin sidebar and screens in Arabic business language |
| 05 | [05_DATA_MODEL.md](05_DATA_MODEL.md) | Collections, relationships, validation, localization rules |
| 06 | [06_CONTENT_BLOCK_SYSTEM.md](06_CONTENT_BLOCK_SYSTEM.md) | The block catalogue and controlled flexibility |
| 07 | [07_GLOBAL_SETTINGS_MODEL.md](07_GLOBAL_SETTINGS_MODEL.md) | Settings, contact, business hours, social accounts, branding |
| 08 | [08_MEDIA_ARCHITECTURE.md](08_MEDIA_ARCHITECTURE.md) | Uploads, derivatives, alt text, usage, deletion protection |
| 09 | [09_USERS_ROLES_PERMISSIONS.md](09_USERS_ROLES_PERMISSIONS.md) | Roles, permissions matrix, RBAC rules |
| 10 | [10_SEO_AND_SOCIAL_SHARING.md](10_SEO_AND_SOCIAL_SHARING.md) | SEO centre, previews, fallback hierarchy, redirects |
| 11 | [11_ANALYTICS_AND_REPORTING.md](11_ANALYTICS_AND_REPORTING.md) | GA4/Search Console connection, honest states |
| 12 | [12_TRACKING_PIXELS_AND_SCRIPTS.md](12_TRACKING_PIXELS_AND_SCRIPTS.md) | Pixels, consent, CSP implications, script governance |
| 13 | [13_LEADS_AND_FORMS.md](13_LEADS_AND_FORMS.md) | Leads module (explicitly not a CRM) and form management |
| 14 | [14_SECURITY_MODEL.md](14_SECURITY_MODEL.md) | Threats, controls, secrets, audit log, `/admin` boundary |
| 15 | [15_DRAFTS_REVISIONS_PUBLISHING.md](15_DRAFTS_REVISIONS_PUBLISHING.md) | Lifecycle, preview, autosave, revisions, rollback |
| 16 | [16_MIGRATION_PLAN.md](16_MIGRATION_PLAN.md) | Moving today's content into the CMS with a verified rollback |
| 17 | [17_IMPLEMENTATION_PHASES.md](17_IMPLEMENTATION_PHASES.md) | Phases A–N with complexity and dependencies |
| 18 | [18_QA_AND_ACCEPTANCE_CRITERIA.md](18_QA_AND_ACCEPTANCE_CRITERIA.md) | Executable acceptance criteria and test plan |
| 19 | [19_RISKS_AND_OPEN_DECISIONS.md](19_RISKS_AND_OPEN_DECISIONS.md) | Technical decisions made vs owner decisions needed |
| 20 | [20_FINAL_IMPLEMENTATION_MASTER_PLAN.md](20_FINAL_IMPLEMENTATION_MASTER_PLAN.md) | The consolidated master plan |
| — | **[PHASE_A_SPIKE_REPORT.md](PHASE_A_SPIKE_REPORT.md)** | **Phase A result** — the architecture spike executed against this exact project: verdict PASS, evidence, findings, carry-forward items |
| — | [phase-a/](phase-a/) | Sources of the Phase A probe routes (archived before the probes were deleted) |
| — | **[phase-b/PHASE_B_REPORT.md](phase-b/PHASE_B_REPORT.md)** | **Phase B result** — authentication, users, RBAC and the security foundation, §A–R |
| — | [phase-b/AUTH_ARCHITECTURE.md](phase-b/AUTH_ARCHITECTURE.md) | How auth and authorization actually work, file by file |
| — | [phase-b/PERMISSION_MATRIX.md](phase-b/PERMISSION_MATRIX.md) | The 36 permissions × 5 roles, generated from the live database |
| — | [phase-b/SECURITY_VERIFICATION.md](phase-b/SECURITY_VERIFICATION.md) | What was tested, how, and the defects it found |
| — | [security/DEPENDENCY_ADVISORY_TRIAGE.md](security/DEPENDENCY_ADVISORY_TRIAGE.md) | Advisory triage: 20 → 13 (prod 16 → 9) |

> **Status (2026-10-07):** the owner amended the pack (localization, proof-blocks, custom scripts,
> analytics scope, leads boundary). **Phase A executed and passed**; **Phase B executed and passed**
> (`phase-b/PHASE_B_REPORT.md`, verdict PASS, `PRODUCTION_MUTATED = NO`). Phase B stopped for the
> three decisions listed in that report §R. The pack remains the architecture authority for the later
> phases; amend it in place, never rewrite it.
