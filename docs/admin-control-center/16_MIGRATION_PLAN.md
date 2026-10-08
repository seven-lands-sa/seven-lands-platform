# 16 — Migration Plan

Goal: move today's content out of code and into the CMS **without changing a single pixel, URL or
metadata field** — with a verified rollback until the last step.

## 1. Inventory of what must move

| Source | Count today | Destination |
| --- | --- | --- |
| `src/content/site.ts` | brand, phone, location, pending fields | `site-settings`, `contact-settings` |
| `src/content/services.ts` | 7 Lands × (title, short, promise, intro, 2–3 problems, 7–13 capabilities, 2 FAQs, WhatsApp opener) ×2 locales | `services` (7 records) |
| `src/content/home.ts` | problems[4], process[4], principles[4], positioning | `pages` (home blocks) |
| `src/content/work.ts` | empty model + empty-state copy | `projects` (0 records) + home block copy |
| `src/content/insights.ts` | empty model + empty-state copy | `articles` (0 records) + hub copy |
| `messages/{ar,en}.json` — editorial namespaces | `home.*`, `services.*`, `serviceDetail.*`, `work.*`, `insights.*`, `about.*`, `start.*`, `contact.*`, `legal.*`, `notFound.*`, `footer.*`, `meta.*`, `wa.*` | CMS records/blocks |
| `messages/{ar,en}.json` — UI namespaces | `nav.*` (editorial: labels move; `menu`, `skipToContent`, `mainNavigation`, `switchTo*` stay), `cta.*` (labels become part of CTA sub-schemas), `common.*`, form errors | mixed: editorial → CMS, chrome → code |
| Footer/header contact blocks | fed from settings in both cases | `contact-settings` |

**The split rule:** if an editor could reasonably want to change the words, it moves to the CMS.
If it is a system phrase (aria labels, "جارٍ الإرسال…", validation errors, "تجاوز إلى المحتوى"),
it stays in the message catalogues — changing those is a development decision with accessibility
consequences.

## 2. Migration mechanics

1. **Adapter first, migration second.** Ship `src/lib/content/*` with two providers:
   `static` (today's imports) and `cms` (Payload Local API). The public site renders through the
   adapter while everything still points at `static`.
2. **Seed script** `scripts/seed-from-static.ts` reads the current TS/JSON sources and writes CMS
   documents via the Payload Local API. It is **idempotent** (upsert by `slug`/key) and safe to
   re-run.
3. **Verification (the important part).** For every route in both locales:
   - render with provider `static`, capture HTML → `before/`
   - switch provider to `cms`, re-render → `after/`
   - normalise volatile fragments (build ids), diff; **zero acceptable differences** outside
     intentional changes (e.g. the "hours: to be confirmed" row becomes real once hours are added).
4. **Flip the provider** via one env var (`CONTENT_SOURCE=cms`) and keep the static provider in the
   repo for at least one release.
5. **Decommission** the now-unused static content files only after the owner signs off — deletion is
   a separate, trivial commit that is easy to revert.

## 3. Order of migration (by risk, lowest first)

| Step | Content | Why this order |
| --- | --- | --- |
| 1 | Settings (contact, hours, social, branding) | small, high value, easy to verify |
| 2 | Navigation + footer | visible, quick win, tests exist |
| 3 | Services (7 records) | structured, already well-modelled, feeds many surfaces |
| 4 | Home blocks | the riskiest visual surface — migrate after the patterns are proven |
| 5 | Static pages (about, contact, start, work/insights hubs) | mechanical once blocks exist |
| 6 | Legal text | last, and gated behind legal approval status |
| 7 | Projects/articles | nothing to migrate today; the model simply goes live empty |

## 4. What must not change

- URLs, `hreflang`, canonicals, sitemap membership, robots directives.
- Titles/descriptions (byte-identical unless the owner requests changes).
- The 404 behaviour and the route table.
- Design, motion, spacing, breakpoints, and the performance budget.
- Existing tests: the smoke + a11y suites must pass unchanged (plus new admin tests).

## 5. Rollback

Every step is reversible:

- Provider flip back to `static` (seconds).
- CMS database is additive; it does not touch the public site until the flip.
- No DNS/hosting change is part of migration; it can happen on staging entirely.

## 6. Data-ownership notes

- The seed script doubles as the **export**: CMS → `content.json` (committed) so the business always
  has a code-readable snapshot of its own content.
- Backups (DB + media) begin **before** the first real edit by a human.
