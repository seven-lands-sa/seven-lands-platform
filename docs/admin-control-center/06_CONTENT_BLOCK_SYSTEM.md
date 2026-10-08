# 06 — Content & Block System

## 1. Principle

Pages are **ordered lists of typed blocks**. A block type is defined in code with a Zod/Payload
schema and an approved set of visual variants. Editors choose *which* blocks, *in what order*, with
*which content* — they cannot invent a block, and they cannot create a layout that breaks the design.

## 2. Block catalogue for V1

Each block is a copy of a section that already exists on the site (or one we will need).

| Block | Source on the site today | Content fields (localized) | Variants |
| --- | --- | --- | --- |
| `hero` | `sections/Hero.tsx` | eyebrow, title line 1, title line 2, accent line, support, primary CTA, secondary CTA, WhatsApp line, media?, mediaMobile?, overlay | `brand-panel` (today), `image`, `split`, `minimal` |
| `trust` | `TrustStatement.tsx` | heading, body, note, facts[3] | — |
| `seven-lands` | `LandsSystem.tsx` + section heading | eyebrow, heading, lede, selectHint | `interactive-path` (today), `static-grid` (reduced motion / no-JS fallback) |
| `problems` | `Problems.tsx` + `home.problems` | heading, lede, items[] (question, answer, landing page link) | — |
| `work-teaser` | `WorkTeaser.tsx` | eyebrow, title, lede | `selected`, `empty-state` |
| `process` | `ProcessSection.tsx` + `home.process` | heading, lede, steps[4] | `rail`, `stacked` |
| `why` | `WhySection.tsx` + `home.principles` | heading, lede, items[] | `list`, `split` |
| `testimonials` | *(not built — none exist)* | heading, items[] (quote, name, role, company, photo?) | `cards`, `quote` |
| `metrics` | *(not built — none confirmed)* | heading, items[] (label, value, source note) | `row` |
| `logo-cloud` | *(not built)* | heading, logos[] | `row`, `muted` |
| `rich-text` | — | body (rich text) | `prose`, `two-column` |
| `image-text` | — | image, side, heading, body, CTA | `left`, `right` |
| `video-text` | — | video (URL or file), poster, heading, body | `left`, `right` |
| `services-grid` | `services/page.tsx` | heading, lede, selection mode (all \| chosen) | `cards`, `index` |
| `projects-grid` | `work/page.tsx` | heading, lede, filter by service, limit | `grid`, `list` |
| `faq` | service pages | heading, items[] | `accordion` |
| `cta` | `FinalCta.tsx` | eyebrow, heading, body, primary, secondary | `dark`, `light` |
| `contact` | `contact/page.tsx` | heading, channels (from settings), map? | `split`, `stacked` |
| `map` | contact page | location (from settings), heading | `embed`, `link-only` |
| `gallery` | project template | images[] with alt per image | `grid`, `masonry`, `before-after` |
| `quote` | — | quote, attribution | `large`, `inline` |
| `media` | — | image or video, caption | `full`, `contained` |

### Blocks that require real proof (owner amendment, 2026-10-07)

`testimonials`, `metrics` and `logo-cloud` may exist as **available block types**, but they must
never behave as **publishable empty blocks**. Publication fails validation unless the block carries
real, attributable content:

| Block | Required real content before it can be published |
| --- | --- |
| `testimonials` | at least one item with an **actual quote + attribution** (name, and role/company when known). A quote without attribution is not publishable. |
| `metrics` | at least one item with an **actual value + label**, and where the claim is externally verifiable, an internal source/verification note. |
| `logo-cloud` | at least one **approved, real organisation/client asset** plus the owner's permission to display it. |

Until those conditions are met the block stays creatable-but-unpublishable, with the admin notice
"لا يمكن النشر قبل إضافة بيانات حقيقية موثّقة." This places the honesty rule inside the validation
layer itself, so fake scaffolding cannot reach production by accident — not merely by convention.

The same rule applies to disabled or omitted blocks: an absent block renders nothing (no empty
section, no spacing gap), never a placeholder.

## 3. Block schema shape (example)

```
hero:
  eyebrow        { ar, en }           required
  titleTop       { ar, en }           required
  titleBottom    { ar, en }           required
  accent         { ar, en }           required
  support        { ar, en }           required, max 220 chars (measured against the 3-line rule)
  primaryCta     cta                   required
  secondaryCta   cta?                  optional — layout adapts when absent (see §5)
  whatsappLine   { ar, en }?           optional
  media          media?                optional
  mediaMobile    media?                optional (falls back to `media`)
  overlay        select[0,20,40,60]    optional
  variant        select[brand-panel,image,split,minimal]
```

`cta` is a shared sub-schema: `{ label{ar,en}, target: internal|external|whatsapp|phone,
page?|url?|message?, newTab? }`. Editors pick an internal page from a picker, never type a route.

## 4. Controlled flexibility rules

1. Block order is drag-and-drop (dnd-kit) but constrained by rules: `hero` only first, `cta`
   only last, singletons (`hero`, `trust`) cannot repeat.
2. Each block declares `maxInstances` and `allowedPages`.
3. Variants are enumerated, never free-form (`variant: "brand-panel"`, not CSS).
4. Sections that carry page style (tone: light/white/dark) are set by the block definition, not
   chosen by the editor.
5. **No arbitrary layout builder.** If a page needs a new arrangement, that is a code change.

## 5. Fallback behaviour (frontend contract)

| Missing content | Behaviour |
| --- | --- |
| secondary CTA absent | single CTA renders left-aligned; no empty slot |
| hero media absent | current brand-panel artwork renders (never a broken image) |
| image missing alt (either locale) | the block renders the image but Site Health flags it; alt falls back to `ar` |
| block disabled | not rendered at all — no empty section, no spacing gap |
| any required **visible** `en` field missing | **publication of the English version is blocked** (policy in `05_…` §5) — Arabic never appears inside the English site; where architecture allows, the optional block is omitted for that locale instead |
| optional block whose `en` copy is missing | omitted from the English render (no Arabic fallback inside English pages) |
| testimonial without attribution | blocked at validation; cannot be published |
| metric without value+label (or without a source note where the claim is verifiable) | blocked at validation; cannot be published |
| logo-cloud without approved real client assets | blocked at validation; cannot be published |

## 6. Structural pages vs admin-created pages

**V1 decision:** the route table stays structural (home, services, work, insights, about,
start-a-project, contact, privacy, terms). Admins edit the *content* of those routes and may add
**service, project and article** records (which create routes dynamically through the existing
`[slug]` templates).

Why: the proxy in `src/proxy.ts` validates paths against `src/lib/routes.ts` to produce real 404s
(technical debt item D2). Letting admins create arbitrary top-level pages would require the proxy to
consult the CMS on every request, weakening caching and complicating the 404 contract.

**Phase-2 extension (documented, not built):** a `landing-pages` collection (`/p/{slug}`) with a
cached allow-list (revalidated on publish) so the proxy stays fast while supporting campaign pages.
