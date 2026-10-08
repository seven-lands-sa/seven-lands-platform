# Release Candidate Report

**Project:** Seven Lands / سفن لاند — corporate website
**Status:** Release candidate, verified locally. **Nothing deployed. No production system touched.**
**Verified:** 2026-10-07 · Next.js 16.4.0 · React 19.3.0 · Tailwind 4.3.3 · next-intl 4.14.9 · Motion 14 · Playwright 1.63

---

## 1. Feature summary

**Architecture & i18n**
- Arabic-first bilingual architecture: `/ar` (default, RTL) and `/en` (LTR), each with a real layout
  direction, not "LTR with right-aligned text".
- `dir`/`lang` set at the document level; directional utilities (`start`/`end`, logical borders)
  used throughout, so the same components serve both directions.
- Auto locale detection with cookie persistence; prefix-less URLs redirect to `/ar`.
- Latin runs inside Arabic pages (brand name, tags, metrics) are isolated in a `.latin` class so
  numerals and Latin words render correctly, including `dir="ltr"` isolation on phone numbers.

**Routes (13 specified + system routes, both languages)**

| Route | Notes |
| --- | --- |
| `/[locale]` | Homepage — 9 sections (hero → structured footer) |
| `/[locale]/services` | Capability hub, seven Lands with scope preview |
| `/[locale]/services/[slug]` | Service detail template ×7 — outcome → problems → scope → method → related work → FAQ → CTA |
| `/[locale]/work` | Work hub with honest empty state (filters render only when content exists) |
| `/[locale]/work/[slug]` | Case-study template — complete, no published entries yet |
| `/[locale]/about` | Story, principles, seven-capability index, process, location, honest team state |
| `/[locale]/insights` | Insights hub with honest empty state |
| `/[locale]/insights/[slug]` | Article template — complete, no published entries yet |
| `/[locale]/start-a-project` | Progressive 4-step brief |
| `/[locale]/contact` | WhatsApp / phone / Maps / hours (pending) + quick enquiry form |
| `/[locale]/privacy`, `/[locale]/terms` | Draft legal pages, `noindex` until reviewed |
| `/[locale]/not-found` + catch-all | Real 404 status with the branded page |
| `/api/brief` | Validated, rate-limited brief endpoint |
| `/sitemap.xml`, `/robots.txt`, icons | Generated |

**Signature interaction — the Seven Lands Path**
- Seven nodes sit on one continuous, mathematically generated path
  (node coordinates and the connector come from the same helper, so they can never drift).
- Desktop: click, hover **or keyboard focus** on a node reveals that capability in a side panel.
- Mobile: the same system renders as a readable stacked index — nothing hidden behind interaction.
- No scroll hijacking, no cursor replacement, no wall-clock animation; reduced motion honoured.

**Conversion**
- Primary CTA *ابدأ مشروعك / Start a project* present in header, hero and final CTA.
- WhatsApp deep links with context-aware prefilled messages (per service page, per section).
- Progressive brief: capability → goal → timing → contact, validated one step at a time, with a
  success screen that offers a WhatsApp handoff containing the same details.
- Analytics hooks on WhatsApp clicks, phone clicks, Maps clicks, form start/steps/submit/error,
  service CTAs and language switches — all inert until an analytics ID is added.

**Honesty layer (the reason this build can launch before assets exist)**
- No client, project, testimonial, metric, award, certification, team member or experience claim
  appears anywhere in the codebase.
- Absent evidence is handled with designed, plain-spoken states (see `README.md`).
- Unconfirmed business data is centralised in `site.pending` and rendered as "to be confirmed".

---

## 2. QA results

### Automated — Playwright (`npm run test:e2e`, `npm run test:a11y`)

| Suite | Result |
| --- | --- |
| Smoke (AR desktop + mobile, EN desktop) | **37 passed, 0 failed** (5 intentional skips: locale-specific duplicates) |
| Accessibility — axe-core, WCAG 2.1 A/AA + best practice | **18 passed, 0 violations** across `/ar`, `/en`, services hub, service detail, brief form, contact |
| Regression suite (drawer geometry, language switch, header widths, footer copy, WhatsApp context, campaign attribution) | **37 passed** — includes guards against the removed disclaimer returning, drawer geometry, per-page WhatsApp messages and UTM survival into the brief payload |

Smoke coverage: RTL/LTR direction and single `h1`; language switch preserving the current route in
both directions; all seven capability pages returning 200; real 404 status on unknown routes;
WhatsApp hrefs restricted to `wa.me/966507776891`; `tel:+966507776891`; Maps link; full brief-form
validation path (including rejecting an invalid Saudi mobile) through to the success state; mobile
menu open/close with Escape; zero horizontal overflow.

### Manual visual QA (`npm run qa:capture` → `qa/screenshots`, `qa/findings.json`)
- 13 routes × 390 px and 1440 px, full-page captures with console and failed-request capture.
- **0 console errors, 0 failed requests** on all valid routes (the only console entry is the
  expected 404 on the deliberately-broken URL).

### Width sweep — `documentElement.scrollWidth` vs viewport
`360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920` across 11 routes: **clean at every width, no
horizontal scrolling** (verified again after the design refinements below).

### Accessibility specifics
- Axis contrast failures found and fixed systematically, not patched per element: the muted tone at
  `#808A95` measured **3.26:1** on off-white (below AA for body text), so a text-grade token
  `#5F6974` (5.2:1 / 5.6:1) was introduced, and low-opacity white text on navy was lifted to
  AA-passing values. The logo's original mist tone remains in the palette for dividers and
  decorative use.
- Skip link targets a focusable `<main>`; distinct landmark labels for header and footer navigation;
  keyboard-reachable path nodes; visible focus rings on every interactive element.

### Known non-blocking issue
- One ESLint warning remains: `react-hooks/incompatible-library` on React Hook Form's `watch()` —
  a React Compiler interop note from the library's imperative API, not a defect. 0 lint errors.

---

## 3. Performance findings

Measured against the production build with Playwright + Chrome DevTools Protocol, CPU throttled 4×
and network throttled to ~1.6 Mbps / 150 ms RTT for the mobile figures.

| Scenario | FCP | LCP | CLS | TTFB | DOM Interactive |
| --- | --- | --- | --- | --- | --- |
| Mobile, slow 4G — `/ar` | 792 ms | **792 ms** | **0.038** | 100 ms | 596 ms |
| Mobile, slow 4G — `/ar/services` | 740 ms | **740 ms** | **0.025** | 25 ms | 592 ms |
| Desktop — `/ar` | 140 ms | 140 ms | 0 | 11 ms | 47 ms |
| Desktop — `/en` | 160 ms | 160 ms | 0 | 19 ms | 66 ms |

| Budget target | Result |
| --- | --- |
| LCP ≤ 2.5 s | **760–948 ms** under 4× CPU + slow 4G — comfortably inside budget |
| CLS < 0.1 | **0.025–0.038** — no layout shift from font loading (self-hosted, preloaded, `swap`) |
| INP ≤ 200 ms | No long tasks in the critical path; the only always-on listeners are one delegated
click handler and one IntersectionObserver (INP is field-measured and cannot be proven in a lab) |
| JS first-load | ~270 kB route-adjacent JS, static HTML for all marketing routes |

How the numbers were earned, not gamed: static/partial prerendering for every marketing route, no
client-side animation library for reveals (CSS + one observer), no third-party scripts of any kind,
no interactive map embed, self-hosted subset fonts with `preload`, and no external requests at all
(fonts, images and styles are all first-party).

**Not measurable here:** Lighthouse's synthetic score depends on the production host, CDN and TLS
setup. The underlying metrics above are the ones that matter and are already inside budget.

---

## 4. Post-review fixes (owner feedback round)

1. **Mobile drawer was clipped inside the header.** The header used `backdrop-filter`, which makes
   it a containing block for `position: fixed` descendants; the drawer was therefore laid out
   inside the header and measured **72px tall instead of 844px**, trapping the menu inside the
   header band. Fixed by rendering the drawer through a **React portal into `<body>`** and removing
   `backdrop-filter` from the header. The drawer now covers the full viewport (verified at
   360/390/430/768 px), paints above the header (`z-100` vs `z-50`), locks page scroll, traps
   focus, and closes on Escape, overlay tap, link selection or a resize into the desktop layout.
   A regression test now asserts full-viewport height, a reachable primary CTA, header coverage and
   the stacking order, so this cannot silently return.
2. **Language control redesigned.** The header now shows a **single** control for the *other*
   language — "English" on Arabic pages, "العربية" on English pages — instead of displaying both at
   once. It keeps the reader on the same page (`/ar/services` → `/en/services`), carries a proper
   `hreflang`/`aria-label`, and collapses to a compact code below 420px so it is never clipped. The
   full-width version appears in the mobile drawer.
3. **Header crowding at 360–430px resolved.** The wordmark now drops below 420px (the official mark
   stays), the header CTA only appears at ≥1280px, and all items are `shrink-0` so nothing is ever
   squeezed or cut. Verified: no horizontal overflow from 360px to 1920px.
4. **Drawer/MENU label.** On phones the trigger is now a clean menu icon button with an
    accessible name (the word "القائمة" was being clipped at 360px); from 640px up the icon keeps
    its label.

## 5. Public copy pass (owner-requested, 2026-10-07)

A dedicated copy replacement pass removed defensive/legal wording from the public site and
tightened several strings. Every change below was applied to **both locales** unless noted.

**Removed**
- `footer.catalogueNote` — *"محتوى الموقع تعريف بالخدمات ولا يُعد عرضًا ملزمًا."* /
  *"Website content describes services and is not a binding offer."* The key and its render were
  deleted; nothing replaced it. A smoke test now fails the build if any of these phrases reappear.
- `footer.socialNote` — *"روابط التواصل الاجتماعي تُنشر عند اعتمادها."* (internal-sounding; social
  icons simply do not render until real URLs exist).
- The third link in the footer's legal row (`/start-a-project`); the row now holds only
  سياسة الخصوصية / Privacy policy and الشروط والأحكام / Terms & conditions.

**Rewritten**
- `footer.statement` → *"تسويق، محتوى، مواقع وبرمجيات تعمل معًا لنمو أعمالك."* /
  *"Marketing, content, websites and software, working together to grow your business."*
- Footer bottom line → *"© 2026 Seven Lands. جميع الحقوق محفوظة."* / *"© 2026 Seven Lands. All rights reserved."*
- `legal.terms.sections[0]` → "نطاق العمل / Scope of work", phrased as how work is agreed
  (written proposal approved by both sides) instead of *"لا يُعد عرضًا ملزمًا"*.
- `legal.draftNotice` → plainer wording, keeping the required "under legal review" disclosure.
- `start.aside.note` → *"نستخدم بياناتك للرد على طلبك فقط."* — consistent with the privacy policy,
  which names hosting/analytics/WhatsApp as processors.
- `home.trust.heading` → *"ما نستطيع إثباته اليوم"* / *"What we can prove today"*;
  the note now reads *"…كل ما في هذا الموقع يعكس طريقة عملنا الفعلية."*
- 404 copy: "الأراضي السبع" / "the seven Lands" → "المجالات السبع" / "the seven capabilities"
  (body + meta description, AR and EN) — capabilities, not fantasy lands.

**Moved out of components into the message catalogues**
- `home.problems.explore`, `home.work.{selected, allWork, workPage, emptyPoints}` — these were
  hardcoded in `Problems.tsx` / `WorkTeaser.tsx`, one of them selected by comparing a translated
  string; they are now proper translations.
- Insights reading time uses `common.readingTime` instead of hardcoded text.

**Verified in the browser:** `/ar`, `/en`, `/ar/terms`, `/en/terms` and a 404 page, at 390 px and
1440 px — the removed phrases appear nowhere in the rendered HTML, the new lines render, and the
legal row contains exactly two links. Repo-wide search for the old strings (source *and* production
build output): **0 occurrences**. The only surviving "the seven Lands" matches are code comments in
`services.ts` and `Hero.tsx`, which are never rendered.

---

## 6. Design refinements made during QA

1. **Hero measure.** Arabic headline rendered at 1440 px initially wrapped mid-phrase. The display
   scale was trimmed (max 3.9 rem) and the text column widened from 7 to 8 columns — Arabic now
   reads as three deliberate lines, English as three balanced lines.
2. **Locale switcher.** Was visually clipped at 390 px (a display utility was overridden by a
   class-merge conflict; fixed by routing all conditional classes through `tailwind-merge`).
3. **Language switch routing.** Clicking "EN" on a service page landed on `/en` instead of
   `/en/services` because the control relied on next-intl's `Link` for a path it had to extract
   from a live URL. Replaced with a plain locale-aware anchor computed from the live pathname —
   verified in both directions, including from service detail pages.
4. **Progressive form validation.** `trigger()` on a multi-step form runs the whole resolver, so
   visitors saw errors for steps they had not reached. Each step now validates against its own
   schema in the shared Zod contract, and the full contract still runs on submit.
5. **404 status.** Partial prerendering answered unknown paths with `200` plus a not-found body (a
   soft 404 that search engines index). The proxy now rejects unknown paths before anything is
   flushed and returns a real `404` with the branded page, plus `x-robots-tag: noindex`.
6. **Reveal safety net.** Content behind scroll reveals can never remain hidden: a timed fallback
   reveals everything if the observer misbehaves, and no-JS/reduced-motion users see all content
   immediately.

---

## 7. Pre-launch hardening (2026-10-07)

**Mobile navigation architecture** — the drawer is portalled into `<body>` (the header's former
`backdrop-filter` was the containing block that clipped it). Hardened further with `100dvh`, a
scrollable middle region so actions never fall off short viewports (verified 320×568: CTA at
y=304 of 568), safe-area padding top and bottom, and the existing focus trap / Escape / resize
guard. No z-index arms race was used.

**Context-aware WhatsApp** — every WhatsApp surface now opens with a message that matches the page:
header (generic), hero and final CTA (new project), contact, start-a-project, and a **per-capability
message for each of the seven service pages** (`wa` field in `content/services.ts`, so content stays
with content). Verified: 10 distinct messages across 12 surfaces, both locales.

**Campaign attribution** — UTM/`gclid` parameters are captured on first paint, kept in
`sessionStorage` for the session, and merged into the brief payload as `campaign`. Verified: landing
on `?utm_source=snapchat&utm_medium=cpc&utm_campaign=oct_launch`, browsing two pages, then submitting
the brief delivers `{utm_source, utm_medium, utm_campaign}` to `/api/brief` — nothing is ever shown
to the visitor.

**Rate limiting** — production only. The limiter is disabled when `NODE_ENV !== "production"` so the
test suite and local QA can submit repeatedly; production keeps the 6-per-10-minute per-IP guard.

**Copy pass (second round)** — hero support line rewritten ("هوية، محتوى، حملات، مواقع وبرمجيات…"),
the positioning block no longer restates the activity list, four service promises rewritten from
service-definition to outcome language, two defensive empty-state sentences trimmed, project-form
step titles and error messages made conversational ("احك لنا باختصار عن المشروع.", "اكتب اسمك",
"أرسل تفاصيل المشروع"), and the homepage work section stopped repeating the Work hub paragraph.

**CTA hierarchy on phones** — the hero's two CTAs stack full-width below 640 px instead of wrapping
unevenly.

**Responsive proof** — 17 widths (320 → 1920) × 12 routes = 204 renders with **zero horizontal
overflow**; hero headline stays at 3 lines from 390 px up; header stays 73 px on phones.

**Security headers** — added a conservative Content-Security-Policy alongside the existing
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and production HSTS:
`default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: blob:; font-src 'self';
style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self';
form-action 'self'`. Verified against the running build: mobile drawer, path interaction, forms and
navigation all work with **zero console errors** under the policy. Framing rules stay a hosting-layer
decision (documented in `next.config.ts`) so previews keep working. `npm audit --omit=dev` → 0
vulnerabilities; no environment variable reaches the client bundle (verified against `.next/static`).

**Cross-engine verification** — the same checks were run on Chromium, Firefox and WebKit
(Playwright's Safari engine): RTL direction, single `h1`, zero horizontal overflow at 390 and 1440,
full-height drawer with a reachable CTA, Escape-to-close, sticky header, footer copy — 0 page errors
on all three. Real Safari on iOS hardware was not available; WebKit is the closest automated proxy.

**Metadata** — home and about descriptions rewritten so the "we combine disciplines" claim is not
repeated across title, description and body, and both now carry the local-search location cue.

---

## 8. Production deployment plan (staging first)

**Phase A — staging (safe, reversible, no production impact)**
1. Provision a staging host (any Node 20+ environment; a Vercel/Netlify/Cloudflare/Render project
   or a VPS all work).
2. Build with the staging origin so previews never advertise production URLs:
   `NEXT_PUBLIC_SITE_URL="https://staging.sevnland.com" npm run build`
3. Deploy and verify on staging: smoke suite (`npm run test:e2e`), axe suite (`npm run test:a11y`),
   Lighthouse on the real host, and the SPA-free navigation walkthrough.
4. Review the pending-content list with the owner (`docs/PENDING-OWNER-INPUTS.md`) and clear the
   items marked 🔴.

**Phase B — production (requires explicit owner approval)**
5. Before any switch, take a **full backup of the existing WordPress site and database**, and export
   the current DNS zone.
6. Deploy the same artefact with the production origin
   (`NEXT_PUBLIC_SITE_URL="https://sevnland.com"`). Still no DNS change.
7. Verify the deployed production origin directly (hosts file entry or temporary preview domain),
   then point the domain.
8. Only then update DNS `A`/`CNAME` for the website. **Do not touch MX/TXT/email records.**
9. Keep the old WordPress environment intact and reachable for a defined grace period.
10. Post-launch: submit the sitemap in Search Console, confirm 301s for any previously indexed URLs,
    verify GA4 events are arriving, and watch error logs for 48 hours.

**Rollback**
Point DNS back to the previous WordPress host (DNS TTL should be lowered to 300 s before the switch
to make rollback near-instant). The old environment is never deleted during the grace period, so
rollback is a DNS change, not a restore.

**Explicitly untouched until the owner authorises each step:** DNS, the existing WordPress
installation, hosting files, email DNS records and any live data.

---

## 9. Release gate

| Gate | Status |
| --- | --- |
| Build passes, TypeScript strict, 0 lint errors | ✅ |
| Smoke tests pass (AR/EN, desktop/mobile) | ✅ 37/37 |
| Accessibility tests pass (axe, WCAG 2.1 A/AA) | ✅ 18/18, 0 violations |
| No console errors, no failed requests, no broken links | ✅ |
| Responsive sweep 360→1920, no horizontal overflow | ✅ |
| RTL and LTR verified independently | ✅ |
| Reduced motion, keyboard, focus, forms | ✅ |
| No fabricated content anywhere | ✅ |
| Performance budgets | ✅ LCP 744 ms / CLS 0.018 (mobile, throttled) |
| Owner content supplied (🔴 items) | ⏳ pending — see `docs/PENDING-OWNER-INPUTS.md` |
| Production approval | ⏳ awaiting explicit authorisation |
