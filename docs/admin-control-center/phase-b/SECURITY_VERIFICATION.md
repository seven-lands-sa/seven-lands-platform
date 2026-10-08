# SECURITY VERIFICATION — Phase B

What was run, what it proved, and what it found. Two independent layers, because "the config looks
right" is not evidence.

## Method

1. **Behavioural assertions only.** No check matches on error *text*: the admin and the API are
   Arabic-first, so a regex on "Forbidden" would pass for the wrong reason. A denial must produce a
   thrown error or a refusal, and **every denial is paired with a positive control** so a check
   cannot pass because everything is broken.
2. **Two layers.** The Local API layer (`overrideAccess: false`) exercises the access rules
   themselves; the REST layer exercises the same rules through the real HTTP stack the browser uses.
3. **A known starting state.** The harness repairs the seeded Super Admin and refuses to continue if
   a *real* second Super Admin exists, otherwise the §14 checks would be meaningless.

## Layer 1 — Local API authorization matrix

```
command: npx payload run src/scripts/verify-phase-b.ts
result : 34 checks passed, 0 failed        PHASE_B_SERVER_ENFORCEMENT = PASS
log    : .phase-b-evidence/verify-phase-b.log
```

| Section | Assertions | Result |
| --- | --- | --- |
| catalogue integrity | 36 permissions, no duplicates; ADMIN holds no high-risk permission beyond the 3 documented delegations | ✅ |
| authorization matrix | 6 operations × 7 personas (anonymous, super admin, admin, editor, marketing, viewer, suspended) | ✅ 6/6 rows match the role matrix exactly |
| audit write-once | Super Admin cannot create / update / delete; the row survives; the system writer still can | ✅ 5/5 |
| last-Super-Admin invariant | strip refused · suspend refused · delete refused · allowed once a second exists · state restored | ✅ 5/5 |
| permission resolution | each role resolves to exactly its own permission set; suspended resolves to 0 | ✅ 6/6 |
| session revocation | suspended user cannot log in; active session exists before suspension and is gone after; permissions drop to 0; access refused | ✅ 6/6 |
| anonymous | read denied on all four collections | ✅ 4/4 |

## Layer 2 — REST and GraphQL against the production build

```
command: bash .phase-b-evidence/live-checks.sh      (production build on :3000)
result : 36 checks passed, 0 failed     PHASE_B_LIVE_ENFORCEMENT = PASS
log    : .phase-b-evidence/live-checks.log
```

Highlights, all against the built artefact rather than a dev server:

```
anonymous GET /api/{users,roles,audit-events,media} ...... 403
super admin GET /api/{users,roles,audit-events,media} .... 200
viewer GET /api/media .................................... 200     (holds media.read)
viewer GET /api/{users,roles,audit-events} ............... 403
editor upload media ...................................... 201     (media.upload)
editor delete media ...................................... 403     (media.delete withheld)
Super Admin POST/PATCH/DELETE /api/audit-events .......... 403     (write-once, even for the top role)
anonymous /api/media/file/og-ar.png ...................... 403     (library not enumerable)
anonymous /api/media/file/og-ar-400x300.png .............. 403
```

**GraphQL (§3).** Pinned explicitly in `src/payload.config.ts`, then verified live in a production
build:

| Probe | Result |
| --- | --- |
| `GET /api/graphql-playground` | **404** — the playground is not served in production |
| `POST /api/graphql` with `{ __schema { types { name } } }` | refused: *"GraphQL introspection is not allowed, but the query contained `__schema` or `__type`"* |
| `maxComplexity` | 1000 (limits abusive queries) |

## Cross-origin cookie checks (added 2026-10-07)

The admin UI authenticates with the `payload-token` cookie, which Payload only accepts from a
trusted `Origin`. Measured on the production build with the preview origin in
`PAYLOAD_TRUSTED_ORIGINS`:

| Request | Result |
| --- | --- |
| `GET /api/users/me`, cookie + no `Origin` | user returned |
| `GET /api/users/me`, cookie + `Origin: http://localhost:3000` | user returned |
| `GET /api/users/me`, cookie + `Origin: https://3000-<id>.e2b.app` | user returned |
| `GET /api/users/me`, cookie + `Origin: https://evil.example` | `{"user":null}` — refused |
| `POST /api/media` (authenticated write) + preview `Origin` | `201`, then `DELETE` → `200` |
| Real browser: login on the preview origin | dashboard renders Arabic RTL; `users` + `roles` list with data |

## Media specifics verified

| Claim | Evidence |
| --- | --- |
| upload accepted, metadata derived | 1200×630 PNG stored, 45,612 B, focal point 50/50 persisted |
| both derivative sizes generated | `og-ar-400x300.png` (33,452 B) and `og-ar-768x512.png` (77,846 B) present on disk — measured, not assumed |
| localized values are per-locale | `ar → "بطاقة مشاركة بالعربية"`, `en → "English social card"` |
| **no visible AR→EN fallback** | a document with only an Arabic `alt` returns **empty** for `?locale=en` |
| type allowlist | raster images + PDF only; SVG deliberately excluded (same-origin script vector) |
| size ceiling | 15 MB, enforced before storage |

## Defects found during Phase B and fixed

Found by running the system, not by reading it. Each was a real defect; none was in the approved
plan.

| # | Defect | How it surfaced | Fix |
| --- | --- | --- | --- |
| 1 | `afterLogout` hook destructured `user`, which Payload does **not** pass to that hook (`AfterLogoutHook = { collection, context, req }`) — every logout would have silently written no audit entry | TypeScript, then confirmed against `payload/dist/auth/operations/logout.js` | read the user from `req.user`, which the logout operation guarantees before hooks run |
| 2 | `Access`-typed helpers could not be used as **field-level** access (`FieldAccessArgs.id` is `string \| number`, `AccessArgs.id` is `number`) | `tsc --noEmit` | helpers take a structural `AccessArgsLike`, so one helper guards a collection *and* a field |
| 3 | `roles` and `status` were gated on **update only**; `users.create` alone could have minted a Super Admin or created a pre-suspended account | reasoning about the access matrix, then proven by the matrix run | added `create` rules for both; Payload's first-user bootstrap uses `overrideAccess: true`, so seeding is unaffected |
| 4 | `ADMIN_WITHHELD` was a hand-written list that had drifted from the catalogue: four permissions were flagged `highRisk` yet granted to ADMIN | scripted comparison of `HIGH_RISK_PERMISSIONS` vs `ADMIN_WITHHELD` | the withheld set is now **derived** from the catalogue minus three documented delegations; a future high-risk permission cannot silently land in ADMIN |
| 5 | `resourceID` became the column `resource_i_d` under the Postgres adapter | reading the created schema | renamed to `resourceId` (matches `05_DATA_MODEL.md`), migration regenerated |
| 6 | the seed script wrote its own audit rows **in addition** to the collection hooks — every seeded role appeared twice in the log | counting rows: 12 events for 6 operations | the collection hooks are the single writer; the seed no longer duplicates them |
| 7 | media uploads over multipart REST silently ignored field values (`alt` "required" no matter what was sent) | reproducing the failure, then reading `payload/dist/utilities/addDataAndFileToRequest.js` | not a defect in our code: Payload reads multipart **fields from a single `_payload` JSON part**. The verification harness was corrected to the real contract (and localized fields are written one locale at a time, exactly as the admin UI does) |

Two further issues were created *by the verification harness itself* and fixed there, not in the
product: a stale in-memory Super Admin handle, and a fixture persona that made the §14 invariant
untestable by always providing a second Super Admin.

## What this phase does **not** claim

- **No penetration test.** The matrix proves the rules are enforced; it does not prove the absence
  of undiscovered vulnerabilities.
- **No production hardening of the host.** TLS, HSTS, WAF, edge rate limiting, backups and secret
  management are deployment concerns and are untouched here (`PRODUCTION_MUTATED = NO`).
- **Rate limiting is account-level** (Payload's lockout). Per-IP throttling on `/api/users/login`
  belongs at the edge and is a carry-forward.
- **Media files are not publicly deliverable yet** — deliberate, see `AUTH_ARCHITECTURE.md` §8.
- **The `PAYLOAD_ALLOW_INSECURE_COOKIES` escape hatch** must not be set on any real deployment; the
  verification build used it because it runs over plain HTTP.

## Reproduce

```bash
sudo pg_ctlcluster 17 main start                       # local dev PostgreSQL only
npx payload migrate                                    # real migration, from an empty schema
npx payload run src/scripts/seed-auth-foundation.ts    # 5 roles + first Super Admin (idempotent)
npx payload run src/scripts/verify-phase-b.ts          # 34 assertions
npm run build && PAYLOAD_ALLOW_INSECURE_COOKIES=true npm run start -- --port 3000
bash .phase-b-evidence/live-checks.sh                  # 36 assertions over HTTP
# to use the admin UI from a host other than serverURL (preview/staging), add that origin:
#   PAYLOAD_TRUSTED_ORIGINS=https://<host>  (comma-separated, no wildcard)
npx tsc --noEmit && npx eslint . && npx playwright test
```
