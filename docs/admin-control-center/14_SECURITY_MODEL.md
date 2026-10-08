# 14 — Security Model

## 1. The boundary

```
public internet            →  / , /ar , /en , /api/brief , /sitemap.xml , /robots.txt
authenticated staff only   →  /admin , /api/admin/* , /api/preview
```

- `/admin` requires a session; unauthenticated requests get a login screen, never a redirect loop.
- Admin and preview routes are `noindex` and excluded from the sitemap.
- Draft content is readable **only** in preview mode (signed session) and never through public
  routes.
- The proxy continues to serve real 404s for unknown public paths; `/admin` is added to the known
  prefixes explicitly.

## 2. Authorization

- Every mutation is authorized **server-side** using the permission matrix in `09_…`.
  Hiding a button is a UX convenience, never the control.
- Payload's access-control functions run on the Local API too, so a server component cannot
  accidentally bypass permissions.
- Lead data is excluded from every public projection and from the default admin list for roles
  without `leads.read`.

## 3. Credentials

| Kind | Where it lives | Admin-visible? |
| --- | --- | --- |
| Public identifiers (GA4 ID, pixel IDs, GSC verification, Maps link) | database (tracking/settings) | yes, editable |
| Passwords | hashed in DB (argon2id/bcrypt ≥12) | never |
| DB connection, storage keys, SMTP/Resend key, GA4 service account, GSC OAuth refresh token, `BRIEF_WEBHOOK_TOKEN`, preview secret | host secret store → environment variables | **status only** ("مُهيأ / غير مُهيأ"), never the value |
| Session secrets | environment, rotated on incident | never |

Rule: no secret is ever accepted through a normal admin form. If a future integration needs a
secret, the admin shows documentation plus a "configured?" indicator.

## 4. Upload security

- Allow-list by extension + declared MIME + magic-byte sniff.
- Size caps per type; filename normalisation; no path traversal (storage keys are generated, never
  taken from the client filename).
- SVG sanitisation pipeline (see `08_…` §5); no `<script>`, no event handlers, no external refs.
- Uploaded files are served from object storage / a dedicated route with
  `Content-Disposition: inline` and `X-Content-Type-Options: nosniff`; never executed.
- Executable/script content types are rejected outright.

## 5. Injection and output safety

- All admin input is validated with shared Zod schemas; server-side validation is authoritative.
- Rich text output is rendered through a strict allow-list of tags/attributes (no raw HTML fields
  exposed to Editors).
- Structured data and metadata are built from typed values, never string-concatenated JSON.

## 6. Application hardening

| Control | Detail |
| --- | --- |
| Login throttling | exponential backoff per email+IP; lockout after repeated failures with a visible message |
| Sessions | httpOnly, secure, sameSite=lax, server-side revocation, "log out everywhere" |
| CSRF | SameSite cookies + origin checks on mutations; Payload's auth pattern |
| Rate limiting | shared store for the brief endpoint and login (replaces the in-memory Map) |
| Headers | keep the CSP, add `frame-ancestors` at the hosting layer, keep HSTS in production |
| CSP updates | generated from enabled integrations + hashed custom scripts (`12_…` §5) |
| Dependency hygiene | `npm audit` in CI, Dependabot/Renovate on, no new dependency without a stated reason |
| Error handling | generic public error messages; details only in server logs (no stack traces, no SQL) |
| Audit | every sensitive mutation writes an `audit-events` record (actor, action, resource, summary, IP, UA, time) |
| Backups | see §7 |

## 7. Data protection and recovery

- **Postgres:** managed instance with point-in-time recovery (7–30 days depending on provider) plus
  a nightly logical dump retained 30 days, stored in a separate bucket/account.
- **Media:** object-storage versioning + weekly inventory snapshot.
- **Restore drill:** one documented and executed restore before launch (target RTO 4 h, RPO 24 h).
- **Leads retention:** default 24 months, then anonymise; adjustable by the owner.

## 8. Threat notes specific to this project

| Threat | Mitigation |
| --- | --- |
| A marketer pastes a tracking snippet from a hacked site | Tier 1 native modules + hash-listed Tier 3 scripts |
| A departing contractor keeps admin access | Individual accounts (no shared logins), suspension invalidates sessions, audit log |
| Public brief endpoint abused | Honeypot + rate limit (shared store) + optional Turnstile |
| Draft content leaks and is indexed | Preview requires a session; drafts never rendered on public routes; short-lived preview cookies |
| SEO sabotage through settings | Roles + validation + audit + no direct robots.txt editing (only structured robots fields) |
| Compromised dependency | Minimal dependency surface, audit in CI, pinned versions, lockfile committed |

---

## IMPLEMENTATION STATUS — Phase B (2026-10-07)

**Implemented for the authentication and RBAC foundation.** What is live, and what it was verified
against:

| Control | Implementation | Evidence |
| --- | --- | --- |
| Accounts, sessions, lockout | `src/collections/Users.ts` — 2 h tokens, `useSessions`, 5 attempts → 10 min lock | `verify-phase-b.log` §6 |
| Immediate revocation on suspension | suspension clears sessions in `beforeChange` | 1 session → 0 sessions, permissions → 0 |
| Deny-by-default | every Phase B collection denies anonymous reads; the media library and its file endpoint are `403` for visitors | `live-checks.log` §3, §6 |
| Role-based authority | one resolution path (`resolvePermissions`), no `isAdmin` boolean anywhere | `PERMISSION_MATRIX.md` |
| High-risk permissions | withheld from ADMIN by a set **derived** from the catalogue | `src/lib/auth/roles.ts` → `ADMIN_WITHHELD` |
| Immutable audit trail | write-once collection; 12 actions; permission diffs on role edits | `live-checks.log` §5 |
| GraphQL exposure | playground 404 and introspection refused in production; `maxComplexity` 1000 | `live-checks.log` §7 |
| Account enumeration | suspension is checked **after** credential verification, so refusals cannot reveal which emails exist | `AUTH_ARCHITECTURE.md` §3 |
| No visible AR→EN fallback | Payload localization with `fallback: false`; a missing English value reads empty | `live-checks.log` §6 |

Not yet in scope (planned, not implemented — no claim is made about them): rate limiting at the
edge, 2FA, per-field permissions beyond `roles`/`status`, IP allow-listing, secret rotation, backups,
and the production hosting surface (TLS/HSTS/WAF).
