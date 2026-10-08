# 18 — QA and Acceptance Criteria

## 1. The rule that governs everything

The existing public QA must stay green, unchanged. Today: **smoke 37 passed / 5 skipped**,
**axe 18 passed / 0 violations**, zero horizontal overflow across 17 widths × 12 routes, and
zero console errors on valid routes. New work is accepted only if those numbers hold.

## 2. Test layers

| Layer | Tooling | Scope |
| --- | --- | --- |
| Unit | Vitest (new, admin pure logic only) | schemas, hours calculation, permission checks, redirect validation, slug helpers |
| API | Playwright request context | `/api/brief` contract, preview tokens, admin mutations rejected without permission |
| E2E public | Playwright (existing suites + extensions) | unchanged journeys + "content came from CMS" assertions |
| E2E admin | Playwright (new project) | login, edit, upload, reorder, publish, preview, restore, role limits |
| A11y | axe-core (existing + admin routes) | public site unchanged; admin key screens ≥ AA |
| Visual | Playwright screenshots + manual review | before/after migration diffs on every public route |
| Performance | existing CDP harness | public budgets enforced; admin budgets separate |
| Security | checklist + `npm audit` + manual probes | see §6 |

## 3. Acceptance criteria by module

| Module | Acceptance test (must be executable) |
| --- | --- |
| Auth | unauthenticated `/admin` → login; wrong password throttled; suspended user cannot log in; sessions invalidated on suspension |
| RBAC | an Editor cannot publish, cannot see leads, cannot open scripts; a Marketing user can export leads; every denial is server-side (API returns 403 even if the UI is bypassed) |
| Settings | change the phone number in admin → all `tel:`/`wa.me` links and the footer update without a code change; invalid number is rejected |
| Hours | set Sun–Thu 09:00–13:00 + 16:00–22:00 → contact page renders both periods, "مفتوح الآن" is correct at a mocked time, and `openingHoursSpecification` in schema matches |
| Social | add Instagram → icon appears in the footer and `sameAs` in Organization; disable → it disappears everywhere; reorder → order changes in both places |
| Media | upload 8 MB JPEG → derivatives generated, alt required, used-in list correct, delete blocked while referenced, replace keeps the page working |
| Pages/blocks | disable a section → gone with no gap; reorder → order persists; invalid hero copy (over max) → validation error; publish → live in < 60 s |
| Services | edit a promise → appears on the hub, detail page, home path panel, and the WhatsApp message for that capability |
| Projects | create a case study with images + results → appears on Work hub, sitemap, and home teaser; unpublish → disappears from all four |
| Articles | schedule an article for a future date → not public before, public after (job runs), sitemap + Article schema update |
| SEO | set a page's description → SERP/social previews match, the rendered `<meta>` matches, fallback chain verified when cleared |
| Redirects | change a service slug → old URL 301s to the new one; loop/self-redirect rejected at save |
| Leads | submit the public brief → record appears with attribution; status change persists; export produces a correct CSV; export is audited |
| Analytics | with credentials missing → honest connect state; with credentials → numbers match a manual GA4 check within the cache window |
| Tracking | enable Meta Pixel → loader appears only after marketing consent; CSP allows it (no console errors); disabling removes it |
| Scripts | a script saved by a Super Admin executes with the correct CSP hash; an Editor cannot open the screen; every change is in the audit log |
| Revisions | publish v2, restore v1 → a new draft is created (live content untouched) and the diff is visible |
| Audit | every item in §7 of the security doc produces a log entry with actor, action, resource and time |
| Migration | before/after HTML diff is empty (modulo approved changes) for all public routes in both locales |
| Performance | public route JS did not grow; admin bundle is absent from public routes (verified by file inspection + network trace) |

## 4. Data-integrity tests

- Deleting a role in use is refused.
- Deleting the last Super Admin is refused.
- Deleting media in use is refused with a usage list.
- Restoring a revision never overwrites published content without an explicit publish.
- Orphaned references (a block pointing at deleted media) are prevented by referential checks.

## 5. Migration verification protocol

1. Freeze content edits (owner notified).
2. Seed → diff → fix drift → re-seed (idempotency proof: second run produces no changes).
3. Route-by-route comparison in both locales: HTML, meta tags, JSON-LD, sitemap entries.
4. Screenshot comparison at 390 / 768 / 1440 for the home, a service, work, contact, start.
5. Run the full existing suites against the CMS-backed build.
6. Owner reviews the preview; only then is the provider flipped in production.

## 6. Security test checklist (pre-launch)

- Auth bypass attempts on every admin route and API.
- IDOR attempts: fetch another entity by id with a low-privilege account.
- Upload abuse: SVG with script, double extension, oversize, zip-bomb image.
- XSS attempts through rich text, alt text, SEO fields, redirect targets.
- CSRF attempt on a mutation endpoint without the session's origin.
- Rate-limit verification against the shared store.
- CSP check with each integration enabled (no blocked-load console errors).
- Restore drill (database + media) executed on staging and timed.

## 6b. Acceptance criteria added by the owner's 2026-10-07 amendments

| Area | Executable criterion |
| --- | --- |
| Localization | a page/block with an incomplete required EN field **cannot be published** for EN; the admin shows `Translated / Partially translated / Missing translation`; no English page ever renders Arabic body copy (grep-style assertion over rendered EN HTML) |
| Localization (metadata) | an image with no EN alt falls back explicitly and Site Health lists it — the fallback is never silent |
| Real-proof blocks | `testimonials` without a quote+attribution, `metrics` without value+label (and source note where verifiable), `logo-cloud` without approved real assets → publish is refused by validation, with the reason shown |
| Custom scripts | an Editor/Marketing/Admin account cannot see the screen and receives 403 from the API; only a Super Admin can save/enable; every change appears in the audit log; enabling in production requires explicit confirmation; a saving that would violate the CSP is rejected with an explanation |
| Analytics V1 | the dashboard shows only the approved V1 metric set; every card names its source and window; with a source disconnected the card reads "غير متصل" and shows no number |
| Leads boundary | the leads module exposes exactly the six V1 statuses and the approved feature set — no pipeline/task/invoice/forecast surfaces exist in the UI or the schema |
| Phase A carry-over | Next 16.4.0 + `cacheComponents` stay enabled; PPR remains on public routes; no admin code in any public client bundle |

## 7. Definition of done for the whole project

The eight administrator tasks in `01_ADMIN_VISION_AND_SCOPE.md` §6 all succeed with no developer
involvement, the existing public suites stay green, the migration diff is empty, the security
checklist passes, and the owner signs off on staging. Until then the release candidate is not
accepted, regardless of how complete the feature list looks.
