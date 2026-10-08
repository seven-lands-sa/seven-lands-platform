# Dependency Advisory Triage — Phase B

**Date:** 2026-10-07 · **Command used:** `npm audit`, `npm ls <pkg>`, `npm view <pkg> versions`
**Baseline problem:** Phase A (adding Payload) took the project from **0** advisories to **20**
(2 low · 9 moderate · 9 high). This document separates *dependency-tree severity* from *actual
runtime exposure*, records the fixes applied, and states explicitly what remains unresolved.

---

## 1. Summary

| Measure | Before triage | After triage |
| --- | --- | --- |
| Total advisories (`npm audit`) | **20** (2 low · 9 moderate · 9 high) | **13** (0 low · 5 moderate · 8 high) |
| Production dependency tree | 16 (2 low · 9 moderate · 5 high) | **9** (0 low · 5 moderate · 4 high) |
| Distinct *leaf* advisories | 14 (8 × undici, 2 × dompurify, 1 × braces, 1 × esbuild + parents) | **2** (braces, esbuild) |
| Critical | 0 | 0 |

**Fixes applied (safe, non-breaking, no `--force`, no Payload downgrade):**

```json
"overrides": {
  "undici": "^7.29.1",      // was pinned to exactly 7.29.0 by payload
  "dompurify": "^3.4.16"    // transitive via monaco-editor
}
```

Result: `undici 7.29.0 → 7.30.0`, `dompurify 3.4.15 → 3.4.16`. Payload stays at **3.90.2**.

---

## 2. Per-advisory classification

### 2.1 undici — **FIXED by override** (8 advisories: 2 high · 4 moderate · 2 low)

| Field | Value |
| --- | --- |
| PACKAGE | `undici` |
| SEVERITY | high ×2 (GHSA-rfgv-xxqx-mfg5 WebSocket subprotocol DoS, GHSA-w293-vg96-wgc3 TLS validation bypass), moderate ×4, low ×2 |
| DIRECT / TRANSITIVE | **Direct dependency of `payload@3.90.2`**, which pins the exact version `7.29.0` |
| RUNTIME / BUILD-TIME / ADMIN-ONLY | **Runtime, server-side** |
| REACHABLE FROM PUBLIC WEBSITE | **No** — no public route imports Payload; the public bundle is verified payload-free |
| REACHABLE FROM ADMIN | **Barely.** The single import is `payload/dist/uploads/safeFetch.js`, used for *URL-based* uploads (`filePath` fetches). Our media flow uploads local files, so the code path is not exercised today |
| FIX AVAILABLE | **Yes** — `7.29.1+` (7.30.0 installed) |
| BREAKING FIX REQUIRED | No — same minor line, patch-level |
| REAL EXPOSURE | **Low**, but non-zero: the vulnerable code ships in the server bundle, and the advisories include a TLS-verification bypass. It would only be reachable through a future URL-upload feature |
| RECOMMENDED ACTION | **Applied:** `overrides.undici = ^7.29.1` → 7.30.0. Also raise with Payload upstream: they should not pin a version below a published security fix |

### 2.2 dompurify — **FIXED by override** (2 advisories, both low)

| Field | Value |
| --- | --- |
| PACKAGE | `dompurify` (3.4.15) |
| SEVERITY | low ×2 (GHSA-p98j-92pf-mc4p, GHSA-6688-9rhm-gjv2 — `IN_PLACE` sanitisation edge cases) |
| DIRECT / TRANSITIVE | Transitive: `@payloadcms/ui → @monaco-editor/react → monaco-editor → dompurify` |
| RUNTIME / BUILD-TIME / ADMIN-ONLY | **Admin-only** (rich-text/code editor sanitisation) |
| REACHABLE FROM PUBLIC WEBSITE | **No** |
| REACHABLE FROM ADMIN | Only when an admin renders HTML through DOMPurify; both advisories require a crafted document plus an unusual configuration |
| FIX AVAILABLE | **Yes** — 3.4.16 |
| BREAKING FIX REQUIRED | No |
| REAL EXPOSURE | **Very low** |
| RECOMMENDED ACTION | **Applied:** `overrides.dompurify = ^3.4.16`. `monaco-editor` is flagged only *through* dompurify, so this also clears that entry |

### 2.3 braces — **UNRESOLVED, accepted** (1 advisory, high)

| Field | Value |
| --- | --- |
| PACKAGE | `braces@3.0.3` |
| SEVERITY | high (GHSA-vfj7-8cjw-p6xm — stack exhaustion on deeply nested input) |
| DIRECT / TRANSITIVE | Transitive, two paths: ① `@payloadcms/next → sass@1.77.4 → chokidar@3.6.0 → braces` ② `eslint-config-next → fast-glob → micromatch → braces` |
| RUNTIME / BUILD-TIME / ADMIN-ONLY | **Build-time (①) and dev-time (②)**. Not loaded by `next start` |
| REACHABLE FROM PUBLIC WEBSITE | **No** |
| REACHABLE FROM ADMIN | **No** — it runs in Node during SCSS compilation / linting, never in a request path |
| FIX AVAILABLE | **NO FIX EXISTS YET.** `npm view braces versions` shows **3.0.3 as the latest published version**, and the advisory covers `<=3.0.3` |
| BREAKING FIX REQUIRED | npm's only suggestion is to **downgrade `@payloadcms/next` to 3.85.1** — rejected: downgrading Payload to escape a dev-tool advisory is a worse trade |
| REAL EXPOSURE | **Negligible.** The brace-expansion input is a local file glob authored by us, not attacker-supplied data |
| RECOMMENDED ACTION | **Accept and monitor.** Re-check on every Payload/ESLint bump. Two future options exist if a fix is still missing: bump the nested `sass` (Payload pins 1.77.4 hard — chokidar 4 dropped `braces`) or wait for Payload to move. Documented, not hidden |

### 2.4 esbuild — **UNRESOLVED, accepted** (1 advisory, moderate)

| Field | Value |
| --- | --- |
| PACKAGE | `esbuild@0.18.20` — a *nested* copy, not the project's `esbuild@0.25.12` |
| SEVERITY | moderate (GHSA-67mh-4wv8-2f99 — dev server accepts requests from any origin) |
| DIRECT / TRANSITIVE | Transitive: `@payloadcms/db-postgres → drizzle-kit@0.31.7 → @esbuild-kit/esm-loader → @esbuild-kit/core-utils → esbuild@0.18.20` |
| RUNTIME / BUILD-TIME / ADMIN-ONLY | **Build-time CLI only** — `payload migrate:create` |
| REACHABLE FROM PUBLIC WEBSITE | **No** |
| REACHABLE FROM ADMIN | **No** |
| FIX AVAILABLE | Only by forcing `esbuild` across a major boundary inside `@esbuild-kit`, which is how drizzle-kit loads migrations. That risks breaking migration generation |
| BREAKING FIX REQUIRED | Yes (unsafe override) |
| REAL EXPOSURE | **Negligible** — the advisory concerns esbuild's *dev server* CORS; we never run that dev server, and `drizzle-kit` is a local CLI |
| RECOMMENDED ACTION | **Accept and monitor.** Do not force. Re-check when drizzle-kit or `@esbuild-kit` updates |

### 2.5 Transitive entries that are not independent problems

`chokidar`, `sass`, `@payloadcms/next`, `@payloadcms/ui`, `@payloadcms/graphql`,
`@payloadcms/drizzle`, `@payloadcms/db-postgres`, `monaco-editor`, `@next/eslint-plugin-next`,
`eslint-config-next`, `fast-glob`, `micromatch`, `drizzle-kit` appear in `npm audit` solely because
a dependency of theirs is vulnerable. They are not separate defects; they will clear automatically
when §2.3/§2.4 clear. Counted once each in the totals.

---

## 3. What is *not* claimed

- No `npm audit fix --force` was run; nothing was downgraded; Payload was not replaced.
- The remaining 13 entries are **not** hidden: they are the braces/esbuild trees described above.
- The three advisories that included a **high** severity (undici TLS bypass, undici WebSocket DoS,
  braces DoS) have two fixed and one accepted on evidence of non-reachability.
- This triage is a point-in-time check. Re-run `npm audit` after every dependency change; the
  decision log above should be amended rather than replaced.

## 4. Verification performed after applying the overrides

| Check | Method | Result |
| --- | --- | --- |
| Overrides actually installed | `node -e require('node_modules/undici/package.json').version` | undici **7.30.0**, dompurify **3.4.16** |
| Payload still intact | `npx payload run` (config + Local API + migrations) | config loads, queries execute |
| Production build | `npx next build` | exit 0 |
| Admin + public regression | Playwright + bundle containment | see `PHASE_B_REPORT.md` |
