# Seven Lands — Website (Release Candidate)

Bilingual (Arabic-first / English) corporate website for **Seven Lands / سفن لاند** — a Saudi
full-service growth partner combining strategy, branding, content, social, performance, web and
software.

> **Status: release candidate, local/staging only.**
> Nothing has been deployed. No DNS, hosting, email or existing WordPress installation was touched.
> See `docs/RELEASE-CANDIDATE.md` for the production plan and `docs/PENDING-OWNER-INPUTS.md` for
> the content and decisions still required from the owner.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /ar
npm run build        # production build (TypeScript checked)
npm run start        # serve the production build
npm run lint         # eslint, 0 errors
npm run test:e2e     # Playwright smoke tests (production build must be running)
npm run test:a11y    # axe-core accessibility gate
npm run qa:capture   # screenshots + console/overflow report → qa/
```

### Environment variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used by canonical/hreflang/OG/sitemap. Set on staging so previews do not advertise production URLs. Falls back to `https://sevnland.com`. | staging only |
| `BRIEF_WEBHOOK_URL` | Optional HTTPS endpoint (n8n / Make / Zapier / CRM / email service) that receives project-brief submissions as JSON. | optional |
| `BRIEF_WEBHOOK_TOKEN` | Bearer token sent with the webhook request, if the endpoint needs one. | optional |

No secret is ever hardcoded. Until `BRIEF_WEBHOOK_URL` is configured, brief submissions are
validated, accepted and logged server-side, and every success screen offers a WhatsApp handoff
containing the same details — so no enquiry is lost while a delivery destination is decided.

---

## Stack

| Concern | Choice | Note |
| --- | --- | --- |
| Framework | Next.js 16.4 (App Router, Cache Components, Partial Prefetching) | versions verified against npm at build time |
| Language | TypeScript (strict) | `npm run build` runs type checking |
| Styling | Tailwind CSS 4 + design tokens in `globals.css` | tokens derived from the logo palette |
| i18n | next-intl 4 with `proxy.ts` (Next 16 renamed `middleware`) | AR default, real RTL **and** LTR |
| Motion | Motion 14 for the mobile drawer; CSS + IntersectionObserver for reveals | no GSAP: no signature sequence needed it |
| Icons | Custom art-directed SVG system for the seven capabilities + interface glyphs | see "Deliberate deviations" |
| Forms | React Hook Form + Zod (shared client/server contract) | progressive 4-step brief |
| Fonts | Alexandria + Manrope, self-hosted woff2 subsets | `public/fonts`, no external requests |

---

## Structure

```
src/
  app/[locale]/            home, services, service detail, work, case study,
                           about, insights, article, start-a-project, contact,
                           privacy, terms, not-found, [...rest] catch-all
  app/api/brief/           validated brief endpoint (rate limited, honeypot)
  components/  brand/      logo, capability glyph system, path artwork
               layout/     header, mobile nav, locale switcher, footer
               sections/   hero, trust, lands system, problems, work,
                           process, why, final CTA, legal
               forms/       progressive project brief
               ui/          button, section, heading primitives
               system/      scroll reveal, analytics listener
  content/                 ★ single source of truth for all business facts
  features/brief/          Zod schema shared by form + API
  i18n/                    routing, request config, ar/en message catalogues
  lib/                     seo, schema.org, analytics, path geometry, utils
public/brand/              official logo assets (untouched + white knockout)
public/fonts/              self-hosted brand typography
public/og/                 social share images (ar/en)
docs/                      release candidate + pending owner inputs
tests/                     Playwright smoke + axe accessibility specs
```

### Content is centralised on purpose

Everything factual lives in `src/content/`:

- `site.ts` — brand, phone/WhatsApp, location, Maps URL, **and the `pending` block for anything
  unconfirmed**.
- `services.ts` — the seven Lands: promise, problems, scope, FAQs (both languages).
- `home.ts` — problems, process, principles, positioning statements.
- `work.ts` / `insights.ts` — **empty by design**, with complete, typed, production-ready models.

Adding a real case study or article is a content change, not a code change: the hub, filters,
templates, sitemap and structured data all activate automatically.

---

## Admin Control Center

The architecture and implementation plan lives in `docs/admin-control-center/` (read its
`README.md` first). Key decision: **Payload CMS 3 embedded in this Next.js app**, behind a
`src/lib/content/*` adapter, keeping the current static content as the rollback provider.

**Phase A (architecture spike) is complete — verdict PASS.** Payload 3.90.2 is installed against
Next 16.4.0 with `cacheComponents` still enabled; `/admin` renders in Arabic with `dir="RTL"`; the
local API, CRUD, media processing, migrations and the production build all pass with **no change to
any public route, content or test** (the one public-surface change is the `/admin` exclusion in the
middleware matcher). Full evidence: `docs/admin-control-center/PHASE_A_SPIKE_REPORT.md`.

Everything else from the plan is **not** implemented: no business collections, no auth product, no
content migrated to the database, no production deployment. The static provider in `src/content/`
remains the single source of truth for the website.

## Invariants that must not regress

- **WhatsApp messages are per-surface and per-capability.** Generic "hello" messages were removed on
  purpose — `wa.*` in the message catalogues plus the `wa` field on each Land in `content/services.ts`.
- **Campaign context is captured on first paint** (`rememberCampaign()` in `lib/analytics.ts`) and
  travels with the brief submission; it is never rendered in the UI.
- **Rate limiting is production-only** so the Playwright suite can submit the brief repeatedly.
- **Safe areas are handled**: the drawer and header carry `env(safe-area-inset-*)` padding, and the
  drawer uses `100dvh`.
- **No defensive/legal disclaimers in commercial surfaces.** Legal wording belongs inside the legal
  pages; a smoke test enforces this on home, terms and 404 in both locales.

## Layout constraint worth knowing

**Never add `backdrop-filter`, `transform`, `filter`, `perspective` or `contain` to the `<header>`.**
Any of them makes the header a *containing block*, which silently captures the fixed-position
mobile drawer and clips it to the header's own height (this is exactly how the drawer once rendered
72px tall instead of full-screen). For the same reason the drawer is rendered through a
**React portal into `<body>`** — see `src/components/layout/MobileNav.tsx` — so its position and
stacking order never depend on where it sits in the tree.

## The Seven Lands Path (signature interaction)

`src/components/sections/LandsSystem.tsx`

- Seven nodes sit **exactly** on one continuous path — node coordinates and the connector are
  generated by the same helper (`lib/path.ts`), so they cannot drift apart.
- Desktop: selecting a node (click, hover or **keyboard focus**) reveals that capability in a
  side panel. No scroll hijacking, no hover-only information.
- Mobile: the same system renders as a readable stacked index — no path gymnastics.
- Reduced motion: path drawing and node animation are disabled; all content stays visible.

---

## Honesty rules enforced in the build

This site ships **no invented facts**. There are no client logos, no testimonials, no metrics, no
project counts, no years of experience, no awards and no certifications anywhere in the codebase.

Where evidence does not exist yet, the UI says so plainly and gracefully:

- **Trust area** → states the working model instead of showing fake proof, and explains why.
- **Work hub** → "we document before we publish" state; no placeholder clients.
- **Insights hub** → "we write from the work itself" state; no filler articles.
- **Service pages** → scope listed as areas of work with a visible note that final scope is agreed
  after the first discovery session (sub-service availability is unconfirmed).
- **Social links** → hidden until real URLs are supplied.
- **Legal pages** → carry a visible "draft for legal review" notice and are `noindex`.

Business facts that are unknown live in `site.pending` and are rendered as "to be confirmed"
rather than filled in.

---

## Deliberate deviations from the brief (and why)

1. **Phosphor Icons were not used.** The seven capability symbols needed one art-directed grammar
   (the brief asks for exactly that), and the interface glyphs are a handful of simple marks.
   Custom inline SVG keeps the icon set visually consistent with the brand, adds zero dependency
   weight and avoids shipping an icon-font/JS payload for ~10 symbols. `@phosphor-icons/react` was
   installed, evaluated and then removed rather than left unused. If the owner prefers Phosphor for
   interface icons, it can be reinstated for UI-only glyphs without touching the capability system.
2. **GSAP was not added.** No signature sequence justified it; the path animation is CSS + one
   IntersectionObserver. Motion is used for the mobile drawer. Adding GSAP would have increased JS
   for no user-visible gain.
3. **Google Maps is a link, not an embed.** The supplied Maps URL is used for the location CTA;
   an interactive embed would add third-party weight and cookies for little benefit before launch.
4. **`[...rest]` catch-all + proxy 404 handling.** Unknown paths are answered with a **real 404
   status** and the branded not-found page (partial prerendering would otherwise return 200 — a
   soft 404 that search engines index).

---

## Documentation

- `docs/RELEASE-CANDIDATE.md` — feature summary, routes, QA results, performance findings,
  deployment plan, rollback-safe launch steps.
- `docs/PENDING-OWNER-INPUTS.md` — everything the owner must supply or confirm before launch.
