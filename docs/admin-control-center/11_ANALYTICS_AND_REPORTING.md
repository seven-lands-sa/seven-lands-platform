# 11 — Analytics and Reporting

## 1. Position

We do **not** build a proprietary analytics engine. Google owns the data; we present the parts that
answer business questions, cached server-side. Everything else is a link out to GA4/Search Console.

### V1 dashboard scope (owner amendment, 2026-10-07)

The dashboard summarises what the business owner needs to make decisions. **It does not attempt to
recreate the GA4 interface.** V1 reports exactly these, and nothing more:

| Group | Metrics |
| --- | --- |
| Audience | users · sessions · pageviews |
| Acquisition | traffic channels · top landing pages |
| Technology | device split |
| Conversions (site) | website leads · WhatsApp clicks · phone clicks · form starts/submits · conversion rate |
| Search (Search Console) | clicks · impressions · CTR · top search queries · top organic pages |

Every card must state its source and its time window. When a source is not connected, the card shows
an honest "غير متصل" state — never a zero, never an estimate, never an invented trend.

## 2. Event model (already wired in the codebase)

| Event | Trigger | Payload |
| --- | --- | --- |
| `whatsapp_click` | any WhatsApp CTA | location (header/hero/footer/form_success/…), service? |
| `phone_click` | `tel:` links | location |
| `maps_click` | map link | location |
| `service_cta_click` | hero/service CTAs | location, service |
| `case_study_view` | project page view | project slug |
| `brief_form_start` | first interaction with the brief | mode |
| `brief_form_step` | step completion | mode, step |
| `brief_form_submit` | successful submit | mode, capability count |
| `brief_form_error` | validation/server error | mode, step |
| `language_switch` | AR↔EN | from, to |

These are the conversions the dashboard reports. No micro-events (scroll depth, rage clicks, hover)
are added — they generate noise and no action.

## 3. GA4 integration

- Public measurement ID stored in the `tracking-integrations` collection (see `12_…`).
- **Reporting credentials** (service-account JSON or OAuth refresh token) live in the host's secret
  store as environment variables, never in an admin form.
- Server route `/api/admin/analytics` calls the GA4 Data API with:
  - **cached summaries** (5-minute TTL per range, plus an ISR-style cache in the admin route) so
    opening the dashboard never burns the API quota,
  - explicit failure handling → the card shows "لم يتم الاتصال بعد" with a connect/repair action.

## 4. Dashboard cards (V1)

| Card | Metric | Window |
| --- | --- | --- |
| الزوار | active users | today · 7d · 30d · 90d |
| الجلسات | sessions | same |
| مشاهدات الصفحات | page views | same |
| القنوات | sessions by source/medium | 30d |
| الصفحات الأكثر زيارة | page views by path | 30d |
| الأجهزة | device category | 30d |
| الدول والمدن | geography (Saudi focus) | 30d |
| التحويلات | the event list above, as conversions | 7d / 30d |
| نقرات واتساب | `whatsapp_click` | 7d trend |
| مكالمات | `phone_click` | 7d |
| طلبات المشاريع | `brief_form_submit` + leads collection count | 30d |

Charts: Recharts, single accent colour from the brand palette (ice #7A9CC6) on navy/white —
no rainbow dashboards.

## 5. Search Console integration

- OAuth (read-only) or a service account with the property added; tokens in the secret store.
- Cards: clicks, impressions, CTR, average position; top queries; top pages.
- Window: fixed 28-day comparison (this period vs previous) — the useful default for a small site.
- Where GA4 and Search Console disagree (common), each card is labelled with its source so nobody
  argues with the dashboard.

## 6. What we store locally

| Data | Stored? | Why |
| --- | --- | --- |
| Leads (form submissions) | **yes**, in `leads` | first-party, must not depend on GA |
| Conversion event names/counts | cached only | GA4 is the source of truth |
| Raw pageviews/sessions/geo | **no** | duplicating GA4 is waste |
| Cached API responses | yes, short TTL | performance and quota protection |

## 7. Privacy

- IP anonymisation on for GA4; no cross-site tracking, no fingerprinting, no individual-level
  visitor views anywhere in the admin.
- Analytics loads only when the consent category is granted (see `12_…` §4).
- The admin never displays anything that identifies a visitor; geography is aggregate only.

## 8. Fallback states

No GA4 configured → the Analytics section shows a setup card with the exact steps and the ID field.
GA4 configured but the API credential missing → data cards show a "بيانات التقارير غير متصلة"
state (the live tracking still works; only the back-end reporting is missing). Both states are
honest and actionable, never a fake zero.
