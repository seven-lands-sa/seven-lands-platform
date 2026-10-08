/**
 * Payload schema for the page blocks, BUILT FROM the registry metadata (`types.ts`).
 *
 * The registry owns keys, labels, descriptions, variants, media paths and publish requirements;
 * this file only translates that metadata into Payload field definitions. If a block is added to the
 * registry it must be added here too — `Record<BlockKey, …>` makes that a compile error, not a
 * runtime surprise.
 */
import type { Block, Field } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { INTERNAL_ROUTES } from "@/lib/content/route-registry";
import { lands } from "@/content/services";
import { BLOCK_REGISTRY, type BlockKey } from "./types";

const label = (ar: string, en: string) => ({ ar, en });

/** The seven capability slugs stay on their current authority until Phase F (§30). */
const landOptions = lands.map((land) => ({
  value: land.slug,
  label: label(land.copy.ar.title, land.copy.en.title),
}));

/** Localized single-line text. */
const text = (name: string, ar: string, en: string, required = false): Field => ({
  name,
  type: "text",
  label: label(ar, en),
  localized: true,
  ...(required ? { required: true } : {}),
});

/** Localized multi-line text — for ledes and paragraphs inside blocks. */
const area = (name: string, ar: string, en: string, required = false): Field => ({
  name,
  type: "textarea",
  label: label(ar, en),
  localized: true,
  ...(required ? { required: true } : {}),
});

/** Media reference through the Phase D picker (§67 — no IDs, no paths, no URLs typed by hand). */
const media = (name: string, ar: string, en: string, description?: { ar: string; en: string }): Field => ({
  name,
  type: "upload",
  relationTo: "media",
  label: label(ar, en),
  ...(description ? { admin: { description } } : {}),
});

/**
 * The one reusable CTA/link model (§28). Typed destinations only: an internal page, a known system
 * route, an external https URL, WhatsApp, phone or email. Unsafe protocols are refused by the
 * collection hook and by the publication validator.
 */
export const ctaGroup = (name: string, ar: string, en: string): Field => ({
  name,
  type: "group",
  label: label(ar, en),
  fields: [
    {
      name: "label",
      type: "text",
      label: label("نص الزر", "Button label"),
      localized: true,
      admin: {
        description: {
          ar: "الفارغ يعني زرًا بلا نص — لا يُنشر.",
          en: "Empty means a button with no text — it cannot publish.",
        },
      },
    },
    {
      name: "kind",
      type: "select",
      label: label("نوع الوجهة", "Destination type"),
      required: true,
      defaultValue: "internal",
      options: [
        { value: "internal", label: label("صفحة في الموقع", "Page on this site") },
        { value: "external", label: label("رابط خارجي (https)", "External URL (https)") },
        { value: "whatsapp", label: label("واتساب", "WhatsApp") },
        { value: "phone", label: label("هاتف", "Phone") },
        { value: "email", label: label("بريد إلكتروني", "Email") },
      ],
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      label: label("الصفحة", "Page"),
      admin: {
        condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) => siblingData?.kind === "internal",
        description: { ar: "اختر الصفحة من المكتبة — لا نكتب مسارات يدويًا.", en: "Pick the page — internal paths are never typed by hand." },
      },
    },
    {
      name: "routeKey",
      type: "select",
      label: label("مسار معروف", "Known route"),
      admin: {
        condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) => siblingData?.kind === "internal",
        description: {
          ar: "استخدم هذا الحقل للمسارات الثابتة مثل الرئيسية أو اتصل بنا.",
          en: "Use this for fixed routes such as home or contact.",
        },
      },
      options: INTERNAL_ROUTES.map((route) => ({
        value: route.key,
        label: label(route.label.ar, route.label.en),
      })),
    },
    {
      name: "url",
      type: "text",
      label: label("الرابط الخارجي", "External URL"),
      admin: {
        condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) => siblingData?.kind === "external",
        description: { ar: "يجب أن يبدأ بـ https://", en: "Must start with https://" },
      },
    },
    {
      name: "newTab",
      type: "checkbox",
      label: label("فتح في تبويب جديد", "Open in a new tab"),
      defaultValue: false,
      admin: { condition: (_data: unknown, siblingData: Record<string, unknown> | undefined) => siblingData?.kind === "external" },
    },
  ].map((field) => field as Field),
});

/** Shared fields every block carries (added by `sectionsField` in the Pages collection). */
export const commonBlockFields: Field[] = [
  {
    name: "label",
    type: "text",
    label: label("اسم داخلي للقسم", "Internal section name"),
    admin: {
      description: {
        ar: "يظهر لك فقط، لتمييز الأقسام داخل المحرر.",
        en: "Admin-only name, to tell sections apart in the editor.",
      },
    },
  },
  {
    name: "enabled",
    type: "checkbox",
    label: label("ظاهر في الصفحة", "Visible on the page"),
    defaultValue: true,
  },
  {
    name: "localeVisibility",
    type: "select",
    label: label("اللغة", "Language"),
    defaultValue: "both",
    options: [
      { value: "both", label: label("العربية والإنجليزية", "Arabic and English") },
      { value: "ar", label: label("العربية فقط", "Arabic only") },
      { value: "en", label: label("الإنجليزية فقط", "English only") },
    ],
    admin: {
      description: {
        ar: "القسم لا يظهر في لغة غير مسموح بها — ولا توجد وراثة صامتة للنص.",
        en: "A block never appears in a disallowed language — and no silent text inheritance.",
      },
    },
  },
];

const variantField = (key: BlockKey): Field | null => {
  const variants = BLOCK_REGISTRY[key].variants;
  if (!variants.length) return null;
  return {
    name: "variant",
    type: "select",
    label: label("الشكل المعتمد", "Approved variant"),
    required: true,
    defaultValue: variants[0].value,
    options: variants.map((variant) => ({ value: variant.value, label: label(variant.label.ar, variant.label.en) })),
  };
};

/** Item arrays reused by several blocks. */
const pairArray = (name: string, ar: string, en: string, fields: Field[], required = false): Field => ({
  name,
  type: "array",
  label: label(ar, en),
  ...(required ? { required: true, minRows: 1 } : {}),
  fields,
});

const BLOCK_FIELDS: Record<BlockKey, Field[]> = {
  hero: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("title1", "العنوان — السطر الأول", "Headline — line 1"),
    text("title2", "العنوان — السطر الثاني", "Headline — line 2"),
    text("titleAccent", "العنوان — السطر المميّز", "Headline — accent line"),
    area("support", "النص الداعم", "Supporting text"),
    text("pathCaption", "وصف مسار الهوية", "Path caption"),
    text("whatsappLine", "سطر واتساب", "WhatsApp line"),
    ctaGroup("primary", "الزر الأساسي", "Primary button"),
    ctaGroup("secondary", "الزر الثانوي", "Secondary button"),
    media("media", "الخلفية / الصورة", "Background / image", {
      ar: "اختيارية في هذا الشكل: الهيرو الحالي يعتمد رسم المسار.",
      en: "Optional in this variant: the current hero uses the path artwork.",
    }),
    media("mobileMedia", "صورة خاصة للجوال (اختياري)", "Mobile-specific image (optional)"),
  ],
  pageHeader: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("title", "العنوان", "Title", true),
    area("lede", "المقدمة", "Introduction"),
    area("support", "النص الداعم", "Supporting text"),
  ],
  richText: [
    text("heading", "عنوان القسم", "Section heading", true),
    {
      name: "body",
      type: "richText",
      label: label("الفقرات", "Paragraphs"),
      localized: true,
      required: true,
      editor: lexicalEditor(),
    },
  ],
  legalDocument: [
    area("intro", "المقدمة", "Introduction"),
    area("draftNotice", "ملاحظة المسودة", "Draft notice"),
    text("lastUpdatedLabel", "وسم آخر تحديث", "Last-updated label"),
    pairArray("sections", "الأقسام", "Sections", [
      text("title", "عنوان القسم", "Section title", true),
      { name: "body", type: "richText", label: label("النص", "Body"), localized: true, editor: lexicalEditor() },
    ]),
  ],
  trustStatement: [
    text("heading", "العنوان", "Heading", true),
    area("body", "النص", "Body"),
    area("note", "الملاحظة", "Note"),
    pairArray("facts", "الوقائع المثبتة", "Proven facts", [
      text("label", "التسمية", "Label"),
      area("value", "القيمة", "Value"),
    ]),
  ],
  landsSystem: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading", "العنوان", "Heading", true),
    area("lede", "المقدمة", "Introduction"),
  ],
  problems: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading", "العنوان", "Heading"),
    area("lede", "المقدمة", "Introduction"),
    text("explore", "نص زر الاستكشاف", "Explore button label"),
    pairArray("items", "المشكلات والنتائج", "Problems & outcomes", [
      area("question", "المشكلة", "Question"),
      area("answer", "النتيجة", "Answer"),
      { name: "land", type: "select", label: label("المجال المرتبط", "Related land"), options: landOptions },
    ]),
  ],
  process: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading", "العنوان", "Heading"),
    area("lede", "المقدمة", "Introduction"),
    pairArray("steps", "الخطوات", "Steps", [
      text("label", "عنوان الخطوة", "Step title"),
      area("body", "الوصف", "Description"),
    ]),
  ],
  why: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading", "العنوان", "Heading"),
    area("lede", "المقدمة", "Introduction"),
    pairArray("items", "الأسباب", "Reasons", [
      text("title", "العنوان", "Title"),
      area("body", "الوصف", "Description"),
    ]),
  ],
  servicesTeaser: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading", "العنوان", "Heading", true),
    area("lede", "المقدمة", "Introduction", true),
  ],
  workTeaser: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("selected", "عنوان حالة وجود أعمال منشورة", "Heading when work is publishable"),
    text("allWork", "نص زر كل الأعمال", "All-work label"),
    text("workPage", "نص زر صفحة الأعمال", "Work-page label"),
    text("emptyTitle", "عنوان الحالة الحالية", "Current-state heading"),
    area("emptyBody", "نص الحالة الحالية", "Current-state body"),
    ctaGroup("primary", "زر صفحة الأعمال", "Work-page button"),
    pairArray("emptyPoints", "النقاط الحالية", "Current-state points", [area("text", "النقطة", "Point")]),
  ],
  cta: [
    text("eyebrow", "النص العلوي", "Eyebrow"),
    text("heading1", "العنوان — السطر الأول", "Headline — line 1", true),
    text("heading2", "العنوان — السطر الثاني", "Headline — line 2"),
    area("body", "النص", "Body"),
    ctaGroup("primary", "الزر الأساسي", "Primary button"),
    ctaGroup("secondary", "الزر الثانوي", "Secondary button"),
  ],
  contactPanel: [
    text("eyebrow", "النص العلوي", "Eyebrow", true),
    text("title", "عنوان الصفحة", "Page title", true),
    area("lede", "المقدمة", "Introduction", true),
    text("channelsHeading", "عنوان قنوات التواصل", "Channels heading", true),
    text("formHeading", "عنوان النموذج", "Form heading", true),
    area("formHelp", "نص مساعد للنموذج", "Form help text", true),
    text("asideProjectHeading", "العمود الجانبي — عنوان بطاقة المشروع", "Aside — project card heading"),
    area("asideProjectBody", "العمود الجانبي — نص بطاقة المشروع", "Aside — project card body"),
    ctaGroup("asideProjectCta", "العمود الجانبي — زر بدء المشروع", "Aside — start-a-project button"),
    text("asideDirectionsHeading", "العمود الجانبي — عنوان الاتجاهات", "Aside — directions heading"),
    area("asideDirectionsBody", "العمود الجانبي — نص الاتجاهات", "Aside — directions body"),
  ],
  briefForm: [
    text("eyebrow", "النص العلوي", "Eyebrow", true),
    text("title", "عنوان الصفحة", "Page title", true),
    area("lede", "المقدمة", "Introduction", true),
    text("asideHeading", "العمود الجانبي — العنوان", "Aside — heading", true),
    pairArray("asidePoints", "العمود الجانبي — النقاط", "Aside — points", [area("text", "النقطة", "Point", true)], true),
    area("asideNote", "العمود الجانبي — الملاحظة", "Aside — note", true),
  ],
  mapEmbed: [
    text("heading", "عنوان القسم", "Section heading"),
    area("note", "ملاحظة", "Note"),
    ctaGroup("cta", "زر الاتجاهات", "Directions button"),
  ],
  operations: [
    text("heading", "العنوان", "Heading", true),
    pairArray(
      "steps",
      "الخطوات",
      "Steps",
      [text("label", "عنوان الخطوة", "Step title", true), area("body", "الوصف", "Description", true)],
      true,
    ),
    pairArray(
      "facts",
      "الوقائع",
      "Facts",
      [text("label", "التسمية", "Label", true), area("value", "القيمة", "Value", true)],
      true,
    ),
    text("locationHeading", "الموقع — العنوان", "Location — heading", true),
    area("locationBody", "الموقع — النص", "Location — body", true),
  ],
  noteSection: [
    text("heading", "العنوان", "Heading", true),
    area("note", "الملاحظة", "Note", true),
  ],
  buttonRow: [
    ctaGroup("primary", "الزر الأساسي", "Primary button"),
    ctaGroup("secondary", "الزر الثانوي", "Secondary button"),
  ],
};

/** The Payload block definitions for the Pages collection, in registry order. */
export const PAGE_BLOCK_DEFINITIONS: Block[] = (Object.keys(BLOCK_FIELDS) as BlockKey[]).map((key) => {
  const meta = BLOCK_REGISTRY[key];
  const variant = variantField(key);
  return {
    slug: key,
    labels: { singular: label(meta.label.ar, meta.label.en), plural: label(meta.label.ar, meta.label.en) },
    fields: [...(variant ? [variant] : []), ...BLOCK_FIELDS[key], ...commonBlockFields],
  } satisfies Block;
});
