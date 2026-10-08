# Pending Owner Inputs

The build deliberately proceeds around these gaps. Nothing below has been invented, estimated or
filled with placeholder fiction. Each item says exactly how it is handled today and what changes
once you supply it.

**Legend:** 🔴 required before public launch · 🟠 affects the design if supplied · 🟢 optional.

---

## Contact & business details

| # | Item | Status today | What happens when supplied |
| --- | --- | --- | --- |
| 1 | 🔴 **Official email** | Not displayed anywhere. The contact page shows WhatsApp, phone and location only. | Add to `site.pending.email`, then surface it on Contact, Footer and the contact schema. |
| 2 | 🔴 **Legal / canonical business name** | Site uses "Seven Lands / سفن لاند" as supplied. | Update `site.brand` and the Organization schema `legalName`. |
| 3 | 🟠 **Full verified address** | Displays the working label **بريدة، القصيم، المملكة العربية السعودية** and links to the supplied Maps listing. Location schema intentionally omits `streetAddress` and `postalCode`. | A precise address enables a full `PostalAddress` and strengthens local search. |
| 4 | 🟠 **Business hours** | Seeded **empty on purpose**. The admin screen (مواعيد العمل) is ready: weekly schedule, split shifts, special closures and openings. With no schedule configured the UI makes no open/closed claim. | `npx payload run src/scripts/...` is not needed — the owner enters them in the admin. |
| 5 | 🟢 **Second phone number** in older artwork | **Not used.** Only 0507776891 appears (as instructed). | Confirm explicitly and it can be added. |
| 6 | 🔴 **Analytics IDs (GA4 / Search Console)** | No third-party script is loaded. All conversion events (WhatsApp, phone, maps, service CTA, form start/step/submit/error, language switch) already push to `dataLayer`/`gtag` and to a `sevenlands:analytics` DOM event — they start reporting the moment an ID is added. | Add the GA4 ID to the layout and the property to Search Console; optionally Meta/TikTok pixels. The Content-Security-Policy in `next.config.ts` must then allow their domains (`script-src`, `connect-src`) in the same commit. |

## Content & proof

| # | Item | Status today | What happens when supplied |
| --- | --- | --- | --- |
| 7 | 🔴 **Real portfolio projects** (3–5 strongest) | Work hub shows the honest "we document before we publish" state. Case-study template is complete but empty. | Add entries to `src/content/work.ts` with `published: true`; grid, filters, template, sitemap and internal links activate automatically. |
| 8 | 🔴 **Written permission to name clients / show logos** | No client name or logo appears anywhere. | Set `clientApproved: true` per project. Filter chips appear only when content exists. |
| 9 | 🔴 **Verified case-study outcomes** | No metrics of any kind exist in the build. | Results render only from `results[]` entries you provide with source data. |
| 10 | 🔴 **Real testimonials** | Section is **omitted entirely** from the homepage (the brief allows omission; invention is not an option). | Provide quotes + attribution; the section is added. |
| 11 | 🟠 **Exact list of services currently sold** | All seven capability pages list scope areas with a visible note that final scope is agreed per project: *"نطاق كل مجال يُحدَّد حسب المشروع بعد جلسة الفهم الأولى."* | Confirm or drop individual scope items and the disclaimer can be replaced with firm offering language. |
| 12 | 🟠 **Software / AI / mobile services — active now or staged?** | Presented as part of Land 07 with the same scope disclaimer. | If staged, the affected items can be marked "coming soon" or removed. |
| 13 | 🟠 **Founder / team bios and photos** | About page states plainly that names and photos are not published before approval. | A team block renders once real bios and images exist. |
| 14 | 🟠 **Real team / office photography** | No stock photography was used anywhere. The site is carried by brand artwork and typography. | Real imagery upgrades the Work and About surfaces. |
| 15 | 🟢 **Insights launch timing** | Hub shows an honest empty state; the article template is complete. | Publish the first article and the listing, sitemap and Article schema activate. |

## Operations

| # | Item | Status today | What happens when supplied |
| --- | --- | --- | --- |
| 16 | 🔴 **Where project briefs should be delivered** | Validated, rate-limited, logged server-side, plus a one-tap WhatsApp handoff carrying the same details. | Set `BRIEF_WEBHOOK_URL` (n8n / Make / Zapier / CRM / email service). No code change needed. |
| 17 | 🔴 **Legal review of Privacy & Terms** | Both are clearly labelled drafts and are **noindex**, so they cannot be indexed before review. | After review, remove `noIndex` from the two pages in `src/app/[locale]/privacy|terms/page.tsx`. |
| 18 | 🟠 **Social media URLs** | Seeded **empty on purpose**; no social icon renders anywhere. The admin screen (حسابات التواصل الاجتماعي) validates `https://`, accepts a curated icon, supports enable/disable and ordering. | The owner adds real accounts in the admin. |
| 19 | 🟠 **Analytics IDs** (GA4 / GTM, Search Console) | Event hooks are wired and tested (`whatsapp_click`, `phone_click`, `maps_click`, `brief_form_start/steps/submit/error`, `service_cta_click`, `language_switch`). Nothing is loaded until IDs exist. | Add the GA4/GTM snippet to `src/app/[locale]/layout.tsx`; every event starts reporting immediately. |
| 20 | 🟢 **Ad pixels** (Meta / TikTok / Snap) | Not loaded. | Add only with explicit authorisation and a consent decision. |
| 21 | 🟢 **Commercial choices** | Budget range is **not** in the brief form (as recommended); no public pricing; English launches simultaneously with Arabic. | Confirm if you want any of these changed. |

---

## Launch inputs (technical)

| # | Item | Notes |
| --- | --- | --- |
| 22 | 🔴 **Hosting decision** | Any Node-capable host. The brief's safety rules are respected: staging first, production untouched. |
| 23 | ✅ **Resolved in Phase C** | Canonical is now server-only `SITE_CANONICAL_URL` (default `https://sevnland.com`), independent of the runtime/preview origin. See `docs/phase-c/ORIGINS_AND_HEADERS.md`. Production must set `SITE_CANONICAL_URL` and `RUNTIME_ORIGIN` explicitly. |
| 24 | 🔴 **Explicit approval before any production change** | DNS, existing WordPress, email records and live data remain untouched until you authorise the switch. See the rollback plan in `docs/RELEASE-CANDIDATE.md`. |

---

## What we did **not** need to ask about

Per the brief, the build proceeded without blocking questions on:

- visual direction, typography, palette or section order (the documentation pack already specified them);
- missing metrics, logos, testimonials and case studies (omitted honestly rather than faked);
- photo sourcing (none used, so no licensing exposure);
- CMS choice (typed local content is enough for this scope; the structure stays CMS-ready).

---

## Phase C additions (2026-10-07)

| # | Input needed | Current state | What happens when supplied |
| --- | --- | --- | --- |
| C1 | **Email address** | Not published; the contact screen accepts a channel and the seeder deliberately wrote none. | An email row appears on the contact page and in `ContactPoint` structured data. |
| C2 | **Street address** | Only city/region/country are published (verified). No street line is invented. | Add it to site settings; the address block and schema `streetAddress` extend. |
| C3 | **Operating hours** | Empty (see #4 above). | The "open now" indicator appears only once a schedule exists and is computed in `Asia/Riyadh`, never the server's timezone. |
| C4 | **Social accounts** | Empty (see #18 above). | Icons render in the footer, in the admin's declared order. |
| C5 | **Logo override** | The design system's official artwork is served from `/brand`. | Uploading a `public` asset in Site Settings switches the public site to the media library — no code change. Brief unchanged: no redraw, no recolour, no mirrored variant, 500×500 dark-on-transparent. |
| C6 | **Working-hours boundary semantics** | Opening is **inclusive**, closing is **exclusive** (`from ≤ now < to`); special dates override the weekly pattern. | Confirm this matches how the business describes closing time ("نغلق ٥" = closed at 17:00). |

## Phase E — البند المفتوح الوحيد (2026-10-08)

**قرار مطلوب:** نقل `/about` و`/contact` و`/start-a-project` إلى لوحة التحكم ضمن Phase E، أم إقفال
المرحلة وتركها ثابتة؟ التفاصيل والخيارات الثلاثة والتوصية في
`docs/admin-control-center/phase-e/PHASE_E_REPORT.md` (البند W).
