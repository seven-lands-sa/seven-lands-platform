# DNS LEDGER & DOMAIN ARCHITECTURE

Authoritative registry of DNS records, domain configurations, and verification tokens for `7-lands.com`.

---

## 1. Domain Configuration Policy

* **Primary Canonical Domain:** `https://7-lands.com` (Apex, non-www)
* **Secondary Redirect Hostname:** `https://www.7-lands.com` → 301/308 permanent redirect to `https://7-lands.com`
* **Registrar:** IONOS (`https://my.ionos.com/domain/details/7-lands.com`)
* **DNS Management Mode:** Authoritative at IONOS (unless Cloudflare nameserver delegation is deliberately authorized by owner).

---

## 2. DNS Modification Ledger

Before any record is created or updated, its prior state is documented here:

| Name / Host | Type | Old Value | New Value | TTL | Purpose | Provider | Status | Timestamp |
|---|---|---|---|---|---|---|---|---|
| `@` (`7-lands.com`) | A | *(IONOS default)* | *Vercel `76.76.21.21` (upon cutover)* | Auto | Web Traffic Apex | Vercel | PENDING STAGING PASS | - |
| `www` | CNAME | *(IONOS default)* | *`cname.vercel-dns.com`* | Auto | WWW Redirect | Vercel | PENDING STAGING PASS | - |
| `_vercel` | TXT | None | *Vercel verification token* | Auto | Domain Ownership Verification | Vercel | PENDING | - |
| `@` / `mail` | MX | None / Default | *Resend MX or IONOS Mailbox MX* | Auto | Mail Delivery Routing | Resend / IONOS | PENDING PHASE 2 | - |
| `@` | TXT | None | `v=spf1 ... ~all` | Auto | SPF Sender Policy | Resend / IONOS | PENDING PHASE 3 | - |
| `resend._domainkey` | TXT / CNAME | None | *DKIM Public Key* | Auto | DKIM Cryptographic Signature | Resend | PENDING PHASE 4 | - |
| `_dmarc` | TXT | None | `v=DMARC1; p=none;` | Auto | DMARC Rollout Policy | RFC 7489 | PENDING PHASE 3 | - |

---

## 3. Legacy Domain Preservation
* **Legacy Domain:** `sevnland.com`
* **Action:** No DNS or server modifications. The legacy WordPress site remains operational and untouched.
