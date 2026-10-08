# 03. CURRENT ARCHITECTURE

```
                               ┌─────────────────────────────────────────────────────────────┐
        Visitor (Browser) ───▶ │ Next.js 16.4.0 App Router (SSR + Static + PPR)             │
                               │   - /[locale] (ar-SA default RTL / en LTR)                  │
                               │   - Middleware (src/proxy.ts): Real 404 & locale prefixing   │
                               │   - next-intl: i18n routing & static message translation     │
                               └──────────────┬──────────────────────────────▲───────────────┘
                                              │ Server Component Adapter     │
                                              ▼                              │
                               ┌───────────────────────────────┐             │
                               │ Payload CMS 3 Local API       │             │
                               │   - OverrideAccess = true     │             │
                               │   - Tagged Cache & 'use cache'│             │
                               │   - Fallback to Static Content│ ────────────┘
                               └──────────────┬────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │ PostgreSQL 17.1 Database    │               │ Payload Admin UI (/admin)   │
        │   - 210 tables, 9 migrations│               │   - Arabic RTL interface    │
        │   - push: false (strict)    │               │   - RBAC & Audit Log        │
        │   - Versioned collections   │               │   - Custom Media Library    │
        └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 1. Unified Single Deployable App
Seven Lands runs as a single unified Next.js 16 application containing both the public presentation layer and the Payload CMS 3 management system:
- **Public Routes:** Hosted under `src/app/[locale]/...` utilizing Next.js Partial Prerendering (PPR), React 19 Server Components, and client interaction islands.
- **Admin & CMS API Routes:** Hosted under `src/app/(payload)/admin/...` and `src/app/(payload)/api/...`.
- **Bundle Isolation:** Server components read Payload via its Local API (`getPayload()`), completely isolating Payload's backend and administrative code from public client bundles (`ADMIN_CODE_LEAK: NO`).

---

## 2. Content Adapters & Fallback Architecture
The site uses a disciplined content adapter pattern:
1. **Public Route Requests:** Handled by domain-specific adapters (`src/lib/pages/adapter.ts`, `src/lib/services/public.ts`, `src/lib/content/cms.ts`).
2. **Authority Check:** The adapter queries the database for a published document matching the slug and requested locale.
3. **Strict Locale Isolation:** If an Arabic document is published, it serves Arabic. If an English translation is missing, it does **not** silently fallback to Arabic. Instead, it falls back to the shipped static content (`src/content/*`) for the exact same locale.
4. **Cache Invalidation:** Reads are bound to explicit cache tags (`page:{id}`, `page-system:{key}`, `services`, `site-settings`). CMS updates invalidate the corresponding tags automatically.

---

## 3. Localization & RTL Architecture
- **Locales:** `ar` (Arabic, default, `dir="rtl"`, `lang="ar-SA"`), `en` (English, `dir="ltr"`, `lang="en"`).
- **Core Setting:** `fallback: false` in Payload's localization configuration. Programmatic reads and writes must explicitly supply `locale: 'ar'` or `locale: 'en'`.
- **Array Row Sharing:** Array tables in PostgreSQL share row IDs across locales; updating an array without preserving existing row IDs would erase the sibling locale's items. The codebase includes `localeSafeUpdate()` to enforce safe operations.

---

## 4. Media Architecture & Binary Protection
- **Private by Default:** Uploaded media defaults to `visibility: 'private'`.
- **Binary Gate:** Private assets served via `/api/media/file/:path*` return **HTTP 403** with `Cache-Control: private, no-store` to unauthorized visitors.
- **Safe Delete Policy:** The media usage registry (`src/lib/media/usage.ts`) scans globals, pages, services, projects, and insights. If an asset is actively referenced, deletion is blocked with a descriptive error.
- **Image Pipeline:** Sharp 0.35.5 processes uploads, strips EXIF data, performs MIME sniffing, and generates responsive derivatives (400x300, 768x512).

---

## 5. Security & Authentication Model
- **Auth Provider:** Payload auth on the `users` collection with bcrypt hashing and 2-hour sliding sessions.
- **Session Revocation:** Enabled server-side session tracking (`useSessions: true`). Suspending a user revokes all active sessions immediately.
- **Headers:** Strict Content-Security-Policy (CSP), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS enabled in production.

---

## 6. Leads Collection & Durable Persistence (Phase H)
- **Collection:** `leads` backed by PostgreSQL `leads` and `leads_internal_notes` tables.
- **V1 Workflow Statuses:** `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`, `SPAM`.
- **Durable Pipeline:** `POST /api/brief` validates with Zod, checks honeypot/rate limits, persists to PostgreSQL via Payload Local API, and generates a human reference ID (`SL-YYYYMMDD-XXXX`) before returning HTTP 200.
- **Failure Isolation:** Secondary notifications (email/webhooks) run post-persistence; secondary delivery failure never loses a lead or returns false error to the visitor.
- **Authorized Export:** `GET /api/leads/export` delivers UTF-8 BOM CSV for Excel compatibility with automatic formula sanitization (`=, +, -, @` escaped).
- **Audit Logging:** Every created lead, status transition, and export event is logged in `audit_events`.
