# 11. CANONICAL OWNER GATES REGISTRY

This document establishes the single authoritative registry of owner-controlled business gates, credentials, and legal signoffs for Seven Lands. Engineering implementation strictly does not invent these values.

---

## Authoritative Owner Gate Definitions

| Gate ID | Domain | Required Decisions & Assets | Impact if Unset | Launch Severity |
|---|---|---|---|---|
| **G1_BUSINESS_DATA** | **Business Identity & Content** | • Official business contact email (`info@sevenlands.sa` / `contact@...`)<br>• Full commercial street address in Buraydah, Al-Qassim<br>• Confirmed business operating hours<br>• Official social media profile handles (LinkedIn, X, Instagram)<br>• Real client portfolio / case studies & articles when available | Contact & footer fields remain omitted; portfolio & insights show honest empty states. | Degrades commercial trust; does not crash runtime. |
| **G2_PRODUCTION_STORAGE** | **Cloud Media & Asset Storage** | • S3-compatible cloud storage provider selection (Cloudflare R2 recommended, or AWS S3)<br>• Region, bucket name, access credentials<br>• Public CDN domain / subdomain & signed URL policy | Uploads remain on local disk (`./media`), which is ephemeral in cloud containers. | **BLOCKER for production media persistence**. |
| **G3_LEGAL_APPROVAL** | **Legal & Compliance Signoff** | • Formal owner review & signoff of Privacy Policy (`/privacy`)<br>• Formal owner review & signoff of Terms & Conditions (`/terms`)<br>• Search engine indexing approval (`noindex` removal) | Legal terms remain preliminary; search indexing remains unapproved. | **BLOCKER for public commercial release**. |
| **G4_TRANSACTIONAL_EMAIL** | **Email Notifications & Delivery** | • Email service provider selection (Resend, Postmark, or SendGrid)<br>• Verified sender address (`notifications@sevenlands.sa`) & SPF/DKIM records<br>• API credentials | System writes emails to console; admin password resets and lead notification emails cannot send. | **BLOCKER for unattended admin operations**. |
| **G5_HOSTING_AND_CUTOVER** | **Infrastructure & DNS Cutover** | • Target Staging and Production hosting platform (Railway, Vercel, VPS)<br>• Managed PostgreSQL instance & automated backup policy<br>• DNS cutover authorization from legacy WordPress to Next.js<br>• Physical device manual testing signoff (iOS Safari, Android Chrome) | Deployment cannot proceed beyond local runtime. | **BLOCKER for Staging & Production cutover**. |
| **G6_ANALYTICS_ACCESS** | **Measurement & Search Verification** | • Google Analytics 4 (GA4) Measurement ID (`G-XXXXXXXXXX`)<br>• Google Search Console ownership verification token<br>• GTM, Clarity, or Pixel IDs if marketing campaigns are activated | Site operates with zero analytics; no visitor attribution or search indexing tracking. | Optional for internal staging; recommended before marketing spend. |

---

## Operating Invariants

1. **Zero Fake Data:** Under no circumstances will engineering generate fake phone numbers, fictional client reviews, mock case studies, or dummy email addresses.
2. **Honest Empty States:** Where business content is pending (Projects, Insights, Social Handles), the UI renders polished, transparent empty states.
3. **Production Guard:** `PRODUCTION_READY = NO` remains permanently enforced until gates `G1_BUSINESS_DATA` through `G5_HOSTING_AND_CUTOVER` are satisfied.
