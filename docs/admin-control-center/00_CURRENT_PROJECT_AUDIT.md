# 00 — Current Project Audit

Audited from the repository on 2026-10-07 (production build passing, 55 automated tests green).
Everything below is measured from the code, not assumed.

## 1. Stack and framework

| Area | Reality |
| --- | --- |
| Framework | Next.js **16.4.0**, App Router, `cacheComponents: true` (PPR), React **19.3.0** |
| Language | TypeScript **strict**; `tsc --noEmit` passes |
| Styling | Tailwind CSS **4** via `@tailwindcss/turbopack`, tokens declared in `@theme` inside `src/app/globals.css` |
| i18n | **next-intl 4.14.9**, locales `ar` (default, RTL) and `en` (LTR), `localePrefix: "always"` |
| Motion | `motion` (Motion/Framer) — used in reveals, drawer, path interaction |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| QA | Playwright 1.63 + `@axe-core/playwright`; custom `scripts/qa-capture.mjs` |
| Icons | **No icon library.** All icons are hand-written inline SVG (`components/ui/Button.tsx`, `brand/LandGlyphs.tsx`) |

## 2. Application structure

```
src/app/[locale]/          home, services(/[slug]), work(/[slug]), insights(/[slug]),
                           about, start-a-project, contact, privacy, terms,
                           not-found (+ /not-found route), [...rest]
src/app/api/brief/route.ts public POST endpoint (validation, honeypot, rate limit, optional webhook)
src/app/sitemap.ts, robots.ts
src/proxy.ts               next-intl middleware + real-404 route validation
src/content/*.ts           typed static content: site, services (7 Lands), home, work, insights
src/i18n/messages/*.json   251 leaf strings per locale across 16 namespaces
src/components/{layout,sections,forms,ui,brand,system}
src/features/brief/schema.ts shared Zod contract (client + server)
src/lib/{seo,schema,routes,analytics,path,utils}.ts
```

**Rendering model.** Mostly server components; only 6 client components: `MobileNav`,
`LocaleSwitcher`, `LandsSystem`, `ProjectBriefForm`, `AnalyticsListener`, `ScrollReveal`.

## 3. Where content actually lives today (3 sources)

1. **`src/i18n/messages/{ar,en}.json`** — 251 strings each: navigation, CTAs, section headings and
   bodies, form labels and validation errors, legal text, footer, meta titles/descriptions.
2. **`src/content/*.ts`** — typed objects: `site` (brand, phone, location, pending fields),
   `services.ts` (the seven Lands: slug, number, glyph, promise, intro, problems, capabilities,
   FAQs, WhatsApp opener), `home.ts` (problems, process, principles, positioning),
   `work.ts` (empty case-study model), `insights.ts` (empty article model).
3. **In JSX** — a residual set of literals chosen by `locale === "ar" ? … : …` inside a few
   sections/pages (contact, about, services hub, insights, work).

**This three-way split is the core content-debt item.** Any admin system must establish one
authority per string, and the migration plan (`16_MIGRATION_PLAN.md`) addresses it explicitly.

## 4. SEO implementation today

- `src/lib/seo.ts` → `buildMetadata()` produces title, description, canonical, `hreflang`
  (`ar-SA`, `en`, `x-default`), Open Graph (with per-locale `og-{ar,en}.png`), Twitter card, robots.
- `src/app/sitemap.ts` and `src/app/robots.ts` are generated; static routes + published slugs only.
- `src/lib/schema.ts` emits Organization, WebSite, Service (+OfferCatalog), FAQPage, BreadcrumbList.
- Legal pages are `noindex` until reviewed; unknown routes answer a real 404 with `noindex`.
- OG images are **static PNGs** committed to `public/og/` (1200×630, AR and EN).

## 5. Forms, leads and attribution

- `ProjectBriefForm` (4 steps, progressive) posts to `/api/brief`.
- The endpoint: Zod validation, honeypot (`website` field), **in-memory** rate limit
  (6 per 10 min per IP, production only), optional delivery via `BRIEF_WEBHOOK_URL` +
  `BRIEF_WEBHOOK_TOKEN`; otherwise it logs server-side and the UI offers a WhatsApp handoff.
- **No lead storage.** If the webhook is unset, leads exist only in logs + the visitor's WhatsApp.
- Campaign attribution: `utm_*`/`gclid` captured on first paint, kept in `sessionStorage`,
  sent as `campaign` with the brief. Verified end-to-end.

## 6. Analytics state

- `src/lib/analytics.ts` pushes to `window.dataLayer` / `gtag` and dispatches a `sevenlands:analytics`
  DOM event: `whatsapp_click`, `phone_click`, `maps_click`, `brief_form_start/step/submit/error`,
  `service_cta_click`, `case_study_view`, `language_switch`.
- **No third-party script is loaded** — no GA4, no GTM, no pixels. Zero third-party requests today.

## 7. What does NOT exist

| Missing | Consequence for this plan |
| --- | --- |
| Database | Everything is static/typed content |
| Authentication | No users, no sessions, no roles |
| CMS abstraction | Content is imported directly by pages/components |
| Lead storage | Leads are ephemeral unless a webhook is configured |
| Media pipeline | 9 brand/font/OG files in `public/`, no uploads, no `next/image` usage yet |
| Redirect manager | None — slug changes would 404 |
| Consent layer | No cookie banner (no cookies set beyond the locale cookie) |

## 8. Environment and deployment assumptions

- Env vars: `NEXT_PUBLIC_SITE_URL` (canonical origin override), `BRIEF_WEBHOOK_URL`,
  `BRIEF_WEBHOOK_TOKEN`. No secrets in the client bundle (verified).
- Security headers in `next.config.ts`: CSP (`default-src 'self'`), `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS in production. Framing is left to hosting.
- **Hosting is not yet decided** (pending owner input #22). The build runs anywhere Node runs.

## 9. Technical debt and risk register found during the audit

| # | Finding | Impact on the admin plan |
| --- | --- | --- |
| D1 | Three content authorities (JSON catalogues, TS content, JSX literals) | Migration must consolidate; otherwise admins edit a string that a component overrides |
| D2 | `src/lib/routes.ts` hardcodes the route table used by the proxy for real 404s | If admins can create new pages, the proxy must consult the CMS (cached) |
| D3 | Rate limiter is an in-memory `Map` | Ineffective on serverless or multi-instance hosting → needs shared store or single instance |
| D4 | No lead persistence | Admin "Leads" cannot exist until storage is added |
| D5 | Icons are hand-written SVG with no library | The planned social-icon picker needs either Phosphor or the existing hand-drawn set extended |
| D6 | OG images are static files | Per-page OG requires either uploads or dynamic generation |
| D7 | Legal pages are drafts and `noindex` | Legal text must be admin-editable but must stay gated until approved |
| D8 | Contact page shows "يُحدَّد لاحقًا" for hours | Structured hours model will remove this placeholder |
| D9 | `site.pending` holds three `null` fields and an empty social array | Becomes a real settings group |
| D10 | 6 client components carry Motion and uploads/editor must never leak into the public bundle | Admin code must be fully route-isolated |

## 10. Constraints the plan must respect (carried from the build pack)

- Never invent business facts; unknown data stays absent or explicitly pending.
- Brand rules on the logo (no redraw, no mirroring, single dark-on-transparent asset).
- No production mutation (deploy/DNS/email/WordPress) without explicit approval.
- Arabic-first: any admin UX that staff use daily must be readable in Arabic.
- The public site's performance budget must not regress (LCP ≈ 0.8 s mobile today).
