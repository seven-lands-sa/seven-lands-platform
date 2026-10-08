# 07 — Global Settings Model

Grouped domains instead of one giant settings blob. Every field below is admin-editable unless
marked otherwise.

## 1. General (`site-settings`)

| Field | Type | Notes |
| --- | --- | --- |
| الاسم بالإنجليزية | text | "Seven Lands" — also feeds `legalName` in the Organization schema |
| الاسم بالعربية | text | "سفن لاند" |
| الوصف المختصر | localized text (max 160) | used in schema description and as the fallback meta description |
| الشعار (الشكل الكامل) | media | dark-on-transparent PNG/SVG — the file is **uploaded as-is**; no admin-side restyling |
| الشعار (الرمز فقط) | media | used in the compact header |
| النسخة الفاتحة (للفوتر) | media | white/soft-light treatment |
| الأيقونة (favicon) | media | 32×32 + apple-touch 180×180 |
| اللغة الافتراضية | select (ar/en) | `ar` |
| المنطقة الزمنية | select | `Asia/Riyadh` — drives hours logic and date rendering |
| سنة الحقوق | number | feeds "© 2026 Seven Lands." |

## 2. Contact (`contact-settings`)

| Field | Type | Notes |
| --- | --- | --- |
| أرقام الهاتف | array of `{ label{ar,en}, number, isPrimary }` | number validated as a Saudi mobile/landline; rendered with `dir="ltr"` isolation |
| رقم واتساب | single, validated | drives every `wa.me/966…` link |
| رسائل واتساب | localized per context: عام، الرئيسية، التواصل، ابدأ مشروعك + **واحد لكل مجال** | the admin edits the text; the seven per-capability messages stay inside each service record |
| البريد الإلكتروني | array `{ label, address, isPublic }` | optional; hidden everywhere until filled (today's behaviour preserved) |
| العنوان | localized text + structured `{ city, region, country }` | feeds PostalAddress; street/postal stay empty until confirmed |
| رابط الخريطة | url | the supplied Google Maps link |
| ملاحظة الموقع | localized text | e.g. "نستقبل المشاريع من كل مناطق المملكة" |

## 3. Business hours (`business-hours`)

```
week[]:
  day: sunday…saturday
  enabled: boolean
  mode: "periods" | "24h" | "closed"
  periods[]: { from "HH:mm", to "HH:mm" }     # multiple per day supported
note:        { ar, en }                        # e.g. seasonal exception
exceptions[]: { dateFrom, dateTo, mode, periods[], label{ar,en} }   # holidays/Ramadan (model now, UI in V1.1)
timezone:    inherited from General
```

- The contact page renders the table from this structure.
- **"مفتوح الآن / مغلق الآن"** is computed server-side from `timezone` + the current instant, and is
  only shown when every day is configured; otherwise the badge is hidden (never guessed).
- The Organization schema's `openingHoursSpecification` is generated from this data.

## 4. Branding / social sharing

| Field | Type | Notes |
| --- | --- | --- |
| صورة المشاركة الافتراضية (عربي) | media 1200×630 | replaces the committed `og-ar.png` |
| صورة المشاركة الافتراضية (إنجليزي) | media 1200×630 | replaces `og-en.png` |
| صورة المشاركة الافتراضية لصفحات المجالات | media | optional page-type default |
| لون الواجهة (theme-color) | color | defaults to `#F5F7F8` / `#061428` |
| أيقونات التواصل | repeatable `social-accounts[]` | see `05_DATA_MODEL.md` §3 |

## 5. Legal

| Field | Notes |
| --- | --- |
| نص سياسة الخصوصية | rich text per locale; currently a draft and `noindex` |
| نص الشروط والأحكام | rich text per locale; the "نطاق العمل" section is part of the text |
| سطر الحقوق | defaults to "جميع الحقوق محفوظة" |
| حالة المراجعة القانونية | `draft | approved` — **while `draft`, the pages stay `noindex` and show the review notice** |
| تاريخ آخر تحديث | date, rendered on both pages |

The legal-review gate is enforced in code, not by editor discipline: `status != approved → noindex`.

## 6. SEO defaults (`seo-defaults`)

| Field | Notes |
| --- | --- |
| قالب عنوان الصفحة | e.g. `{title} — Seven Lands` / `{title} — سفن لاند` |
| الوصف الافتراضي | localized, max 160 |
| صورة المشاركة الافتراضية | fallback for every page without its own |
| robots الافتراضي | index/follow |
| معرف الموقع (Organization) | legal name, logo, sameAs (social URLs), telephone, address, area served |
| إثبات الملكية | Search Console verification token (public identifier) |

## 7. Navigation & footer (`navigation`)

- **Header:** items[] `{ label{ar,en}, target (internal page | external url | whatsapp | phone),
  openInNewTab, visible, children[]? (one level) }` + primary CTA `{ label{ar,en}, target }`.
- **Mobile:** same items; the drawer order follows the same list (no separate editor).
- **Footer:** `columns[]` (each with title + items[]) and a contact block fed from
  `contact-settings`; legal links are generated from the legal pages, not typed.
- Previews: both the header and footer show a live miniature preview while editing.

## 8. Consent (`consent-settings`)

| Field | Notes |
| --- | --- |
| تفعيل لافتة الموافقة | boolean |
| نص اللافتة | localized rich text |
| فئات الموافقة | necessary (always on) · analytics · marketing |
| نص الأزرار | accept all / reject non-essential / preferences |
| روابط السياسات | privacy + terms page references |

## 9. What is deliberately NOT a setting

Section spacing, type scale, colours, radii, motion durations, grid behaviour, block variants'
internals, CSP rules, the route table, email templates' HTML shell. These are design system or
code-level concerns; exposing them invites a broken site.
