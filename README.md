# Seven Lands / سفن لاند — Production Platform

Bilingual (Arabic-first / English) corporate web application and content management platform for **Seven Lands / سفن لاند** — a premier Saudi full-service growth partner combining strategy, branding, content, social, performance, web, and enterprise software.

> 📖 **للاطلاع على الدليل التقني والهندسي الشامل للمشروع:** راجع [`docs/MASTER_SYSTEM_ARCHITECTURE.md`](docs/MASTER_SYSTEM_ARCHITECTURE.md).

---

## 1. Project Authority & Identity

- **Canonical Production Domain**: [`https://7-lands.com`](https://7-lands.com)
- **Primary Service Account**: `sevenlands.sa@gmail.com`
- **GitHub Organization / Namespace**: [`seven-lands-sa`](https://github.com/seven-lands-sa)
- **Official Repository**: `seven-lands-platform` (Private)
- **Authoritative Release Status**: Production Live (RC1 Final)

---

## 2. Technology Stack

| Layer | Technology | Version / Specification |
|---|---|---|
| **Framework** | Next.js (App Router, Server Components) | 16.4+ / React 19 / Turbopack |
| **CMS Engine** | Payload CMS 3 | Modern Headless CMS (Arabic RTL First) |
| **Database** | PostgreSQL | Neon Serverless (Pooled) |
| **AI & Voice STT** | GhostMind CoreOne API | Chat Completions & Whisper Audio Transcription |
| **Media Storage** | Cloudflare R2 | S3-compatible, private by default |
| **Transactional Email** | Resend | DNS authenticated (SPF, DKIM, DMARC) |
| **Hosting & Edge** | Vercel | Production + Preview / Staging |
| **Language & Typing** | TypeScript | Strict mode |
| **Styling** | Tailwind CSS 4 | Custom design tokens & luxury styling |
| **Localization** | `next-intl` | Arabic (RTL, Primary) + English (LTR) |

---

## 3. Local Development Requirements

- **Node.js**: `v20.20.2` or later (managed via Volta or nvm)
- **PostgreSQL**: `v16` or `v17` running locally (default dev port `5432`)
- **Git**: `v2.40+`
- **Package Manager**: `npm`

---

## 4. Setup & Installation

### Step 1: Clone and install dependencies
```bash
git clone https://github.com/seven-lands-sa/seven-lands-platform.git
cd seven-lands-platform
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure local PostgreSQL is running and update `DATABASE_URI` if necessary:
```env
DATABASE_URI=postgres://seven_lands:password@127.0.0.1:5432/seven_lands_dev
PAYLOAD_SECRET=your_32_byte_hex_secret
SITE_CANONICAL_URL=https://7-lands.com
RUNTIME_ORIGIN=http://localhost:3000
GHOSTMIND_API_KEY=gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g
```

### Step 3: Run Database Migrations
Seven Lands strictly forbids `payload.push`. All schema changes are applied via migrations:
```bash
npm run migrate
# or: npx payload migrate
```

### Step 4: Run Guarded Development Seed (Optional)
```bash
ALLOW_PRODUCTION_SEED=true npm run seed:guarded
```

### Step 5: Start Development Server
```bash
npm run dev
# Open http://localhost:3000 -> automatically redirects to /ar
```

---

## 5. Verification & Test Suite

Run the full verification suite before committing:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Production Build
npm run build

# 3. Phase G Verification (Routing, SEO, Canonical, i18n, Health)
npx tsx src/scripts/verify-phase-g.ts

# 4. Phase E Verification (Content Equivalence & Form Gates)
npx tsx src/scripts/verify-phase-e.ts

# 5. Media Binary Verification
npx tsx src/scripts/verify-media-binary.ts
```

---

## 6. Architecture & Core Invariants

1. **Dual-Origin Architecture**:
   - `SITE_CANONICAL_URL` (`https://7-lands.com`): The published canonical authority for sitemaps, canonical tags, hreflang, OpenGraph, and JSON-LD. Never point this at localhost or staging preview URLs.
   - `RUNTIME_ORIGIN` (`http://localhost:3000` / Vercel preview host): Used strictly for request-scoped routing, internal redirect calculation, and trusted-origin headers.
2. **Database Migrations (`push: false`)**:
   - The PostgreSQL adapter operates with `push: false` in all environments. Schema mutations must be authored as explicit migration files.
3. **Durable Lead Persistence**:
   - Public forms persist directly to PostgreSQL before external notification attempts. Under no circumstances should an external API error (e.g., Resend) cause lead submission to fail or report false success.
4. **Media Security**:
   - Private media by default with binary-level access control. Public assets are explicitly tagged. Cloudflare R2 serves media in hosted environments via secure adapters.
5. **Zero Fake Business Data**:
   - The platform publishes only verified business details (WhatsApp: `+966507776891`, official email: `info@7-lands.com`). Unverified numbers, addresses, or client logos are strictly excluded.

---

## 7. Documentation Map

- `docs/project-completion/`: Authoritative engineering ledger and phase completion audits.
- `docs/production/`: Infrastructure registry, DNS ledger, email architecture, and deployment procedures.
  - `00_PRODUCTION_INDEX.md`: Production documentation index.
  - `01_SERVICE_REGISTRY.md`: Cloud service inventory and credentials map.
  - `02_DOMAIN_AND_DNS.md`: IONOS and DNS configurations.
  - `03_EMAIL_ARCHITECTURE.md`: Mailbox, MX, SPF, DKIM, and DMARC specifications.
  - `04_DATABASE.md`: Neon PostgreSQL provisioning and connection pooling.
  - `05_MEDIA_STORAGE.md`: Cloudflare R2 configuration.
  - `06_VERCEL.md`: Vercel project deployment and environment scoping.
  - `07_STAGING_REPORT.md`: Staging verification report.
  - `11_LAUNCH_CHECKLIST.md`: Pre-flight and go-live launch checklist.
