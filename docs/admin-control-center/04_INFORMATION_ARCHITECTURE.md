# 04 — Information Architecture (Sidebar & Business Language)

## 1. Sidebar

```
لوحة المعلومات            Dashboard                    (home)

المحتوى                   Content
  الصفحات                   Pages                        (home + static routes)
  المجالات                  Services                     (the seven Lands)
  الأعمال                   Projects                     (case studies)
  المقالات                  Insights                     (articles)
  الوسائط                   Media                        (library)

العملاء المحتملون           Leads
  كل الطلبات                All requests

الموقع                    Website
  القائمة والتنقل            Navigation                   (header + footer)
  حسابات التواصل             Social accounts
  مواعيد العمل               Business hours
  معلومات التواصل            Contact details

التسويق                   Marketing
  التحليلات                 Analytics                    (GA4)
  أداء البحث                Search performance           (Search Console)
  التتبع والبكسل             Tracking & pixels
  أوامر مخصصة               Custom scripts               (super-admin only)
  الموافقة على الكوكيز       Cookie consent

تحسين الظهور              SEO
  بيانات الصفحات             Page SEO
  التحويلات                 Redirects
  صحة الموقع                Site health

الإعدادات                 Settings
  عامة                      General
  التواصل                   Contact
  اللغات                    Languages & translations
  التكاملات                  Integrations                 (API connections, statuses)

النظام                    System                                       (super-admin only)
  المستخدمون                Users
  الأدوار والصلاحيات         Roles & permissions
  سجل التغييرات              Audit log
  النسخ الاحتياطي            Backups                      (status + instructions)
```

The exact grouping is intentional: **content → customers → website → marketing → SEO → settings →
system**, matching how a marketing manager thinks, not how the database is organised.

## 2. Naming rules (business language, never schema language)

| Admin label (AR) | Label (EN) | Never shown to users |
| --- | --- | --- |
| مواعيد العمل | Business hours | `business_hours` |
| حسابات التواصل | Social accounts | `social_entity_collection` |
| صورة المشاركة | Sharing image | `og:image override` |
| الأسئلة الشائعة | FAQs | `faq_repeater_field` |
| الترتيب | Order | `sort_index` |
| حالة النشر | Publish status | `_status` |
| رفع صورة | Upload image | `create_media_asset` |
| غير مترجم إلى الإنجليزية | Missing English | `translation_status = incomplete` |

## 3. Standard screen patterns

Every list screen provides: search, filter chips, sortable columns (TanStack Table), row actions,
bulk select with confirmation, pagination, an empty state with a primary action, and a loading
skeleton. Every edit screen provides: a two-column layout (fields left, meta/publish/images right),
inline translation tabs (AR | EN with a missing-translation marker), save / publish / preview,
validation summary at the top on error, and an autosave indicator for long-form content.

## 4. Command palette

`⌘K` / `Ctrl+K` opens a palette that searches pages, services, projects, articles, leads and
media, and exposes actions ("صفحة جديدة", "رفع وسائط", "فتح آخر طلب"). This is the primary path
for power users; the sidebar remains the primary path for everyone else.

## 5. Dashboard widgets (real data only)

| Widget | Source | If unavailable |
| --- | --- | --- |
| طلبات جديدة | leads collection | shows "لا توجد طلبات بعد" |
| مشاهدات الزيارات (7 أيام) | GA4 Data API cache | shows a **connection card**, never fake numbers |
| مصادر الزيارات | GA4 | connection card |
| نقرات واتساب / الاتصال | GA4 events | connection card |
| أداء البحث | Search Console | connection card |
| صحة الموقع | internal checks | always available |
| مسودات قيد العمل | content collections | always available |
| آخر التغييرات | audit log | always available |

**Hard rule:** no widget ever shows a placeholder number. Disconnected = an explicit connect CTA.

## 6. Responsive behaviour

- **Desktop (≥1280):** full sidebar, two-column editors, tables.
- **Tablet (768–1279):** collapsible sidebar, single-column editors, tables keep key columns.
- **Mobile (<768):** bottom-tab navigation (Dashboard / Leads / Content / Settings), leads render
  as cards, editors are usable for short edits; media upload and block reordering are discouraged
  but not blocked.
