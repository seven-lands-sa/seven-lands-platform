# AUTH ARCHITECTURE — Phase B

How authentication and authorization actually work in this codebase, written against the code that
is on disk. Every claim here is checkable in the referenced file.

## 1. The shape of the decision

Payload's built-in auth is used for what it does well — password hashing, login, sessions,
password reset, brute-force lockout — and **authorization is not Payload's model**. Payload's native
model is per-collection access functions with no notion of permissions; the brief explicitly rejects
an `isAdmin` boolean and asks for real `resource.action` permissions that survive custom roles.

So the two are combined:

```
login (Payload auth)                       authorization (our layer)
─────────────────────                      ────────────────────────
password verify ──▶ user document ──▶ roles[] ──▶ role documents ──▶ permission set
sessions, lockout                          (data, seeded — never a hard-coded role check)
```

`user.roles[]` is a relationship to the `roles` collection. A role document holds **one checkbox per
permission** (36 of them) plus a `fullAccess` flag. Adding a permission to the catalogue in a later
phase does not require touching the authorization code — a `fullAccess` role picks it up
automatically, and every other role gets it only when someone ticks it.

## 2. Files, and what each one owns

| File | Responsibility |
| --- | --- |
| `src/lib/auth/permissions.ts` | the catalogue: 36 permissions in 9 groups, each with an Arabic label, a description of the rule it grants, and a `highRisk` flag; `ALL_PERMISSIONS`, `HIGH_RISK_PERMISSIONS`, `isPermission()` |
| `src/lib/auth/roles.ts` | `SYSTEM_ROLES` (the five seeds), the derived `ADMIN_WITHHELD` set, `permissionFieldName()`, `permissionsFromRoleDocs()` — role document → permission set |
| `src/lib/auth/access.ts` | **the single resolution path**: `resolvePermissions()` (user → roles → permissions, memoised per request), and the `Access` helpers every collection uses |
| `src/lib/auth/invariants.ts` | the last-active-Super-Admin invariant, with the Arabic failure message |
| `src/lib/auth/audit.ts` | `recordAuditEvent()` — the only writer of the audit log; never throws |
| `src/lib/auth/current-user.ts` | request-scoped helpers for server components and route handlers (`getCurrentUser`, `can`, `requireCan`) — **type-checked only**: no Phase B screen consumes it yet, so it is not claimed as verified |
| `src/collections/Users.ts` | the auth-enabled collection: sessions, lockout, cookies, suspension, audit hooks, invariant hooks |
| `src/collections/Roles.ts` | role documents; the 9 grouped checkbox blocks; system-role freeze; permission-diff auditing |
| `src/collections/AuditEvents.ts` | write-once audit log (see §5) |
| `src/collections/Media.ts` | the media library and its permission boundary |
| `src/scripts/seed-auth-foundation.ts` | idempotent seeding of the 5 roles + first Super Admin |
| `src/scripts/verify-phase-b.ts` | the executable authorization matrix (34 assertions) |

**One resolution path (§13).** `resolvePermissions(payload, user, cache, req)` is the only place
that turns a user into a permission set. `permissionsFor(req)` wraps it with a per-request memo
attached to `req.context.__permissions`. Collections call `requirePermission("media.upload")` — they
never contain an authorization algorithm, and they never see a role name.

## 3. Login order — why suspension cannot enumerate accounts

Payload runs `beforeLogin` **after** the password has been verified. That ordering is what makes
the suspension check safe to put there: an attacker who does not know the password gets the same
generic `AuthenticationError` whether the account exists, is suspended, or has a wrong password.
Our hook only speaks once credentials are proven:

```
checkLoginPermission → generic error for any unknown/locked account
password verify      → generic error on mismatch
resetLoginAttempts
beforeLogin          → HTTP 403 "هذا الحساب موقوف…"  ← suspension is only revealed here
jwtSign / set cookie
afterLogin           → lastLoginAt + audit event
```

Verified empirically (`verify-phase-b.log`, section 6): a suspended account cannot log in, and its
role set resolves to **zero** permissions.

## 4. Sessions, cookies and revocation

- `tokenExpiration: 7200` (2 h) — a stolen token has a bounded life.
- `useSessions: true` — sessions live on the user document, which is what makes *immediate*
  revocation possible.
- Suspension clears `sessions[]` in `beforeChange`, so a user suspended mid-session loses access on
  their next request rather than at the next login. Proven: the fixture had 1 stored session before
  suspension and 0 after, and its permission set went from 8 to 0.
- Cookies are `SameSite=Lax` and `Secure` in production. The verification build runs over plain
  HTTP, so an explicit, clearly-named escape hatch exists — `PAYLOAD_ALLOW_INSECURE_COOKIES=true`
  — documented in `.env` as something that must never be set on a real deployment.
- Login attempts: 5 failures lock the account for 10 minutes (`maxLoginAttempts` / `lockTime`);
  unlocking a locked account requires `users.suspend`, because lifting a lockout is a
  security action, not an editing action.

### Cross-origin hosts — why the admin cookie needs its origin trusted

Payload accepts the `payload-token` **cookie** only when the request's `Origin` is listed in
`payload.config.csrf`, or when there is no `Origin` and `Sec-Fetch-Site` is one of
`same-origin` / `same-site` / `none` (see `payload/dist/auth/extractJWT.js`). Browsers always send
`Origin` on mutating requests, so the admin works on `serverURL` out of the box — but **not** from
any host that differs from it: a preview URL, a staging alias, a port-forward.

`payload.config.ts` therefore builds `csrf` as `[serverURL, ...PAYLOAD_TRUSTED_ORIGINS]`.
`PAYLOAD_TRUSTED_ORIGINS` is a comma-separated list, never a wildcard, and stays unset in
production unless the admin is genuinely served from more than one origin.

Proven on the production build: with `PAYLOAD_TRUSTED_ORIGINS` set to the hosting preview origin,
`POST /api/users/login` + `GET /api/users/me` with that `Origin` returns the user, an authenticated
media upload with that `Origin` returns `201`, and `Origin: https://evil.example` still returns
`{"user":null}`. `Authorization: JWT` is unaffected by this rule — which is exactly why the
scripted harnesses never hit it, and why a `curl` without browser headers is not a valid test of
the admin UI.
  unlocking a locked account requires `users.suspend`, because lifting a lockout is a
  security action, not an editing action.

## 5. Audit log

`audit-events` has `create`, `update` and `delete` set to `denyAll` — for **every** caller,
including a Super Admin. The only writer is `recordAuditEvent()`, which runs as the system
(`overrideAccess: true`) from collection hooks. That is what makes the history trustworthy: there
is no "edit audit log" screen, no API path, and no admin path to rewrite it. Verified through both
layers (Local API and REST: 403 on POST/PATCH/DELETE, and the target row still reads back
unchanged).

Actions recorded in this phase: `login`, `login_failed`, `logout`, `user_created`, `user_updated`,
`user_suspended`, `user_reactivated`, `user_deleted`, `role_changed`, `role_created`, `role_updated`,
`role_deleted`. Role edits record a **permission diff** (`إضافة N، إزالة M`) rather than "something
changed" — see the seed re-run in `verify-phase-b.log`, where exactly one role had one permission
removed and exactly one audit row appeared.

Writes are attributed to `system` when there is no request user (seeds, scripts), so the log never
shows a real change with a blank actor. The `actor` relationship is `ON DELETE SET NULL` — deleting
a user does not delete their history.

## 6. The invariant that prevents a locked-out system

`assertSuperAdminRemains()` guards suspension, deletion and role-stripping of the **last active
Super Admin**, in both `beforeChange` and `beforeDelete`, with an Arabic explanation. It is
deliberately narrow:

- "Super Admin" is **derived from data** (a role with `fullAccess: true`), not from an email
  allow-list or a hard-coded id.
- A second active Super Admin makes the same operations legal again — the rule protects the system,
  not an individual.
- It does not block editing a Super Admin's name, email or language.

Verified four ways in one run (`verify-phase-b.log` §4): strip refused, suspend refused, delete
refused, and — after creating a *second* Super Admin — suspension allowed. The harness restores the
original account afterwards, and a separate guard refuses to run the test at all if a real second
Super Admin exists.

## 7. Deliberate non-goals

- **No CAPTCHA** on the login form. There is no evidence of automated abuse in this project's
  history, and adding one would be security theatre that costs every real user. Rate limiting is
  Payload's lockout plus HTTP-rate limiting at the edge when the site is deployed.
- **No 2FA** in Phase B. It is a sensible future addition; it is not in the approved scope, and
  half-implementing it would be worse than not having it.
- **No per-field permissions.** Permissions are per operation on a resource, which is what the
  brief's `resource.action` model asks for. Field-level rules exist only where they are genuinely
  about security (`roles`, `status` on users — see §8), not as a general mechanism.

## 8. Field-level access — where hiding is not enough

Two fields on `users` carry their own access rules, because collection-level access alone would let
a lesser permission escalate:

| Field | Create | Update | Why |
| --- | --- | --- | --- |
| `roles` | `users.update` | `users.update` | assigning roles is the privilege-escalation path; without the create rule, `users.create` alone could mint a Super Admin |
| `status` | `users.suspend` | `users.suspend` | without the create rule, a user could be created pre-suspended or pre-activated by someone who may not suspend |

Payload's first-user bootstrap runs with `overrideAccess: true`, so seeding the initial Super Admin
is unaffected by these rules. A caller without the permission does not get an error — the value is
stripped and the field default applies, which is the correct behaviour: they simply cannot express
the privileged intent.

**Media** is behind its own three permissions (`media.read`, `media.upload`, `media.delete`, the
last one high-risk). Reading the library is a staff action, so the file endpoint is `403` for
anonymous visitors: unpublished uploads must not be enumerable. Public delivery of the specific
files a page references is a Phase C decision, recorded as a carry-forward rather than guessed at
now.
