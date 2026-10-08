# 01 — Admin Vision and Scope

> **Status note.** The vision below is unchanged. Three boundaries were tightened by the owner on
> 2026-10-07 and are binding for V1: **no AR→EN visual fallback** (Arabic never appears inside the
> English site), **no publishable empty proof-blocks** (testimonials/metrics/logo-cloud need real,
> attributable content), and **custom scripts are an advanced Super-Admin-only capability**, not a
> marketing field. Details in `05_…`, `06_…`, `12_…` and `15_…`. Phase A of the implementation
> (architecture spike) is complete — see `PHASE_A_SPIKE_REPORT.md`.

## 1. Purpose

The Admin Control Center is the operational layer of sevnland.com. It exists so that normal
business changes — a new phone number, a new case study, a price-free service description tweak,
a tracking ID, a seasonal hero image — happen **without a developer, without a deploy, and without
touching the design system**.

It is not a feature added to the website. It is the instrument the business runs the website with.

## 2. Three content layers (the governing idea)

| Layer | Examples | Owner | Where it lives |
| --- | --- | --- | --- |
| **A. Editorial** | hero copy, section text, service pages, case studies, articles, contact details, hours, social accounts, legal text | business/admin | **CMS data** |
| **B. Structural** | which block types exist, page route table, block variants, validation rules, ordering constraints | developers | **code** |
| **C. Design system** | colours, typography, spacing, radii, motion timings, section rhythm | developers | **code (tokens)** |

The admin edits layer A. It *arranges* layer B (order, visibility, variant selection) but cannot
invent new blocks or layouts. It never touches layer C.

**Rule:** if a change cannot be expressed as *content + approved variant + order + visibility*,
it is a development task, not an admin setting.

## 3. In scope for V1

- Site settings: brand, contact channels, business hours, location, social accounts, legal text.
- Navigation (header + footer) with localization, ordering, visibility.
- Pages: home and the existing static routes, composed of approved blocks, AR/EN.
- Services (the seven Lands): ordered, localized, with SEO and optional media.
- Projects / case studies: full model, publish workflow, gallery, results (only with real data).
- Insights: articles with cover, category, author, scheduling.
- Media library with alt text in both languages.
- SEO centre: per-page fields, fallback hierarchy, OG media, redirects, health indicators.
- Leads: every brief submission stored, statused, exportable.
- Marketing: GA4/GTM/pixels via native modules, consent categories, audited custom scripts.
- Users, roles, permissions, audit log.
- Draft/preview/publish/restore.

## 4. Explicitly out of scope for V1

- Free-form page builder / arbitrary layout dragging (Elementor-style).
- Custom CSS or theme editing from the admin.
- A CRM (pipeline automation, email sequences, call logging).
- Multiple sites or white-labelling.
- Rebuilding the public design; the frontend keeps its current components.
- E-commerce, payments, customer accounts.
- Multilingual beyond AR/EN (the model will allow it, the UI will not expose it).

## 5. Non-functional requirements

| Requirement | Target |
| --- | --- |
| Public site performance | unchanged: LCP ≤ 2.5 s (today ≈ 0.75 s mobile), CLS < 0.1 |
| Admin bundle isolation | zero admin JS in public routes |
| Admin responsiveness | usable on tablet; dashboard/leads/settings usable on phone |
| Admin language | Arabic-first UI with English switch; true RTL layout |
| Auditability | every publish, delete, setting, integration and script change is logged |
| Recoverability | revisions on all editorial entities; soft delete for published content |
| Security | server-side authorization on every mutation; secrets never in admin forms |
| Time to publish | an editor can change homepage copy and see it live in under 2 minutes |

## 6. Success test (the real acceptance criterion)

A non-technical administrator, with no developer present, can independently:

1. update the phone number and WhatsApp message behaviour,
2. add business hours and see "مفتوح الآن" appear correctly,
3. add an Instagram account and see the icon appear in the footer,
4. publish a new case study with images and see it on the Work hub,
5. change the homepage hero headline in both languages,
6. connect GA4 and see yesterday's WhatsApp clicks,
7. export last month's leads to CSV,
8. roll back a mistaken edit.

If any of those eight requires a developer, the system has failed its purpose.
