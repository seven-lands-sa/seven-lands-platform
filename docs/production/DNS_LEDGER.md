# Seven Lands — Production DNS Ledger

Authoritative audit log of all DNS records for `7-lands.com`.
Every modification must record: Timestamp, Action, Type, Host, Value, TTL, Rationale, Rollback Value.

---

## 1. Baseline DNS Snapshot (Captured 2026-10-09 17:47 UTC+3 from IONOS)

| Record Type | Host / Name | Target / Value | Category | Status | Rollback / Notes |
|---|---|---|---|---|---|
| **A** | `@` (`7-lands.com`) | `74.208.236.250` | Web (IONOS Default Parking) | Baseline | Replaced by Vercel A record `76.76.21.21` at cutover |
| **AAAA** | `@` (`7-lands.com`) | `2607:f1c0:100f:f000:0:0:0:200` | Web (IONOS Default Parking) | Baseline | Remove when pointing to Vercel (Vercel uses IPv4 A or CNAME) |
| **TXT** | `_dep_ws_mutex` | `"f707dc88bec2c0e45f20a780c8c547de848b76675947314382ac428438e88398_179154..."` | System | Active | Keep untouched (IONOS internal) |
| **CNAME** | `_domainconnect` | `_domainconnect.ionos.com` | System | Active | Keep untouched |
| **MX** | `@` (Priority 10) | `mx00.ionos.com` | Email Routing | Active | IONOS Mail / Forwarding inbound handler |
| **MX** | `@` (Priority 10) | `mx01.ionos.com` | Email Routing | Active | IONOS Mail / Forwarding inbound handler |
| **TXT** | `@` (SPF) | `"v=spf1 include:_spf-us.ionos.com ~all"` | Email Auth | Baseline | To be updated to include Resend: `include:_spf-us.ionos.com include:resend.com ~all` |
| **CNAME** | `_dmarc` | `dmarc.ionos.com` | Email Auth | Active | IONOS DMARC handler |
| **CNAME** | `s1-ionos._domainkey` | `s1.dkim.ionos.com` | Email Auth | Active | IONOS DKIM Selector 1 |
| **CNAME** | `s2-ionos._domainkey` | `s2.dkim.ionos.com` | Email Auth | Active | IONOS DKIM Selector 2 |
| **CNAME** | `autodiscover` | `adsredir.ionos.info` | Email Autodiscover | Active | Keep untouched |

---

## 2. Inbound Email Capability Verification

- **Registrar Contract**: `114003512` - IONOS Instant Domain
- **Storage Mailboxes Included**: 0 (Mail Basic $1/mo or Mail Business requires paid upgrade)
- **Forwarding Included**: **YES (Free / Included)**
- **Forwarding Configuration**:
  - `info@7-lands.com` &rarr; `sevenlands.sa@gmail.com`
  - `admin@7-lands.com` &rarr; `sevenlands.sa@gmail.com`

---

## 3. Executed DNS Mutations & Email Configuration Log

| Timestamp | Record Type | Host | Value / Target | Priority | Status | Rationale |
|---|---|---|---|---|---|---|
| 2026-10-09 19:11 | **A** | `@` | `76.76.21.21` | - | Applied | Cut over apex web traffic to Vercel Anycast IP |
| 2026-10-09 19:08 | **CNAME** | `www` | `cname.vercel-dns.com` | - | Applied | Route www subdomain to Vercel Edge |
| 2026-10-09 19:08 | **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...` | - | Applied | Resend DKIM Authentication |
| 2026-10-09 19:08 | **MX** | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` | 10 | Applied | Resend Custom Return-Path |
| 2026-10-09 19:08 | **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | - | Applied | Resend SPF Alignment |

---

## 4. Active Email Forwarders (IONOS Contract 114003512)

| Forwarder Address | Target Mailbox | Status | Execution Date | Contract Reference |
|---|---|---|---|---|
| `info@7-lands.com` | `sevenlands.sa@gmail.com` | **ACTIVE** | 2026-10-09 19:26 | `18254215002` |
| `admin@7-lands.com` | `sevenlands.sa@gmail.com` | **ACTIVE** | 2026-10-09 19:26 | `18254216302` |

