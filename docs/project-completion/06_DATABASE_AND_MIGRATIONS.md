# 06. DATABASE AND MIGRATIONS

**Engine:** PostgreSQL 17.1 (Windows x64)  
**Database Name:** `seven_lands_dev`  
**Adapter:** `@payloadcms/db-postgres` (3.90.2) with Drizzle ORM underneath

---

## 1. Migration Ledger

Schema changes are governed strictly by timestamped migrations in `src/migrations/`.

| Batch | Timestamp / Migration Name | Description & Affected Tables |
|---|---|---|
| **1** | `20261007_162549_phase_b_auth_users_rbac` | Users, roles, permission catalog, initial audit skeleton |
| **1** | `20261007_173537_phase_c_globals` | 6 Globals: site settings, contact, hours, social, nav, footer |
| **1** | `20261007_200052_phase_d_media_library` | Media collection, derivative metadata, visibility rules |
| **1** | `20261007_212705_phase_e_pages_blocks` | Pages collection, blocks tables, block versioning |
| **1** | `20261007_212958_phase_e_block_fields_align`| Field alignment for shared page sections |
| **1** | `20261007_213556_phase_e_shared_sections` | Cross-page section tables (why, cta, header) |
| **2** | `20261008_102014_phase_e_about_contact_start`| System page specific sections (briefForm, contactPanel) |
| **3** | `20261008_103522_phase_f_services_projects_insights` | Domain collections: Services, Projects, Insights |
| **4** | `20261008_103658_phase_f_service_glyph_registry` | Glyph identifier registry on services collection |
| **5** | `20261008_220122_phase_h_leads_collection` | Phase H: Leads collection, internal notes, lead audit types |

Total migrations in codebase: **10 migrations** (all applied in active database).

---

## 2. Invariant Rule: `push: false`

The database configuration in `src/payload.config.ts` explicitly enforces:

```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URI || '',
  },
  push: false,
})
```

### Rationale
- **No Schema Drift:** Automatic schema push by drizzle-kit in development can silently mutate columns, drop constraints, or stall interactive terminal prompts when encountering destructive changes.
- **Strict Reproducibility:** Every database change must be generated via `npx payload migrate:create` and executed via `npx payload migrate`.

---

## 3. Empty Database Reproduction Gate
The reproducibility of the entire database from zero was tested and verified:
1. Created empty database `seven_lands_repro`.
2. Applied migrations via `npx payload migrate`.
3. Applied idempotent seeds (`seed-auth-foundation`, `seed-content-globals`, `seed-pages`, `seed-services`).
4. Schema shape verified: 210 tables, 1,646 columns, 159 enums, matching `seven_lands_dev` identically.
5. Production builds and tests run cleanly against the reconstructed schema.
