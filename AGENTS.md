<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Phase C invariants (do not break these)

* **Migrations only.** `push: false` in the Postgres adapter is permanent. Schema changes are
  `npx payload migrate:create` + `npx payload migrate`. See `docs/phase-c/MIGRATION_POLICY.md`.
* **Two origins.** `SITE_CANONICAL_URL` is what is published (canonical, hreflang, sitemap, JSON-LD,
  OG). `RUNTIME_ORIGIN` / `NEXT_PUBLIC_SERVER_URL` is where this process runs. Never publish the
  runtime origin; never point canonical at a preview. See `docs/phase-c/ORIGINS_AND_HEADERS.md`.
* **Client hints are admin-only.** Public `Critical-CH` is deliberately removed by scoping in
  `next.config.ts`; the admin keeps it. Re-measure with `scripts/measure-nav-cost.mjs` before
  changing that.
* **Media is private by default and enforced in the binary layer**, not by obscurity, with
  `private, no-store` responses. Gate: `npx payload run src/scripts/verify-media-binary.ts`.
* **One locale per API call**, and **array rows are shared between locales**: write `ar` → read the
  generated row ids → write `en` with those ids. Replacing a localized array without ids deletes the
  other language's values.
* **Payload REST global updates are POST.** A PATCH returns 404.
* **Writes from `payload run` cannot invalidate the running server's cache.** Provision data that
  way; change content through the running server when freshness matters.
* **Verification scripts refuse to run without `ALLOW_VERIFICATION_WRITES=true`;** the seeders
  require `ALLOW_PRODUCTION_SEED=true`. Both must stay.
* **Run the gates after any content change:** `npx tsc --noEmit`, `npm run build`,
  `npx eslint .`, `npx playwright test`, `node scripts/qa-capture.mjs` + the ImageMagick diff against
  `qa/final/`, then the three `verify-*.ts` scripts and `node scripts/cache-freshness.mjs`.

## Payload localisation traps (Phase D, learned the hard way)

- **Every programmatic global read and write must name its locale explicitly.** With
  `localization.fallback: false`, a REST read **without** `?locale=` returns `null` for every
  localized field, and a REST write without `?locale=` lands in the default locale — so posting a
  global back "as read" **deletes that locale's whole row**. This destroyed the Arabic Site Settings
  twice during Phase D (once via the fixture script, once via a fixture helper); the repaired values
  and the guard are in `.phase-d-evidence/restore-site-settings.ts`,
  `.phase-d-evidence/make-fixtures.mjs` and the preservation checks in `src/scripts/verify-phase-d.ts`.
- **A partial write to one locale merges (Local API), but do not rely on it** — sed the whole
  document per locale whenever a script rewrites a global.
- **`payload run` cannot revalidate the live server's caches.** After a script edits a global, the
  running `next start` can still serve the previous render (this produced a stale footer in a QA
  capture); restart the server or write through the live API before taking evidence.
- **`npx payload migrate` is the only schema path** (`PAYLOAD_PUSH` stays `false`), and verification
  suites must restore anything they temporarily change — `verify-phase-c.ts` and `verify-phase-d.ts`
  now do this in `finally` blocks.
