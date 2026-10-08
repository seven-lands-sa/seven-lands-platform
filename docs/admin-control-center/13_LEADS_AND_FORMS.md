# 13 — Leads and Forms

## 1. Today

`ProjectBriefForm` → `POST /api/brief` → Zod validation → honeypot → rate limit
(6 / 10 min / IP, production only) → optional webhook (`BRIEF_WEBHOOK_URL`) → otherwise logged
server-side with a WhatsApp handoff for the visitor. **Nothing is stored.** If the owner never
configures a webhook, leads live only in server logs.

## 2. Target

Every submission is stored as a `leads` record. The public contract stays identical
(same endpoint, same schema, same UX) — only the destination changes.

```
Visitor → brief form → POST /api/brief
                         ├── validate (Zod, unchanged)
                         ├── honeypot (unchanged)
                         ├── rate limit  → moves to a shared store (see §5)
                         ├── write to `leads`           ← new
                         └── notify (email / optional WhatsApp) + keep webhook as an option
```

## 3. Lead record

| Group | Fields |
| --- | --- |
| Contact | name · phone (normalised E.164) · email? · company? |
| Request | lands[] (capabilities) · goal · timeline · preferred channel · notes |
| Attribution | `campaign{utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid}` · landingPage · referrer · locale |
| Meta | submittedAt · userAgent · ip (hashed or truncated — see §6) · status · internalNotes[] · assignedTo? |
| Lifecycle | status: `new` → `contacted` → `qualified` → `won` / `lost` / `spam` |

### Explicit non-CRM boundary (owner amendment, 2026-10-07)

V1 statuses are exactly: **New · Contacted · Qualified · Won · Lost · Spam**.

V1 supports: search · filters · notes · attribution · landing page · UTM · timestamps · export · audit.

V1 does **not** include — and must not grow into without separate authorisation: complex pipelines,
tasks, invoices, quotations, deal automation, sales forecasting. The module's job is to make sure a
submitted lead is never lost and can be triaged; it is not a sales system.

## 4. Lead management UX

- **Inbox list:** default filter `new`, columns (name, phone, capabilities, status, age), search,
  date range, status chips, bulk status change.
- **Detail view:** full submission, one-click call / WhatsApp (with the same pre-filled context),
  internal notes timeline, status change, "تحويل إلى مشروع" later (marks the lead as the origin of a
  project record — no CRM pipeline beyond this).
- **Export:** CSV of the current filtered view; the export event is audited.
- **Notifications:** email to a configurable recipient list on new lead (instant) and a daily
  digest option. Email delivery requires a provider (Resend / SMTP) — a launch dependency.
- **Anti-noise:** no notification for `spam`-marked or honeypot-caught submissions.

## 5. Hardening to complete on move

| Item | Action |
| --- | --- |
| Rate limiter | The current in-memory `Map` (audit item D3) is ineffective behind serverless/multi-instance hosting. Move to Redis/Upstash (or keep a single long-lived instance as an explicit deployment constraint). |
| Spam | Keep honeypot; add a timing check (submission faster than ~3 s = bot) and an optional Turnstile challenge if abuse appears. No CAPTCHA by default — it costs conversions. |
| PII handling | Phone/email visible only to roles with `leads.read`; exports audited; retention policy configurable (default: keep 24 months, then anonymise). |
| Backups | Leads are in the same Postgres backup path (see `14_…` §7). |

## 6. Privacy alignment

The public privacy policy currently lists hosting/analytics/WhatsApp as processors and states that
data is used to reply to the request. Storing leads in our own database is consistent with that
policy; the policy text will be updated through the admin (it is admin-editable) to name the
storage explicitly. IP is stored truncated (last octet removed) or hashed — enough for abuse
triage, not enough to be identifying.

## 7. Form management (admin scope)

Admins may change: the recipient list, notification preferences, the success message text
(AR/EN), and the "what happens next" note. Admins may **not** rebuild the form structure in V1 —
the four-step brief is a designed, conversion-tested flow. Adding/removing *optional* fields
(e.g. a budget range) is a Phase L extension behind a code change, so the Zod contract, the
WhatsApp handoff and the tests stay coherent.
