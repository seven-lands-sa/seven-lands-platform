# دليل النظام الشامل والهندسة التقنية لمنصة سفن لاند
# Seven Lands — Master System Architecture & Developer Manual

> **الإصدار الحالي:** Production Ready (RC1 Final)  
> **النطاق الرسمي:** `https://7-lands.com`  
> **مستودع الكود:** `github.com/seven-lands-sa/seven-lands-platform`  
> **آخر تحديث:** 2026-10-10  

---

## الفهرس العام / Table of Contents
1. [نظرة عامة على المشروع (Project Overview)](#1-نظرة-عامة-على-المشروع)
2. [المكدس التقني الكامل (Full Technology Stack)](#2-المكدس-التقني-الكامل)
3. [البنية التحتية والسحابية (Cloud & Infrastructure Topology)](#3-البنية-التحتية-والسحابية)
4. [لوحة التحكم Payload CMS 3 وهيكلية البيانات (Admin Control Center & Data Architecture)](#4-لوحة-التحكم-payload-cms-3-وهيكلية-البيانات)
5. [تكامل الذكاء الاصطناعي و GhostMind (AI & GhostMind Integration)](#5-تكامل-الذكاء-الاصطناعي-و-ghostmind)
6. [التعرف على الصوت والتحدث بالمايك (Voice Input & STT Engine)](#6-التعرف-على-الصوت-والتحدث-بالمايك)
7. [نظام الهوية والصور والتصميم البصري (Visual Identity & Media Assets)](#7-نظام-الهوية-والصور-والتصميم-البصري)
8. [الأمان وسياسات الحماية والـ Headers (Security & Permissions-Policy)](#8-الأمان-وسياسات-الحماية)
9. [دليل إعداد وتشغيل المشروع لأي مطور جديد (Developer Onboarding & Setup Guide)](#9-دليل-إعداد-وتشغيل-المشروع-لأي-مطور-جديد)
10. [إرشادات الصيانة والنشر (Deployment & Maintenance Workflows)](#10-إرشادات-الصيانة-والنشر)

---

## 1. نظرة عامة على المشروع
منصة **سفن لاند (Seven Lands)** هي منصة رقمية متكاملة لشركة تسويق وتقنية واستشارات نمو أعمال رائدة في المملكة العربية السعودية (المقر الرئيسي: الرياض / القصيم). المنصة ثنائية اللغة (عربي كخيار أساسي افتراضي RTL، وإنجليزي LTR)، مبنية بمعايير مؤسسية فائقة السرعة والأمان، وتوفر تجربة تفاعلية حية تشمل مستشار مبيعات رقمي بالذكاء الاصطناعي مع إمكانية التحدث بالصوت وتحويل الكلام لنص.

---

## 2. المكدس التقني الكامل
* **إطار العمل الأساسي:** [Next.js 16 (App Router)](https://nextjs.org/) مع دعم كامل لـ Server Components و Partial Prerendering (PPR) و Turbopack.
* **نظام إدارة المحتوى (Headless CMS):** [Payload CMS 3.x](https://payloadcms.com/) مدمج بالكامل أصلياً داخل نفس خادم Next.js، مع دعم التدويل والتحكم الكامل في كافة محتويات الموقع.
* **قاعدة البيانات:** PostgreSQL 16/17 المستضافة على [Neon Serverless PostgreSQL](https://neon.tech/) مع إدارة التغييرات عبر Payload Migrations الحصرية (`push: false`).
* **تخزين الوسائط والملفات:** [Cloudflare R2](https://www.cloudflare.com/products/r2/) مع محول S3-Compatible للتخزين الآمن فائق السرعة بدون رسوم Egress.
* **محرك الذكاء الاصطناعي:** [GhostMind CoreOne API](https://ghostmind.optdmsa.com) للاستجابة الذكية للاستفسارات وتحويل الصوت لنص عبر Whisper.
* **البريد الإلكتروني المؤسسي:** [Resend API](https://resend.com) للرسائل التفاعلية (Transactional Emails) مع توثيق SPF و DKIM و DMARC عبر مزود النطاق [IONOS](https://ionos.com).
* **التصميم وتنسيق الصفحات:** [Tailwind CSS 4](https://tailwindcss.com/) مع دعم أصيل للخطوط الفاخرة (IBM Plex Sans Arabic) والألوان الملكية الداكنة والذهبية، و SCSS مخصص للوحة التحكم.
* **التدويل (i18n):** `next-intl` للموقع العام، ومكتبة `@payloadcms/translations` للوحة التحكم.

---

## 3. البنية التحتية والسحابية
```mermaid
graph TD
    User([الزائر / العميل]) -->|HTTPS / DNS: IONOS| Cloudflare[Cloudflare Edge / CDN]
    Cloudflare -->|SSL Termination| Vercel[Vercel Serverless Hosting]
    Vercel -->|Next.js App Router| PublicSite[الموقع العام /ar & /en]
    Vercel -->|Payload CMS 3| AdminPanel[لوحة التحكم /admin]
    Vercel -->|Serverless Functions| APIRoutes[/api/chat, /api/transcribe, /api/brief]
    
    AdminPanel -->|Pooled Connection| NeonDB[(Neon PostgreSQL Serverless)]
    PublicSite -->|Cached / Tagged Reads| NeonDB
    
    APIRoutes -->|GhostMind API Key| GhostMind[GhostMind CoreOne Platform]
    GhostMind -->|LLM Streaming| APIRoutes
    GhostMind -->|Whisper STT| APIRoutes
    
    AdminPanel -->|S3 Upload / Download| CloudflareR2[(Cloudflare R2 Storage)]
    APIRoutes -->|SMTP / API| Resend[Resend Transactional Email]
```

### سجل العناوين السحابية:
* **Production URL:** `https://7-lands.com`
* **Vercel Project:** `seven-lands/seven-lands-platform`
* **Neon PostgreSQL:** `ep-silent-sun-a4q8yixn-pooler.us-east-1.aws.neon.tech`
* **Cloudflare R2 Bucket:** `seven-lands-media`
* **GhostMind Upstream:** `https://ghostmind.optdmsa.com/v1`

---

## 4. لوحة التحكم Payload CMS 3 وهيكلية البيانات

### 1. بيانات الدخول الرئيسية
* **الرابط:** `https://7-lands.com/admin`
* **البريد الإلكتروني:** `admin@7-lands.com`
* **كلمة المرور المشفرة:** `SevenLands#2026!SecureRootAdmin`

### 2. المجموعات (Collections)
1. **المستخدمون (`users`):** إدارة مدراء النظام، الصلاحيات، والجلسات المحمية.
2. **الأدوار (`roles`):** نظام تحكم بالصلاحيات القائم على الأدوار (RBAC).
3. **سجل الأحداث (`audit-events`):** تسجيل ومراقبة كافة العمليات الحساسة (إنشاء، تعديل، حذف، تسجيل دخول).
4. **الوسائط (`media`):** مكتبة الصور والملفات، مع قص تلقائي وتوليد أحجام متعددة، ودعم الرفع السحابي.
5. **الصفحات (`pages`):** إدارة صفحات الموقع العام وهيكلها ومحتواها.
6. **الخدمات (`services`):** مجالات الشركة الـ 7 الرئيسية وتفاصيل كل خدمة.
7. **المشاريع والأعمال (`projects`):** معرض سوابق الأعمال ودراسات الحالة.
8. **الرؤى والمقالات (`insights`):** مقالات المدونة وتحليلات السوق.
9. **العملاء المحتملون (`leads`):** تخزين كافة الطلبات الواردة من نماذج الموقع وويدجت الدردشة مع إمكانية التصدير.
10. **التحويلات (`redirects`):** إدارة قواعد إعادة التوجيه والروابط القديمة بدقة.

### 3. الإعدادات العامة (Globals)
* **إعدادات الموقع (`site-settings`):** اسم الموقع، الشعار، الأيقونات، مفاتيح الربط للذكاء الاصطناعي (`ai_ghostmind_api_key`).
* **بيانات التواصل (`contact-settings`):** الهواتف، البريد الإلكتروني، العنوان الجغرافي.
* **مواعيد العمل (`business-hours`):** أيام وساعات الدوام الرسمي.
* **حسابات التواصل (`social-accounts`):** روابط المنصات الرسمية (X, LinkedIn, Instagram, TikTok, Snapchat).
* **الهيدر والتنقل (`navigation`):** القوائم العلوية وترتيب عناصرها.
* **الفوتر (`footer`):** الروابط السفلية وحقوق النشر.
* **أدوات التحليل والتتبع (`tracking-settings`):** معرفات GA4, GTM, Snap, TikTok, Meta Pixel, Clarity.
* **إعدادات الخصوصية والموافقة (`consent-settings`):** إعدادات لافتة الكوكيز وسياسات التتبع.

### 4. بنية الـ RTL الصارمة في لوحة التحكم
* **فرض واجهة عربية أصيلة دائمة (Strict Arabic-first Admin):**
  * تم ضبط `supportedLanguages: { ar }` و `fallbackLanguage: 'ar'` في `payload.config.ts`.
  * يضمن ذلك ظهور لوحة التحكم باللغة العربية واتجاه الـ RTL الكامل لجميع المدراء تلقائياً، حتى لو كانت لغة نظام التشغيل أو متصفح المدير مضبوطة على الإنجليزية.
* **على الشاشات الكبيرة (Desktop >= 1024px):**
  * القائمة الجانبية مدمجة ومفتوحة بشكل دائم ومثبتة على أقصى اليمين (`grid-column: 2`).
  * منطقة المحتوى تحتل أقصى اليسار (`grid-column: 1`).
  * الهيدر العلوي: الشعار ومسار التصفح على اليمين، أداة تبديل اللغة وصورة المستخدم على اليسار.
  * البطاقات والجداول: اتجاه النصوص من اليمين لليسار مع تطابق الخطوط السعودية (`Alexandria` و `IBM Plex Sans Arabic`).
* **على الشاشات الصغيرة (Mobile / Tablet < 1024px):**
  * تتحول القائمة الجانبية إلى درج جانبي (Off-canvas Drawer) ينزلق بسلاسة من اليمين عند النقر على زر القائمة.

---

## 5. تكامل الذكاء الاصطناعي و GhostMind
تعتمد منصة سفن لاند على منصة **GhostMind CoreOne** لتوحيد خدمات الذكاء الاصطناعي.

### معمارية الدردشة التفاعلية:
* **نقطة النهاية الداخلية:** `POST /api/chat`
* **الآلية:**
  1. يرسل العميل رسالته عبر ويدجت `SalesChatWidget`.
  2. يتحقق الـ API من توفر مفتاح `GHOSTMIND_API_KEY` (من جدول `site-settings` أو متغيرات البيئة).
  3. يمرر الطلب إلى `https://ghostmind.optdmsa.com/v1/chat/completions` مع تزويد النموذج بتعليمات نظام سعودية دقيقة تمثل ثقافة وأسلوب سفن لاند (مستشار النمو الذكي في الرياض).
  4. تدفق الردود بتقنية Real-time SSE Streaming لظهور النص حرفاً بحرف بسرعة فائقة.
  5. دعم الاقتراحات السريعة (Chips) ونماذج التقاط العملاء المحتملين (Lead Capture) المدمجة داخل المحادثة.

---

## 6. التعرف على الصوت والتحدث بالمايك (Voice & Speech-to-Text)
يتيح ويدجت الدردشة للعميل التحدث بالصوت وتحويل كلامه إلى نص فوري باللغة العربية عبر هندسة هجينة تجمع بين السرعة الفائقة والاعتمادية:
1. **المحرك الأساسي: Web Speech API الأصلي للمتصفح (Client-side Native Recognition):**
   * يعمل مباشرة على أجهزة Chrome و Safari و Edge و iOS و Android.
   * يستدعي إذن المايكروفون الأصلي للمتصفح بسلاسة واحترافية وبدون أي نوافذ منبثقة مزعجة (`alert()`).
   * يتعرف على اللهجة السعودية والعربية الفصحى فورياً (`lang: "ar-SA"`).
   * يكتب النص في صندوق الإدخال بشكل حي ومتدفق في أجزاء من الثانية أثناء تحدث العميل (Interim Live Results).
2. **المحرك الاحتياطي: منصة GhostMind STT السحابية (Server-side Whisper-1 Fallback):**
   * للمتصفحات التي لا تدعم Web Speech API (مثل Firefox)، يتم التسجيل عبر `MediaRecorder` وإرسال الصوت إلى:
     * نقطة النهاية: `POST /api/transcribe`
     * المسار السحابي الخارجي: `POST https://ghostmind.optdmsa.com/v1/audio/transcriptions`
     * النموذج: `model: "whisper-1"`
     * اللغة: `language: "ar"`
   * **معالجة وتطبيع الوسائط (MIME Normalization):**
     * تقوم نقطة النهاية بتجريد لاحقة الترميز (مثل `;codecs=opus` الناتجة عن Chrome) لضمان تطابق نوع الملف تماماً مع القائمة البيضاء لمنصة GhostMind (`audio/webm`, `audio/mp4`, `audio/wav`, `audio/ogg`, `audio/mp3`).
     * معالجة حالات الصمت (`empty_audio`) وأخطاء الجلسات بمرونة تامة.
3. **إدارة الصلاحيات (Browser Permissions):**
   * تم ضبط `Permissions-Policy` في `next.config.ts`:
     ```
     Permissions-Policy: camera=(), microphone=(self), geolocation=(self)
     ```
   * في حال رفض الإذن يدوياً من إعدادات المتصفح، تظهر لافتة تنبيهية أنيقة ترشد الزائر لكيفية تفعيل المايك.

---

## 7. نظام الهوية والصور والتصميم البصري
* **صورة المستشار السعودي المعتمدة:**
  * تم استخراج خلفية البورتريه المعتمد بعناية فائقة وضغطه إلى صيغتي WebP و PNG:
    * البورتريه العائم بزاوية الموقع: `public/brand/advisor-bust.webp` (92.8 KB)
    * صورة الأفاتار الدائري للدردشة: `public/brand/advisor-avatar.webp` (26.6 KB)
* **المكتبة البصرية للخدمات والصفحات:**
  * صور عالية الجودة تحاكي بيئة الأعمال السعودية في مركز الملك عبد الله المالي (KAFD) بالرياض واستوديوهات الإنتاج الإبداعي، موزعة داخل مجلد `public/images/`.

---

## 8. الأمان وسياسات الحماية
* **Content Security Policy (CSP):**
  * تقييد مسارات الاتصال والسكربتات فقط للنطاقات المعتمدة (Google Analytics, Meta, Snapchat, TikTok, Clarity, GhostMind).
* **Strict-Transport-Security (HSTS):** مفعّل لمدة عامين على بيئة الإنتاج.
* **X-Content-Type-Options:** `nosniff`.
* **Referrer-Policy:** `strict-origin-when-cross-origin`.
* **Database Isolation:** صلاحيات محددة ومنع الـ schema mutations خارج ملفات الـ migrations.

---

## 9. دليل إعداد وتشغيل المشروع لأي مطور جديد

### المتطلبات الأساسية على جهاز المطور:
1. **Node.js:** إصدار `20.x` أو أحدث (يُفضل `v20.20.2`).
2. **Git:** مثبت ومعرّف على سطر الأوامر.
3. **PostgreSQL:** خادم محلي أو حساب على Neon PostgreSQL.

### خطوات التثبيت خطوة بخطوة:
```bash
# 1. استنساخ المستودع
git clone https://github.com/seven-lands-sa/seven-lands-platform.git
cd seven-lands-platform

# 2. تثبيت الحزم
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
```

### محتويات ملف `.env.local` المطلوب:
```env
# قاعدة البيانات (Neon أو PostgreSQL محلي)
DATABASE_URI=postgres://username:password@host:port/database?sslmode=require

# مفتاح تشفير جلسات Payload CMS (أي نص عشوائي قوي بطول 32 حرفاً)
PAYLOAD_SECRET=your-32-byte-secret-key-here

# النطاق الأساسي
SITE_CANONICAL_URL=https://7-lands.com
RUNTIME_ORIGIN=http://localhost:3000

# مفتاح منصة الذكاء الاصطناعي GhostMind (لـ STT والدردشة)
GHOSTMIND_API_KEY=gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g

# مفتاح إرسال البريد الإلكتروني (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Seven Lands <info@7-lands.com>

# تخزين الوسائط (Cloudflare R2 - اختياري للتطوير المحلي)
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=seven-lands-media
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
R2_PUBLIC_DOMAIN=https://media.7-lands.com
```

### تنفيذ الميجريشن وبدء التشغيل:
```bash
# 4. تطبيق الميجريشن على قاعدة البيانات
npx payload migrate

# 5. تشغيل بيئة التطوير
npm run dev

# 6. فتح المتصفح
# الموقع العام: http://localhost:3000 (يتحول تلقائياً إلى /ar)
# لوحة التحكم: http://localhost:3000/admin
```

---

## 10. إرشادات الصيانة والنشر
1. **النشر الآلي على الإنتاج:**
   * بمجرد رفع أي تعديل إلى الفرع الرئيسي `master` على GitHub:
     ```bash
     git add .
     git commit -m "feat/fix: description"
     git push origin master
     ```
   * يقوم Vercel ببناء ونشر التطبيق تلقائياً خلال أقل من دقيقة.
2. **التحقق من سلامة البناء قبل النشر:**
   ```bash
   npm run build
   ```
3. **تعديل صلاحيات أو إضافة جداول جديدة:**
   * يجب دائماً إنشاء Migration وعدم الاعتماد على push:
     ```bash
     npx payload migrate:create your_migration_name
     ```

---
*تم إعداد هذا الدليل ليكون المرجع الفني والهندسي الدائم لمنصة سفن لاند.*
