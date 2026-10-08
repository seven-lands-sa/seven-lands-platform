# 09 — Users, Roles & Permissions

## 1. Accounts

| Field | Notes |
| --- | --- |
| name | display name |
| email | unique, login identity |
| password | hashed with a modern KDF (argon2id or bcrypt cost ≥ 12); never recoverable, only resettable |
| roles | one or many role references |
| status | `active` · `suspended` |
| lastLoginAt | shown in the users table |
| twoFactor | optional TOTP (Phase B extension, off by default) |

Bootstrap: the first super-admin is created by a CLI seed command (`payload create-admin`) — never
through a public web form. Public sign-up does not exist.

## 2. Permissions model

Permissions are **resource × action**, checked server-side on every request and mutation.

```
pages.read      pages.create   pages.update   pages.publish  pages.delete
services.*      projects.*     articles.*     media.*
leads.read      leads.update   leads.export   leads.delete
navigation.manage   footer.manage   social.manage   hours.manage   settings.manage
seo.read        seo.update     redirects.manage
analytics.read  searchconsole.read
tracking.manage        (pixels, GA4 — public identifiers only)
scripts.manage         (custom code — HIGH RISK)
consent.manage
users.manage    roles.manage   audit.read     backups.read
```

`*` above expands to read/create/update/publish/delete per collection, so a custom role can be
"can edit services but cannot publish them".

## 3. Default roles

| Role | Intended for | Grants |
| --- | --- | --- |
| **Super Admin** | owner / lead developer | everything, including `scripts.manage`, `users.manage`, `roles.manage` |
| **Admin** | operations manager | all content + settings + leads + SEO + tracking (public IDs) + analytics. **No** custom scripts, **no** user management, **no** role editing |
| **Marketing** | marketing specialist | content read/update, SEO, analytics, Search Console, tracking (public IDs), leads read/update/export, consent. **No** publish rights for legal pages, no scripts |
| **Editor** | content writer | create/update content, upload media, submit for review (`draft` only). Publish only if granted `*.publish` |
| **Viewer** | owner's advisor / accountant | read everything except leads; `analytics.read` |

Roles are documents, so a custom role ("Agency Partner — leads only") can be created later without
schema changes.

## 4. High-risk permissions and their extra guards

| Action | Guard beyond RBAC |
| --- | --- |
| `scripts.manage` | Super Admin only · re-authentication prompt · mandatory description · warning modal · audit entry with a diff · environment scope required |
| `tracking.manage` (enabling a pixel) | Admin+ · audit entry · consent category must be chosen before enabling |
| Deleting published content | soft delete/archival by default; permanent delete is Super Admin only, with a typed confirmation |
| Media deletion in use | blocked (see `08_…` §4) |
| Changing legal text | Editor may draft; publishing requires `pages.publish` **and** legal approval status |
| Role/user changes | Super Admin only, audited, and cannot remove the last Super Admin |
| Exporting leads | Admin/Marketing only; every export is audited (who, when, count) |

## 5. Sessions

- Server-side sessions with httpOnly, secure, sameSite=lax cookies; sliding expiry (default 7 days).
- **Log out everywhere** available to each user; suspending a user invalidates sessions immediately.
- Login rate limiting + lockout backoff per email+IP.
- Password reset by single-use, time-limited token delivered by email (requires an email provider —
  a launch dependency, see `19_…`).
- Optional TOTP 2FA for Super Admin and Admin; recommended before the second editor joins.

## 6. Team size assumption

The realistic V1 team is 1–3 people (owner + one marketer + one writer). The permission model is
therefore **deliberately more capable than the current team needs** — it is the cheap part, and
skipping it now means a painful retrofit when a partner or agency gets access. It does not add UI
complexity for a single-user setup: with one account, the roles screen simply shows a single role.

---

## IMPLEMENTATION STATUS — Phase B (2026-10-07)

**Implemented.** This document was the plan; the code now exists and was verified.

| Plan element | Where it lives now |
| --- | --- |
| accounts, status, roles, lastLoginAt | `src/collections/Users.ts` |
| roles as data, with per-permission checkboxes | `src/collections/Roles.ts` — 36 permissions in 9 collapsible groups |
| `resource.action` permissions, no `isAdmin` boolean | `src/lib/auth/permissions.ts` + `access.ts` |
| five default roles | seeded by `src/scripts/seed-auth-foundation.ts` (`SYSTEM_ROLES`) |
| last-active-Super-Admin protection | `src/lib/auth/invariants.ts`, enforced in `beforeChange`/`beforeDelete` |

Notes that differ from, or go beyond, the text above — all deliberate:

- **`status` values are `ACTIVE` / `SUSPENDED`** (upper-case, as stored).
- **A `users.delete` permission was added** (high-risk, Super Admin only by default). The plan listed
  read/create/update/suspend only, but account deletion exists as an operation and needs its own
  gate rather than being folded into `users.suspend`.
- **`audit.read` is Super-Admin-only by default.** It is a `highRisk` permission, and §10 requires
  high-risk permissions to default to Super Admin.
- **`roles` and `status` are gated on `create` as well as `update`** — otherwise `users.create`
  alone could mint a Super Admin.
- Passwords are hashed by Payload's own KDF; nothing in this project touches the hash.

Full details: `phase-b/AUTH_ARCHITECTURE.md`, `phase-b/PERMISSION_MATRIX.md`,
`phase-b/SECURITY_VERIFICATION.md`, `phase-b/PHASE_B_REPORT.md`.
