# 08. SECURITY STATUS

**Audit Date:** 2026-10-08 / 2026-10-09 · **Environment:** Local Windows Runtime

---

## 1. Authentication & Session Security
- **Algorithm:** Passwords hashed with bcrypt via Payload CMS.
- **Session Lifespan:** 2 hours (`tokenExpiration: 7200`).
- **Brute-Force Lockout:** Account locked for 10 minutes after 5 consecutive failed attempts. Audited under `login_failed`.
- **Immediate Revocation:** Tested and verified via `verify-phase-b.ts`. Suspending an account instantly terminates and destroys all active session tokens in the database.
- **Cookie Flags:** `SameSite=Lax`, `HttpOnly`, and `Secure` (in production).

---

## 2. Authorization & RBAC
- **Catalogued Permissions:** 45 distinct permissions across collections, globals, and custom endpoints.
- **System Roles (5):**
  - `super_admin`: Full access, including high-risk permissions (SVG upload, destructive deletion).
  - `admin`: Operational content and user management; restricted from SVG uploads and system destructive tasks.
  - `editor`: Create, update, publish content and manage media.
  - `marketing`: View content, update marketing globals (contact, hours, social); **cannot publish** (HTTP 403 verified).
  - `viewer`: Read-only access to published content and audit events; no mutation rights.
- **Last Active Super Admin Protection:** Verified by automated suite. The system rejects deleting, suspending, or removing the `super_admin` role from the sole remaining Super Admin account.

---

## 3. Media Binary Security
- **Default Privacy:** All uploads default to `private`.
- **Binary Route (`/api/media/file/:path*`):**
  - Anonymous request to private original/derivative: **HTTP 403** (`Cache-Control: private, no-store`).
  - Authenticated request with `media.read`: **HTTP 200**.
  - Transition to `public`: Immediately accessible (HTTP 200) without changing the file path.
  - Revocation back to `private`: Immediately denies access (HTTP 403).
- **SVG Protection:** Uploading `.svg` files requires high-risk permission `media.svg_upload` (restricted to Super Admin). All media file responses send `Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox` to prevent script execution inside SVG images.

---

## 4. HTTP Headers & Edge Security
- **Content-Security-Policy:**
  ```http
  default-src 'self'; base-uri 'self'; object-src 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; form-action 'self'
  ```
- **HSTS:** `max-age=63072000; includeSubDomains; preload` (active when `NODE_ENV=production`).
- **MIME Sniffing:** `X-Content-Type-Options: nosniff`.
- **Referrer Policy:** `strict-origin-when-cross-origin`.
- **Permissions Policy:** `camera=(), microphone=(), geolocation=(self)`.
- **Framing Note:** `frame-ancestors` and `X-Frame-Options` are intentionally omitted at the application layer to permit admin preview framing. They must be configured at the production reverse proxy / CDN layer.

---

## 5. Dependency Vulnerability Triage (`npm audit`)
- **Total Advisories:** 14 advisories (0 Critical, 9 High, 5 Moderate).
- **Triage Result:** All 14 advisories reside exclusively in build-time / development toolchains (`drizzle-kit`, `sass/chokidar`, `micromatch/braces`, `esbuild` dev server).
- **Runtime Exposure:** ZERO advisories affect the production client bundle or public server runtime.
- **Policy:** Do NOT run `npm audit fix --force` as it introduces breaking peer-dependency conflicts with Next 16 and Payload 3.
