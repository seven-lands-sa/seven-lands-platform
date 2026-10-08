# 02. REPOSITORY AND RUNTIME

**Machine:** Windows 11 Pro · **Host OS:** Windows (PowerShell)  
**Project Path:** `D:\seven-lands\seven-lands-website`  
**Workspace Root:** `D:\seven-lands`

---

## 1. Environment & Installed Toolchains

```ini
PROJECT_ROOT          = D:\seven-lands\seven-lands-website
OS                    = Windows 11 (NT 10.0.26100.0)
SHELL                 = PowerShell 5.1
NODE_VERSION          = v20.20.2 (pinned via Volta)
NPM_VERSION           = 10.8.2
GIT_VERSION           = 2.47.1.windows.1 (MinGit, located at %LOCALAPPDATA%\Programs\Git\cmd)
DATABASE_ENGINE       = PostgreSQL 17.1 (binaries at %LOCALAPPDATA%\Programs\PostgreSQL17\bin)
DATABASE_STATUS       = RUNNING locally (127.0.0.1:5432, cluster at D:\seven-lands\pgdata_dev)
ACTIVE_DATABASES      = seven_lands_dev, seven_lands_repro
```

---

## 2. Git State & History

```ini
CURRENT_BRANCH        = master
HEAD                  = bc3040a7815fd24928d03d6a7c3d2624b659797d
LAST_COMMIT_MSG       = "Phase E sealed: about/contact/start-a-project migrated to the Pages CMS (12/12 text equivalence, 0px visual, form gate green)"
REMOTES               = NONE (local transfer)
TOTAL_COMMITS         = 1 (initial repository commit)
```

### Working Tree Breakdown
- **Tracked modified files:** 26 files (Pages rewires, Section adapters, Service migrations, Schema additions, Payload config).
- **Untracked files:** 164 files (Phase F evidence, Phase F migrations, collections `Services.ts`, `Projects.ts`, `Insights.ts`, local test scripts, and new documentation).
- **Recovery Snapshot:** A safe, secret-free compressed snapshot was generated before making any changes:  
  `D:\seven-lands\backups\recovery-pre-onboarding-20261008-1937.tar.gz` (SHA-256: `52C60FF47A4D474BCE8C02F8F987C824CBE29451A2F10C4FA7105312551A83AA`).

---

## 3. Environment Variables Configuration

The local development environment uses `.env` with the following active parameters:

```bash
# Canonical site authority (Server-side metadata, sitemaps, canonicals)
SITE_CANONICAL_URL=https://sevnland.com

# Runtime origin for local process
RUNTIME_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# PostgreSQL Connection
DATABASE_URI=postgres://seven_lands:seven_lands@127.0.0.1:5432/seven_lands_dev

# Payload CMS Core Secret
PAYLOAD_SECRET=e7b458d348a1768e... (active 62-char random secret)

# Trusted origins for CSRF / Preview
PAYLOAD_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Dev Seed Super Admin Credentials
SEED_SUPER_ADMIN_EMAIL=owner@sevenlands.test
SEED_SUPER_ADMIN_NAME=Seven Lands Owner
SEED_SUPER_ADMIN_PASSWORD=...
```

---

## 4. Standard Operational Commands

To run commands reliably in PowerShell on this workstation, prepend the local tool paths:

```powershell
# Set toolchain PATH in session
$nodeDir = "C:\Users\Eman Gaber\AppData\Local\Volta\tools\image\node\20.20.2"
$gitDir  = "$env:LOCALAPPDATA\Programs\Git\cmd"
$pgBin   = "$env:LOCALAPPDATA\Programs\PostgreSQL17\bin"
$env:Path = "$nodeDir;$gitDir;$pgBin;" + $env:Path

# Start Local PostgreSQL Service (if not running)
& "$pgBin\pg_ctl.exe" -D "d:\seven-lands\pgdata_dev" -l "d:\seven-lands\pgdata_dev\logfile" start

# Typecheck & Lint
npm run typecheck
npm run lint

# Production Build & Start
npm run build
npm run start

# Development Server
npm run dev

# Run Migrations
npx payload migrate

# Run Test Suites
npx playwright test
$env:ALLOW_VERIFICATION_WRITES="true"; npx payload run src/scripts/verify-locale-safety.ts
```
