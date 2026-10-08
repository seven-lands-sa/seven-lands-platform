# 11. OWNER GATES

This document outlines the strict, minimal set of business inputs, credentials, and legal decisions required from the business owner. Engineering implementation does not invent these values.

---

## Minimal Owner Decisions Registry

| Gate ID | Area | Required Decision / Input | Impact if Unset | Blocks Public Launch? |
|---|---|---|---|---|
| **G1** | **Business Profile Data** | Official business email, detailed street address in Buraydah, confirmed business hours, official social media handles (LinkedIn, X, Instagram). | Values remain omitted or show "to be confirmed"; empty states displayed honestly. | No (can launch with empty states, but degrades brand trust). |
| **G2** | **Production Storage** | Selection of object storage provider (Cloudflare R2 recommended for zero egress fees, or AWS S3), bucket name, region, and CDN subdomain. | Media remains on local disk (`./media`), which is ephemeral in cloud containers. | **YES (for media)**. |
| **G3** | **Analytics & Measurement** | Google Analytics 4 (GA4) Measurement ID (`G-XXXXXXXXXX`) and Google Search Console ownership verification token. | Site collects zero analytics; no visitor attribution or search indexing monitoring. | No (launch can proceed, but traffic will be unmeasured). |
| **G4** | **Transactional Email** | Provider API key (Resend, Postmark, or SendGrid) and verified sender address (`notifications@sevnland.com`). | Admin password recovery fails silently; lead notifications cannot be delivered by email. | **YES**. |
| **G5** | **Hosting & Domain Cutover** | Target hosting platform selection (Vercel, Railway, VPS), database hosting, backup schedule sign-off, and final DNS cutover schedule from WordPress to Next.js. | Project remains local-only. | **YES**. |

---

## Development Posture Regarding Missing Owner Data
- If owner data is missing, the codebase renders an explicit, clean, honest empty state.
- **Under no circumstances should the engineering team invent fake phone numbers, placeholder emails, artificial case studies, or mock testimonials.**
