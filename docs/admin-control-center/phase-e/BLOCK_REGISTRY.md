# سجل الأقسام (Block Registry) — مصدر حقيقة واحد

ملف واحد: `src/lib/blocks/types.ts` تبني منه أربع طبقات نفسها: مخطط Payload (`schema.ts`)، العارض
العام (`src/components/blocks/PageBlocks.tsx`)، مدقّق النشر، وواجهة المشرف (التسميات والوصف).

## المفاتيح (15)

`hero · pageHeader · richText · legalDocument · trustStatement · landsSystem · problems · process ·
why · servicesTeaser · workTeaser · cta · contactPanel · briefForm · mapEmbed`

منها **منفّذ ومعروض الآن (9)**: `hero · trustStatement · landsSystem · problems · process · why ·
workTeaser · legalDocument · cta`.
و**غير معروض بعد (6)**: `pageHeader · richText · servicesTeaser · contactPanel · briefForm ·
mapEmbed` — لا يمكن نشرها في هذه المرحلة: المدقّق يرفضها برسالة عربية صريحة، فلا يختفي قسم بصمت.

## ما يملكه السجل لكل قسم

| الملكية | الأثر |
| --- | --- |
| `label` / `description` | ما يراه المشرف في قائمة الإضافة (عربي أولًا، بلا أسماء تقنية). |
| `variants` | الأشكال المعتمدة فقط؛ لا شكل يُخترع من المشرف. |
| `required` | الحقول الإلزامية في كل لغة على حدة (لا سقوط من العربية إلى الإنجليزية). |
| `mediaPaths` | مسارات الوسائط داخل القسم (لا يوجد اليوم قسم يعرض صورة — بطاقة `hero` تحفظ `media`/`mobileMedia` لكن العرض البصري يصل مع تحديث تصميم معتمد، ولذلك يُرفض النشر حتى ذلك الحين بدل تخزين صورة لا تظهر). |
| `ctaPaths` | أزرار الإجراءات؛ تُفحص عند كل كتابة (لا `javascript:` ولا روابط داخلية مكتوبة يدويًا). |
| `rendered` | هل يوجد عارض عام؟ غير المعروض يُرفض عند النشر. |

## نموذج الإجراء (CTA)

أنواع مسموحة فقط: صفحة داخلية (علاقة أو `routeKey`)، `https` خارجي، واتساب، هاتف، بريد. أي بروتوكول
آخر (`javascript:`, `data:`, `vbscript:`, `file:`, `blob:`) يُرفض عند الكتابة وعند النشر، ولمنع
الأخطاء يُحلّ الوجهة من الإعدادات العامة لا من نسخ يدوية.

## الحدود

لا HTML حرًّا، ولا CSS، ولا هوامش، ولا حركات، ولا تداخل غير محدود، ولا JSON عام (§2). الشكل يملكه
التصميم، والمشرف يملك المحتوى والتركيب المسموح.
