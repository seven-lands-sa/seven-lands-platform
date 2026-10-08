# 19 — Risks and Open Decisions

## A. Technical decisions I am making (no owner input needed)

| # | Decision | Rationale |
| --- | --- | --- |
| T1 | Payload in-app over a custom admin or an external CMS | see `02_…`, `03_…` |
| T2 | Paired AR/EN fields on one record, not separate records | atomic publishing; no "half-translated page" state |
| T3 | Slugs stay Latin in both locales | protects existing URLs, the proxy route table and SEO |
| T4 | Structural route table unchanged in V1; dynamic pages deferred | keeps real-404 behaviour and caching intact (audit D2) |
| T5 | Blocks are code-defined; instances are content | controlled flexibility |
| T6 | Object storage over local disk | serverless-safe, CDN, versioned |
| T7 | Rate limiting moves to a shared store | fixes audit finding D3 before leads are stored |
| T8 | Secrets in env only; admin shows status | prevents credential leakage through forms/exports |
| T9 | Consent categories modelled now, banner switchable | avoids a rewrite if policy changes |
| T10 | Static content provider kept as rollback | makes migration reversible in seconds |

## B. Genuine owner decisions (these block or shape specific phases)

| # | Decision | Why it matters | Needed before |
| --- | --- | --- | --- |
| O1 | **Hosting + database provider** (managed Postgres + object storage) | determines backups, cost, and whether the rate limiter can stay in-memory | Phase A |
| O2 | **Email provider** for lead notifications + password resets | leads currently have no notification path; resets need delivery | Phase B/H |
| O3 | **Analytics identities**: GA4 property, GTM container, Search Console property, ad pixels | Phase I/J cannot connect without them | Phase I |
| O4 | **Articles in V1?** ("رؤى" publishing or hub stays a designed empty state) | changes Phase F scope meaningfully | Phase F |
| O5 | **Who edits?** (owner only vs +marketer vs +agency) | decides whether 2FA and per-role training are needed on day one | Phase B |
| O6 | **Custom scripts: needed at all?** | if no, drop the riskiest module entirely | Phase J |
| O7 | **Consent banner needed?** (traffic geography/legal posture) | determines whether marketing pixels load unconditionally, post-consent, or not at all | Phase J |
| O8 | **Legal approval of Privacy/Terms** | pages stay `noindex` until approved; admin editing is gated the same way | anytime |
| O9 | **Media budget/provider preference** (R2 vs S3 vs VPS disk) | cost + migration path | Phase D |
| O10 | **2FA mandatory for admins?** | security vs friction for a small team | Phase B |

*Note: O1, O2 and O3 are the only ones that can delay the critical path. The rest can be decided
while earlier phases run.*

## C. Risks

| # | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | ~~Payload and Next 16 are incompatible~~ | — | — | **CLOSED by Phase A (2026-10-07):** Payload 3.90.2 officially supports Next 16; verified against this exact project (build, PPR, admin, Local API, media, RTL). See `PHASE_A_SPIKE_REPORT.md`. Downgrading Next is no longer part of any fallback path. |
| R2 | Admin bundle leaks into public routes | Low | High | route-segment isolation; explicit test that public bundles do not contain admin code |
| R3 | Draft/preview mode interacts badly with PPR/cacheComponents | Medium | Medium | preview served via separate cached-at-request path; explicit tests; if hostile, preview degrades to a non-cached render |
| R4 | Migration changes rendering subtly | Medium | High | before/after HTML + visual diff; static provider kept as rollback |
| R5 | Editor publishes a broken layout despite variants | Low | Medium | variants only; validation; preview; revisions |
| R6 | Third-party pixel breaks the CSP and silently fails | Medium | Medium | CSP generated from enabled integrations; status shows `error` when blocked |
| R7 | Lead storage introduces a privacy obligation the policy doesn't cover | Low | Medium | update the privacy text in the same release; retention policy + truncated IP |
| R8 | Two people edit the same document concurrently | Medium | Low | autosave conflict warning + revisions |
| R9 | Rate limiting still bypassable in a new deployment topology | Medium | Medium | shared store mandatory in Phase H |
| R10 | Admin becomes a maintenance burden for a small business | Medium | Medium | prefer upstream features over custom code; document every customisation in one file |
| R11 | Owner's staff never adopt the admin (continues asking the developer) | Medium | High | Arabic-first UI, the eight-task success test, one-page training guide, command palette |
| R12 | Cost creep (DB + storage + email + analytics tooling) | Low | Medium | all providers have free/low tiers at this scale; cost summary provided before Phase A |

## D. Deliberately deferred (documented, not planned in detail)

- Dynamic page creation (`/p/{slug}` campaign pages) — Phase-2 extension described in `06_…` §6.
- Multi-language beyond AR/EN.
- Team/careers modules and richer About page blocks.
- Lead → project conversion automation, WhatsApp Business API integration.
- Full split-screen live preview (iframe-based) — draft preview covers the need first.
- TOTP enforcement, SSO, IP allow-listing for `/admin`.
