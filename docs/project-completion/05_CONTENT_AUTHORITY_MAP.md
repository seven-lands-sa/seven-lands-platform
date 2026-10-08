# 05. CONTENT AUTHORITY MAP

This document establishes the single source of truth for content resolution across every public route and visual element on Seven Lands.

---

## 1. Domain-by-Domain Authority Registry

| Content Domain | Primary Authority | Fallback Mechanism | Editor / Admin UI | Public Consumer |
|---|---|---|---|---|
| **Home Page Content** | `Pages` Collection (`home` doc) | Shipped content (`src/content/home.ts`) | Admin → المحتوى → الصفحات | `src/app/[locale]/page.tsx` |
| **System Pages (`about`, `contact`, `start-a-project`)** | `Pages` Collection (`about`, `contact`, etc.) | Shipped content (`src/content/*`) | Admin → المحتوى → الصفحات | `src/app/[locale]/[page]/page.tsx` |
| **Legal Pages (`privacy`, `terms`)** | `Pages` Collection (`privacy`, `terms` docs) | Placeholder notice / Static text | Admin → المحتوى → الصفحات | `src/app/[locale]/[page]/page.tsx` |
| **Capability Services (7 Lands)** | `Services` Collection | Shipped content (`src/content/services.ts`)| Admin → المحتوى → الخدمات | `src/app/[locale]/services/[slug]/page.tsx` |
| **Case Studies / Work** | `Projects` Collection (`0` rows) | Honest empty-state message | Admin → المحتوى → الأعمال | `src/app/[locale]/work/page.tsx` |
| **Articles / Insights** | `Insights` Collection (`0` rows) | Honest empty-state message | Admin → المحتوى → الرؤى | `src/app/[locale]/insights/page.tsx` |
| **Header Navigation** | `Navigation` Global | Hardcoded route definitions | Admin → إعدادات الموقع → القائمة | `src/components/layout/Header.tsx` |
| **Footer Links & Copyright** | `Footer` Global | Shipped groups & commercial text | Admin → إعدادات الموقع → التذييل | `src/components/layout/Footer.tsx` |
| **Brand Identity (Names, City)**| `SiteSettings` Global | Shipped constants (`src/content/site.ts`) | Admin → إعدادات الموقع → معلومات | Layouts & JSON-LD Structured Data |
| **Contact Channels (WhatsApp, Phone)** | `ContactSettings` Global | Verified phone constant (`0507776891`) | Admin → إعدادات الموقع → وسائل | Header, Footer, Contact Panels |
| **Business Hours** | `BusinessHours` Global (`0` rows)| UI omits or shows "to be confirmed" | Admin → إعدادات الموقع → ساعات | Footer & Contact Panels |
| **Social Media Profiles** | `SocialAccounts` Global (`0` rows)| Section omitted | Admin → إعدادات الموقع → حسابات | Footer & Header Drawers |
| **Media & Images** | `Media` Collection (`0` assets) | Static SVG glyphs & `/public` brand | Admin → المحتوى → الوسائط | Image components & OpenGraph tags |
| **Brief Form Fields & Schema** | Code-controlled (`src/features/brief`) | N/A | Developer-only | `src/components/forms/ProjectBriefForm.tsx` |

---

## 2. Fundamental Resolution Rules
1. **CMS Priority:** If a document or global exists in PostgreSQL and is flagged as published for the requested locale, its values take absolute priority.
2. **Zero Cross-Language Fallback:** If an Arabic document is published but English is unpublished/empty, the English route **never** displays Arabic text. It resolves directly to the shipped English fallback in `src/content/`.
3. **Immutability of Routing Keys:** System routes and capability service slugs are immutable identifiers. Editors cannot rename route slugs in a manner that creates broken URLs or invalidates external links.
