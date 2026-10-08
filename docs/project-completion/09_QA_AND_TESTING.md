# 09. QA AND TESTING INVENTORY

---

## 1. Test Inventory & Execution Results

All core verification suites were executed directly on the local machine against the live PostgreSQL 17 database and running Next.js production build:

| Suite / Script | Tool / Framework | Checks / Assertions | Status | Coverage Focus |
|---|---|---|---|---|
| `tests/smoke.spec.ts` | Playwright | 60 tests (55 run, 5 skip) | `PASS` | Navigation, conversion, mobile drawer, RTL/LTR layout, phone/WhatsApp CTAs |
| `tests/a11y.spec.ts` | Axe-core + Playwright | 18 tests | `PASS` | WCAG 2.0/2.1 A+AA, color contrast, headings, accessible names |
| `src/scripts/verify-locale-safety.ts` | Payload Local API | 14 checks | `PASS` | Explicit locale writes, no silent fallback, zero cross-locale corruption |
| `src/scripts/verify-media-binary.ts` | HTTP + Local API | 22 checks | `PASS` | 403 on private media, immediate public/private transition, derivative generation |
| `src/scripts/verify-phase-b.ts` | Local API | 37 checks | `PASS` | RBAC permissions matrix, last super admin invariant, session revocation |
| `src/scripts/verify-phase-e.ts` | Local API + HTTP | 64 checks | `PASS` | Pages CMS models, block validation, drafts, preview, version restoration |
| `scripts/admin-responsive.mjs` | Playwright script | 4 viewports | `PASS` | Responsive admin UX at 390px, 768px, 1024px, 1440px |
| `scripts/cache-freshness.mjs` | HTTP headers | Multiple probes | `PASS` | Tag-based revalidation, stale-while-revalidate headers |

---

## 2. Browser & Device Testing Matrix

- **Desktop Chromium (1440x900):** Automated tests pass completely across all routes.
- **Mobile Emulation (Pixel 7 / 390x844):** Automated layout, drawer interactions, and no-horizontal-scroll tests pass.
- **Firefox:** `NOT VERIFIED` (Playwright configuration focuses on Chromium).
- **WebKit (Safari Desktop / iOS):** `NOT VERIFIED` (Requires manual or macOS/WebKit runner).
- **Physical Devices (iOS / Android):** `NOT VERIFIED` (Owner Gate G5).

---

## 3. Visual Regression Baseline
- **Baseline Directory:** `qa/final/` contains 26 accepted reference screenshots.
- **Status:** Pixel comparison confirmed zero layout regressions. 25/26 captures report 0px difference; 1 capture (`home-ar-1440`) reports 38px of sub-pixel font anti-aliasing noise (max channel delta 2), verified as rendering noise rather than a layout regression.
