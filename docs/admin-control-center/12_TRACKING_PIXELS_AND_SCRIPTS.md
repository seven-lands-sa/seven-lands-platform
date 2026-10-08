# 12 — Tracking, Pixels and Custom Scripts

## 1. Three tiers of capability

| Tier | Who can change it | Where it is stored | Examples |
| --- | --- | --- | --- |
| **1. Native integrations** | Admin | `tracking-integrations` collection | GA4, GTM, Google Ads, Meta Pixel, TikTok, Snap, LinkedIn, Clarity |
| **2. Consent & preferences** | Admin | `consent-settings` | which tier-1 integrations require which category |
| **3. Custom code** | Super Admin only | `custom-scripts` collection | an unusual vendor snippet |

Tier 1 covers ~95% of real needs and is fully structured — no code, no risk.
Tier 3 exists as a fallback, is audited, and is deliberately uncomfortable to use.

## 2. Native integration modules

Each provider is a code-defined module with a typed schema; admins only fill identifiers.

| Provider | Public identifier | Notes |
| --- | --- | --- |
| Google Analytics 4 | measurement ID `G-XXXX` | loads gtag; feeds the whole event model |
| Google Tag Manager | container ID `GTM-XXXX` | if GTM is used, GA4 may be managed inside it (mutually exclusive with the direct loader, enforced in UI) |
| Google Ads | conversion ID + label | optional |
| Meta Pixel | pixel ID | marketing consent |
| TikTok Pixel | pixel ID | marketing consent |
| Snap Pixel | pixel ID | marketing consent |
| LinkedIn Insight Tag | partner ID | marketing consent |
| Microsoft Clarity | project ID | analytics consent |

Per integration: `enabled`, `publicId`, `environments[]` (production / staging / development),
`consentCategory`, `lastModifiedBy`, `lastModifiedAt`, and a **status** — `disabled` ·
`configured` · `live` · `error` (error when the loader fails a health check, e.g. blocked by CSP).

The CSP in `next.config.ts` is generated from the enabled integrations: enabling Meta adds
`connect.facebook.net` to `script-src`/`connect-src` automatically, so a pixel can never be enabled
in a way that silently fails.

## 3. Environment awareness

Integrations declare which environments they run in. Default: production only.
Staging gets its own GA4 property when the owner supplies one; otherwise nothing fires. This is
enforced in the loader, not by remembering to comment code out.

## 4. Consent architecture

```
Necessary   (always): locale cookie, session, security, load balancing
Analytics   (opt-in): GA4, Clarity
Marketing   (opt-in): Meta, TikTok, Snap, LinkedIn, Google Ads
```

- Implementation: **Consent Mode v2** signals + a branded banner (AR/EN, RTL-correct) with
  "قبول الكل" / "رفض غير الضروري" / "التفضيلات".
- Scripts for a category are injected **only after** that category is granted; nothing loads
  pre-consent except the banner itself.
- Choice is stored in a first-party cookie (not localStorage) with an expiry (6 months) and a
  "تغيير التفضيلات" link in the footer.
- If the owner decides the site is out of scope for consent (Saudi-only B2B traffic), the banner
  can be switched off as a single setting — but the categories remain in the model so nothing has
  to be rebuilt later.

## 5. Custom scripts (tier 3) — governance

| Aspect | Rule |
| --- | --- |
| Who | Super Admin only; re-authentication prompt before opening the editor |
| Fields | name · placement (head / body start / body end) · code · description · environments · enabled |
| Validation | syntax parse before save; size limit (20 KB); no inline secrets detected by a pattern check (warns) |
| Review | every save creates a revision; every enable/disable is an audit event with a diff |
| Safety | "تعطيل كل الأوامر المخصصة" emergency switch (single click, audited) |

### Custom scripts are an advanced/developer capability, not a marketing field (owner amendment, 2026-10-07)

Tier 1 (structured native integrations) is the **primary and preferred path**; every service that
can be added natively must be added natively. Tier 3 exists only for genuinely unusual vendors, and
is treated as follows:

- **Super Admin only**, behind a **separate high-risk permission** (`scripts.manage`) — never folded
  into a general "marketing" or "admin" grant.
- **Hidden from ordinary Admin / Editor / Marketing roles** entirely: the screen does not appear in
  their navigation and the API rejects them server-side.
- Every create / update / enable / disable is **audited** with actor, diff and timestamp.
- **Environment-scoped** (development / preview / production) so a snippet can never silently run in
  the wrong environment; production enablement requires an **explicit confirmation** step.
- **CSP-aware by construction**: saving a script updates the CSP hash list; if the CSP would not
  permit it, the save is rejected with an explanation rather than failing silently in the browser.
- **No casual secrets**: pattern checks warn, and the guidance is that tokens belong in the host's
  secret store and are referenced by the server, not pasted into a script field.
- A permanent security warning is displayed in the editor.

Native integrations to ship in V1: **GA4 · GTM · Google Ads · Meta Pixel · TikTok Pixel · Snap Pixel
· LinkedIn Insight · Microsoft Clarity**.
| CSP | script text is hashed (SHA-256) at save time and added to the CSP `script-src` allow-list; the hash is recomputed on every save, so unlisted code cannot execute |
| Warning | the editor screen states in Arabic and English that arbitrary code can compromise the site, and that only trusted staff should use it |

**Why not simply allow any inline script?** Because a mistake here can exfiltrate lead data or break
the site for every visitor, and because the CSP hash mechanism turns "did anyone change the code?"
into a verifiable fact.

## 6. Anti-patterns explicitly rejected

- A single `header_script` / `footer_script` text field that everything gets pasted into.
- Storing API secrets (service accounts, OAuth refresh tokens) in the database through normal admin
  forms. Private credentials go to environment variables; the admin only shows their **status**
  (configured / missing) with instructions.
- Loading pixels unconditionally regardless of consent.
- Letting an Editor (content role) touch tracking or scripts.
