# 01. PRODUCTION SERVICE & ACCOUNT REGISTRY

Authoritative inventory of production platforms, infrastructure providers, and cloud accounts for Seven Lands (`7-lands.com`).

---

## 1. Master Account Identity

* **Primary Account Owner / Recovery Identity:** `sevenlands.sa@gmail.com`
* **Operational Primary Domain:** `7-lands.com`
* **Security Policy:** No passwords, raw API secrets, private database connection strings, MFA recovery codes, or private tokens are stored in this or any repository document.

---

## 2. Infrastructure & Service Inventory

| Provider | Purpose | Account / Identity | Tier / Plan | Region | Safe Identifiers / Resource Names | Status |
|---|---|---|---|---|---|---|
| **IONOS** | Domain Registrar & Authoritative DNS | `sevenlands.sa@gmail.com` | Standard Domain Registration | Global | Domain: `7-lands.com` | Active / Primary Registrar |
| **Vercel** | Edge Web Hosting & Next.js Serverless Runtime | `sevenlands.sa@gmail.com` | Hobby / Standard | Global Edge | Project: `seven-lands-website` | Ready for Git Import |
| **Neon** | Serverless PostgreSQL Database | `sevenlands.sa@gmail.com` | Free / Standard Serverless | Frankfurt (`eu-central-1`) or ME | Projects: `seven-lands-prod`, `seven-lands-staging` | Pending Project Creation |
| **Cloudflare** | Media Storage (R2 S3-Compatible) & Optional Edge Proxy | `sevenlands.sa@gmail.com` | Free / R2 Standard | Auto / WNAM | Buckets: `sevenlands-media-prod`, `sevenlands-media-staging` | Pending R2 Bucket Setup |
| **Resend** | Transactional Email Delivery (Leads & Auth) | `sevenlands.sa@gmail.com` | Free Tier (3,000 emails/mo) | Global | Sending Domain: `7-lands.com` (or `mail.7-lands.com`) | Pending Domain Verification |

---

## 3. Environment Scope & Boundary Rules

1. **Staging vs Production Isolation:** Staging and Production will maintain strict logical isolation across databases (separate Neon databases/branches), storage buckets (separate R2 buckets/prefixes), and environment variables.
2. **Billing Safety:** Only Free Tiers are utilized unless explicit owner authorization is granted for paid scaling. Zero unexpected paid commitments.
3. **Domain Safety:** Authoritative DNS at IONOS remains untouched until staging acceptance is 100% verified. Legacy WordPress (`sevnland.com`) is never modified or destroyed.
