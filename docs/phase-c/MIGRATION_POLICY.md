# Migration policy — schema is migrations-only

**Permanent rule: Payload/Drizzle schema push is DISABLED. Every schema change is an explicit
migration. No shared, staging or production database may use automatic schema push.**

## Where it is enforced

`src/payload.config.ts` → `postgresAdapter({ push: false })`, with the reason written next to it.

Two independent reasons:

1. **It hangs.** drizzle-kit's push is interactive whenever it detects a destructive statement. In a
   non-interactive shell it never returns — measured in this project as a 15-minute silent stall
   (process in `ep_poll`, idle database connection, no lock waits, no blockers, no prompt).
2. **It silently drifts.** Push applies DDL without a ledger row. Phase C began with exactly that
   state: 72 tables created by push, `payload_migrations` holding no Phase C record, and a plain
   `migrate` unable to run ("already exists"). The drift was removed by rebuilding the database from
   migrations.

## The workflow (only this workflow)

```bash
npx payload migrate:create <name>     # generate src/migrations/<timestamp>_<name>.{ts,json}
npx payload migrate                   # apply everything not yet in the ledger
```

Reproduction on an empty database — the acceptance test for this policy:

```
EMPTY DATABASE (0 tables)
  → npx payload migrate
      20261007_162549_phase_b_auth_users_rbac   51 ms
      20261007_173537_phase_c_globals          101 ms
  → 72 tables, ledger = exactly those two rows
  → ALLOW_PRODUCTION_SEED=true npx payload run src/scripts/seed-auth-foundation.ts
  → ALLOW_PRODUCTION_SEED=true npx payload run src/scripts/seed-content-globals.ts
  → admin boot OK · public boot OK · full test suite PASS
```

## Proof the application never mutates schema

A fresh database was created, the production server booted against it and served requests:

```
tables before boot:        0
GET /ar                    200   (static fallback — the CMS is honestly unavailable)
GET /api/globals/navigation 403
tables AFTER boot + requests: 0
payload_migrations table:     0
```

`SCHEMA_PUSH_OCCURRED = NO`. A missing schema produces a refused query and a logged fallback — never
a silent `CREATE TABLE`.

## Deployment implication

The deploy sequence must run `npx payload migrate` as a release step **before** the app starts
serving. Migrations are additive and idempotent by ledger; a failed migration aborts the release
rather than half-applying it.

## Test-fixture guard

`ALLOW_PRODUCTION_SEED` (seeder) and `ALLOW_VERIFICATION_WRITES` (verification scripts) gate every
script that creates accounts, roles or media fixtures. Verified: with a production-equivalent
environment and no flag, the seeder prints `REFUSED` and the database is left untouched
(`users = 0`).

## Seeding order (never reversed)

1. `seed-auth-foundation.ts` — the Super Admin, then the five system roles.
2. `seed-content-globals.ts` — site settings, contact, navigation, footer (ar → ids → en).

Business hours and social accounts are seeded **empty on purpose**: the owner has not published
working hours or social URLs, and inventing them is forbidden.
