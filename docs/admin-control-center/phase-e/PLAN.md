# PHASE E — EXECUTION PLAN & WORKING MEMORY

> Living document. Updated as the implementation becomes authoritative. If work is interrupted, this
> file is the source of truth for what exists, what is decided, and what remains.

## 0 · Scope (owner authorization, 2026-10-08)

Pages · sections · typed blocks · localization · drafts · preview · publishing · versioning.
**Controlled flexibility**: admin controls content and approved composition; the frontend keeps the
design. No arbitrary HTML/CSS/spacing/animations/nesting. Hard stop after Phase E (no Phase F).

## 1 · Decided architecture

| Decision | Choice | Why |
| --- | --- | --- |
| Page model | One `pages` collection, one document per logical page, localized fields | §15 — no duplicate AR/EN documents |
| Route identity | `systemKey` (immutable enum) for the six existing routes; `slug` for custom pages | §4/§5 — `/about` etc. can never be renamed by an editor |
| Composition | Payload **blocks** array `sections[]` (typed, ordered) | §7/§13 — native ordering, no generic JSON blob, no raw HTML |
| Block knowledge | **One registry** (`src/lib/blocks/registry.ts`): key, labels, schema builder, renderer, media extractor, publish rules, variants | §8/§27 — renderer, usage, validator and admin all read the same source |
| Drafts | Payload `versions.drafts` (autosave off) + per-locale publication state | §19/§22 — public sees last published; drafts versioned |
| Locale publication | `localeState.{ar,en} = draft \| ready \| published` | §16 — "AR: Published · EN: Draft" is explicit and auditable |
| Publish gate | One validator (`src/lib/pages/publish.ts`) used by the API, the admin UI and tests | §24/§25 — no scattered validation |
| Media gate | Registry media extractor + Phase D `findMediaUsage` | §26/§27/§68 — private media cannot publish; usage/deletion stay correct |
| Links | Typed CTA model: internal `systemKey`/page relation, external https, WhatsApp, phone, email | §28/§29 — no hand-typed internal URLs |
| Adapter | `getPage(systemKey|slug, locale)` → view model; public components never import Payload | §46 |
| Renderer | Central switch over the registry; unknown type renders nothing and logs | §47 — fail safe, no dynamic imports from DB strings |
| Cache | Tags `page:{id}`, `page:{locale}:{slug}`, `page-system:{key}`; `revalidateTag(tag, { expire: 0 })` | §48/§49 — targeted, first-request fresh |
| Preview | `/admin/preview?path=…` served by the public app with draft data + signed-in admin session | §20/§21 — no token in public HTML, noindex, no cache pollution |
| Slug change policy | System pages locked. Custom pages: **blocked while published** until a Redirect phase; documented | §39 — minimal safe policy, no half-built redirect manager |

## 2 · Block set (from the REAL component tree, §9)

| Block | Replaces | Variants | Media |
| --- | --- | --- | --- |
| `hero` | `sections/Hero.tsx` (home) | `brandPath` · `image` · `minimal` | background/hero image + focal, optional mobile override |
| `pageHeader` | about/contact/start page headers | `default` | — |
| `richText` | `LegalPage` body, story copy | `default` | — |
| `trustStatement` | `TrustStatement.tsx` | — | — |
| `landsSystem` | `LandsSystem.tsx` (interactive, code-backed) | `system` · `grid` | — |
| `problems` | `Problems.tsx` (list of problem/outcome) | `pairs` · `list` | — |
| `process` | `ProcessSection.tsx` (steps) | `numbered` | — |
| `why` | `WhySection.tsx` (reasons) | `cards` | — |
| `servicesTeaser` | services section on home | `cards` | — |
| `workTeaser` | `WorkTeaser.tsx` | `empty` | — |
| `faq` | (exists on service pages; page-level use ready) | `accordion` | — |
| `cta` | `FinalCta.tsx` | `dark` · `light` · `brand` | — |
| `contactPanel` | contact page channel block (data from globals) | — | — |
| `briefForm` | `ProjectBriefForm` block (form stays code-backed) | — | — |
| `mediaSection` | split media/text section | `imageRight` · `imageLeft` | one image + focal |
| `mapEmbed` | contact map CTA | — | — |

Deliberately NOT implemented: testimonials, metrics, logo cloud (no real proof exists — §73), Hero
CMS extras (animations, coordinates, gradients), any block without a current consumer.

## 3 · Work order

1. **Locales** — shared write helpers + regression suite (AR/EN preservation, partial writes, teardown).
2. **Block registry** — schema builders, labels, media extractors, publish requirements, variants.
3. **Pages collection** — model above + drafts + audit + hooks (slug protection, system protection).
4. **Publish validator** + permissions (`pages.*`) + role seeding.
5. **Adapter + renderer** + public wiring (home/about/contact/start/privacy/terms read CMS; static fallback intact).
6. **Seed/migration** from current static content (deterministic, idempotent, guarded).
7. **Drafts/preview/publish/unpublish/restore** + cache tags + sitemap/hreflang/noindex rules.
8. **Tests** (`verify-phase-e.ts`), browser evidence, equivalence + visual regression.
9. **Docs** (`docs/admin-control-center/phase-e/*`) + §98 report.

## 4 · Progress log

- [x] Recon: routes, sections, content layer, route registry, layout, legal pattern.
- [ ] 1 · Locales
- [ ] 2 · Registry
- [ ] 3 · Pages collection
- [ ] 4 · Validator/permissions
- [ ] 5 · Adapter/renderer
- [ ] 6 · Seed
- [ ] 7 · Draft/preview/publish
- [ ] 8 · Tests
- [ ] 9 · Docs/report

## 5 · Status (updated as work lands)

_Last update: recon complete._ Nothing implemented yet; nothing broken. Next action: locale helpers.

---

## 6 · الحالة النهائية (2026-10-08)

**منفّذ ومختبَر.** أُنجز: نموذج الصفحات + سجل الأقسام + بوّابة النشر + المحوّل والعارض +
نقل الرئيسية/الخصوصية/الشروط مع إثبات التكافؤ + المعاينة الآمنة + الإصدارات والاستعادة + التدقيق +
عقد الظهور لكل صفحة + وسوم الكاش + `/{locale}/{slug}` للصفحات المخصّصة + زر المعاينة في المحرّر +
حزمة الاختبارات (61/0) والانحدار.

**البند المتبقّي أُغلق:** نُقلت `/about` · `/contact` · `/start-a-project` (OPTION_1 المعتمد) بأقسام
جديدة مطابقة للتصميم، مع إثبات تكافؤ نصي 12/12 وبصري 0 بكسل وبوّابة نماذج خضراء. الحالة النهائية:
**PHASE E = PASS ومختومة** — `PHASE_E_REPORT.md` (قسم SEAL).

**قاعدة ثابتة:** لا عمل على Phase F قبل قرار المالك.
