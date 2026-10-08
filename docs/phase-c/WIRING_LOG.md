# Phase C · wiring log

Working notes for the content-authority phase. The final report is `PHASE_C_REPORT.md`; this file
records what changed, the evidence behind each claim, and the two infrastructure decisions the phase
forced.

## What the public site reads from the CMS now

| Surface | Before | Now |
| --- | --- | --- |
| Header menu + CTA | `t("nav.*")` translations | Navigation global → `getNavigation(locale)` |
| Header WhatsApp button | `whatsappHref()` from `src/content/site.ts` | Contact settings → `getSiteIdentity(locale)` |
| Footer statement, groups, legal, rights | translations + `lands[]` + `site.*` | Footer global + Contact settings + identity |
| Page metadata (`buildMetadata`) | `site.brand`, `site.url` | `identity` — required argument, no default |
| Structured data (organization / website / breadcrumb / service / faq) | `site.*` | `identity` |
| Phone, WhatsApp, map link, location text | `site.phone`, `site.location` | Contact settings + Site settings |
| Brief form (client) | imported `site` directly | contact links passed as props from the server |

`src/content/site.ts` is now only the trusted static fallback source (consumed by
`src/lib/content/fallback.ts`) plus the deployment origin. It is no longer a parallel authority: no
public component imports it for content.

## Proof that the switch changed nothing visible

* Build: 66 pages, `/admin` partial-prerender, exit 0, and **zero** `[content] … unavailable` lines —
  every reader resolved from the CMS, none fell back.
* Screenshots: 26 route/viewport pairs re-captured and compared with the accepted baseline
  (`qa/final`). 25 are pixel-identical; `privacy-ar-1440` differs by **3 pixels at ±1/255** on two
  glyph edges (anti-aliasing, imperceptible). Detail in `evidence/visual-regression.txt`.
* Playwright: 55 passed / 5 skipped / 0 failed — unchanged from Phase B.
* Content equivalence: CMS output vs static fallback compared field by field for brand, location,
  description, navigation (labels + links), footer (2 groups, 13 rows, markers, legal, rights) and
  contact channels — **identical except row ids**, which are React keys and never rendered.

## Proof that the CMS is authoritative

`evidence/e2e-cms-to-public.log` — against the running server, not a script:

1. super-admin login over the REST API,
2. Arabic navigation label edited → `PATCH` (global update),
3. `GET /ar` shows the edited label **immediately** — no rebuild, no restart (the `afterChange` hook's
   `revalidateTag(tag, { expire: 0 })`),
4. `GET /api/globals/navigation?locale=en` unchanged — the Arabic edit does not bleed into English,
5. revert, and the public page returns to the shipped label,
6. the audit log holds both writes as `navigation_updated`.

## Two infrastructure decisions

**1 · Schema changes now require a migration (`push: false`).**
Payload's development push is interactive whenever drizzle-kit detects a destructive statement. In a
non-interactive shell that is a silent hang — it cost 15 minutes during this phase before forensics
identified it (`ep_poll`, idle database connection, no lock waits, no prompt). It also applies DDL
without a ledger row, which is precisely the drift this phase had to clean up. With `push: false`
every schema change is `payload migrate:create` + `payload migrate`, and the Phase C delta applied to
an empty database in 145 ms. Documented in `src/payload.config.ts` next to the adapter.

**2 · The development database was rebuilt from migrations.**
The drifted database (72 dev-pushed tables, no Phase C ledger row, probe writes in the navigation and
footer globals) was dropped and re-created, then migrated with the two real migrations, then seeded:
Phase B accounts/roles first, then the Phase C seeder. The ledger is now exactly
`20261007_162549_phase_b_auth_users_rbac | 20261007_173537_phase_c_globals`.

## The media read contract

`media.read` returns a **constraint** (`{ visibility: { equals: 'public' } }`) rather than a flat
deny, because a public media library has to be servable to anonymous visitors. Payload's static-file
handler calls the collection read with `isReadingStaticFile: true` and ANDs the result with a
filename/or-size match, so the same rule covers originals and derivatives.

`src/scripts/verify-phase-b.ts` was updated to assert the real property instead of "denied", and now
runs **37 checks / 0 failures** (was 34 in Phase B). New §2b, with real uploads:

* anonymous CAN read a public document,
* anonymous CANNOT see a private document in a query,
* anonymous CANNOT fetch a private document by id,
* a suspended account sees exactly the public surface,
* an editor with `media.read` sees both.
