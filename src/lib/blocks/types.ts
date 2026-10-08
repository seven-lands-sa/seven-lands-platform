/**
 * THE BLOCK REGISTRY — the single source of truth for page composition (§8, §27).
 *
 * Everything that needs to know about a block reads it from here:
 *
 *   · the Payload schema            (`schema.ts` builds the block definitions from this metadata)
 *   · the public renderer           (`src/components/blocks/PageBlocks.tsx`, exhaustively typed)
 *   · the media usage registry      (media paths are declared once, here)
 *   · the publication validator     (required fields per locale are declared once, here)
 *   · the admin block adder         (labels + descriptions come from here)
 *
 * No Payload imports in this file: it is small, dependency-free and safe to reach from any layer.
 */

export type LocalizedLabel = { ar: string; en: string };

export type BlockKey =
  | "hero"
  | "pageHeader"
  | "richText"
  | "legalDocument"
  | "trustStatement"
  | "landsSystem"
  | "problems"
  | "process"
  | "why"
  | "servicesTeaser"
  | "workTeaser"
  | "cta"
  | "contactPanel"
  | "briefForm"
  | "mapEmbed"
  | "operations"
  | "noteSection"
  | "buttonRow";

export type BlockVariant = { value: string; label: LocalizedLabel };

export type BlockMeta = {
  key: BlockKey;
  /** Shown in the block adder and on the block header (§55 — Arabic first, no schema names). */
  label: LocalizedLabel;
  /** One line explaining what the block is for (§56 — the adder is a chooser, not a dropdown). */
  description: LocalizedLabel;
  /** Approved visual variants. Empty when the block has exactly one presentation (§57). */
  variants: readonly BlockVariant[];
  /**
   * Dotted paths *inside the block data* that can hold a media reference (§27).
   * Used by: usage tracking, the private-media publication gate, dependent cache invalidation.
   */
  mediaPaths: readonly string[];
  /**
   * Whether the shipped renderer actually DISPLAYS the block's media.
   *
   * The hero stores `media`/`mobileMedia`, but the current design has no image presentation for it
   * (the slot holds the brand path art). Storing an image that never renders would be silently
   * losing an editor's work, so the publish validator refuses such a block with a named reason
   * until a media presentation is designed and approved (§2/§83: the frontend owns the visual
   * design; admins never get an image field that does nothing).
   */
  rendersMedia?: boolean;
  /**
   * Dotted paths *inside the block data* that hold a CTA/link group (§28). Validated on every write
   * so an unsafe protocol can never be stored in the first place.
   */
  ctaPaths: readonly string[];
  /**
   * Dotted paths that must be non-empty in a locale before the page may publish that locale (§18,
   * §72). Evaluated per locale against that locale's own values — never against the other language.
   */
  required: readonly string[];
  /** Set when the block renders an interactive, code-backed component (§31). */
  system?: boolean;
  /**
   * True when a public renderer exists in this release. A block without a renderer cannot be
   * published — the validator refuses it instead of letting a section vanish silently.
   */
  rendered?: boolean;
};

/** Every block key, in the order the adder offers them. */
export const BLOCK_KEYS: readonly BlockKey[] = [
  "hero",
  "pageHeader",
  "richText",
  "legalDocument",
  "trustStatement",
  "landsSystem",
  "problems",
  "process",
  "why",
  "servicesTeaser",
  "workTeaser",
  "cta",
  "contactPanel",
  "briefForm",
  "mapEmbed",
  "operations",
  "noteSection",
  "buttonRow",
] as const;

export const BLOCK_REGISTRY: Record<BlockKey, BlockMeta> = {
  hero: {
    key: "hero",
    label: { ar: "الهيرو", en: "Hero" },
    description: {
      ar: "أول ما يراه الزائر: العنوان الرئيسي، الدعم، زرّان، وخلفية اختيارية.",
      en: "The first thing a visitor sees: headline, support, two buttons, optional artwork.",
    },
    variants: [{ value: "brandPath", label: { ar: "مسار سفن لاند", en: "Brand path" } }],
    mediaPaths: ["media", "mobileMedia"],
    rendersMedia: false,
    ctaPaths: ["primary", "secondary"],
    required: ["eyebrow", "title1", "support", "primary.label"],
    rendered: true,
  },
  pageHeader: {
    key: "pageHeader",
    label: { ar: "ترويسة الصفحة", en: "Page header" },
    description: {
      ar: "عنوان الصفحة ومقدّمتها في أعلى الصفحة، بالعرض المعتمد لذلك الصفحة.",
      en: "The page title and introduction at the top of the page, in an approved width.",
    },
    /* Three approved presentations, taken from the pages that already ship: /contact, the wider
       /start-a-project column, and /about's header with the brand-path card beside it. */
    variants: [
      { value: "default", label: { ar: "عادي (تواصل)", en: "Default (contact)" } },
      { value: "wide", label: { ar: "أوسع (ابدأ مشروعك)", en: "Wide (start a project)" } },
      { value: "withArt", label: { ar: "مع بطاقة المسار (من نحن)", en: "With the path card (about)" } },
    ],
    mediaPaths: [],
    ctaPaths: [],
    required: ["title"],
    rendered: true,
  },
  richText: {
    key: "richText",
    label: { ar: "نص بعنوان جانبي", en: "Text with a side heading" },
    description: {
      ar: "قسم نصّي: العنوان في عمود، والفقرات في العمود المقابل (تركيب صفحة «من نحن»).",
      en: "A text section: the heading in one column, the paragraphs in the other (the about layout).",
    },
    variants: [{ value: "split", label: { ar: "عنوان جانبي وفقرات", en: "Side heading with paragraphs" } }],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "body"],
    rendered: true,
  },
  legalDocument: {
    key: "legalDocument",
    label: { ar: "مستند قانوني", en: "Legal document" },
    description: {
      ar: "بنية سياسة الخصوصية/الشروط: مقدمة وأقسام بعناوين.",
      en: "Privacy/terms structure: an intro and titled sections.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["intro", "sections"],
    /* Rendered on the public site through the shipped legal layout (see PageBlocks). */
    rendered: true,
  },
  trustStatement: {
    key: "trustStatement",
    label: { ar: "بيان الثقة", en: "Trust statement" },
    description: {
      ar: "ما نستطيع إثباته اليوم بصدق، بدون أرقام أو شعارات غير مؤكدة.",
      en: "What we can honestly prove today — no unverified numbers or logos.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "body", "facts"],
    rendered: true,
  },
  landsSystem: {
    key: "landsSystem",
    label: { ar: "نظام المجالات السبعة", en: "Seven lands system" },
    description: {
      ar: "الشكل التفاعلي للمجالات السبعة. المجالات نفسها تُدار من مصادرها.",
      en: "The interactive seven-lands visual. The lands themselves come from their own source.",
    },
    variants: [{ value: "system", label: { ar: "منظومة تفاعلية", en: "Interactive system" } }],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "lede"],
    system: true,
    rendered: true,
  },
  problems: {
    key: "problems",
    label: { ar: "المشكلات والنتائج", en: "Problems & outcomes" },
    description: {
      ar: "اقتران كل مشكلة شائعة بالنتيجة التي نعمل عليها.",
      en: "Pairs a common problem with the outcome we work towards.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "lede", "items"],
    rendered: true,
  },
  process: {
    key: "process",
    label: { ar: "كيف نعمل", en: "How we work" },
    description: { ar: "خطوات العمل بالترتيب.", en: "The working method, step by step." },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "lede", "steps"],
    rendered: true,
  },
  why: {
    key: "why",
    label: { ar: "لماذا سفن لاند", en: "Why Seven Lands" },
    description: { ar: "أسباب مختصرة تُكتب بصدق.", en: "Short, honest reasons." },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "lede", "items"],
    rendered: true,
  },
  servicesTeaser: {
    key: "servicesTeaser",
    label: { ar: "فهرس المجالات", en: "Services index" },
    description: {
      ar: "فهرس المجالات السبعة في شبكة. بيانات كل مجال تُدار من مصدرها حتى مرحلة الخدمات.",
      en: "An index of the seven lands in a grid. Their data stays on its own source until the services phase.",
    },
    variants: [{ value: "index", label: { ar: "فهرس", en: "Index" } }],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "lede"],
    rendered: true,
  },
  workTeaser: {
    key: "workTeaser",
    label: { ar: "لمحة أعمالنا", en: "Work teaser" },
    description: {
      ar: "لمحة عن الأعمال. لا بطاقات وهمية: إن لم يوجد عمل قابل للنشر نقول ذلك بصراحة.",
      en: "A work teaser. No fabricated cards: if nothing is publishable we say so honestly.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: ["primary"],
    required: ["eyebrow", "emptyTitle", "emptyPoints"],
    rendered: true,
  },
  cta: {
    key: "cta",
    label: { ar: "دعوة للتواصل", en: "Call to action" },
    description: {
      ar: "قسم ختامي بزرّي إجراء.",
      en: "A closing section with two actions.",
    },
    variants: [{ value: "dark", label: { ar: "داكن", en: "Dark" } }],
    mediaPaths: [],
    ctaPaths: ["primary", "secondary"],
    required: ["heading1", "body", "primary.label"],
    rendered: true,
  },
  contactPanel: {
    key: "contactPanel",
    label: { ar: "لوحة التواصل", en: "Contact panel" },
    description: {
      ar: "قنوات التواصل (من الإعدادات العامة) مع نموذج استفسار سريع وعمود جانبي.",
      en: "Contact channels (from the global settings) with a quick enquiry form and a side column.",
    },
    variants: [],
    mediaPaths: [],
    /* The internal button labels point at real routes: the panel never re-types a phone number, an
       address or a link — those come from the global settings (§86). */
    ctaPaths: ["asideProjectCta"],
    required: ["eyebrow", "title", "lede", "channelsHeading", "formHeading", "formHelp"],
    rendered: true,
  },
  briefForm: {
    key: "briefForm",
    label: { ar: "نموذج بدء المشروع", en: "Project brief form" },
    description: {
      ar: "النموذج الكامل مع عنوانه و«ما يحدث بعد الإرسال». خصائص النموذج تقنية وتبقى في الشيفرة.",
      en: "The full form with its heading and \"what happens next\". The form's behaviour stays in code.",
    },
    variants: [{ value: "full", label: { ar: "كامل", en: "Full" } }],
    mediaPaths: [],
    ctaPaths: [],
    required: ["eyebrow", "title", "lede", "asideHeading", "asidePoints", "asideNote"],
    system: true,
    rendered: true,
  },
  operations: {
    key: "operations",
    label: { ar: "كيف نعمل + الموقع", en: "How we work + location" },
    description: {
      ar: "طريقة العمل خطوة بخطوة، مع وقائع العمل وبطاقة الموقع (العنوان من الإعدادات العامة).",
      en: "The method step by step, with the working facts and the location card (address from the global settings).",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "steps", "facts", "locationHeading", "locationBody"],
    rendered: true,
  },
  noteSection: {
    key: "noteSection",
    label: { ar: "ملاحظة تعريفيّة", en: "Informational note" },
    description: {
      ar: "عنوان قصير بجانب ملاحظة صريحة — مثل حالة الفريق المؤجّلة.",
      en: "A short heading beside an explicit note — such as the deferred team state.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: [],
    required: ["heading", "note"],
    rendered: true,
  },
  buttonRow: {
    key: "buttonRow",
    label: { ar: "صفّ أزرار", en: "Button row" },
    description: {
      ar: "زرّان معتمدان جنبًا إلى جنب: أساسي وثانوي، بوجهات من قائمة مسموحة.",
      en: "Two approved buttons side by side: primary and secondary, with destinations from a safe list.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: ["primary", "secondary"],
    required: [],
    rendered: true,
  },
  mapEmbed: {
    key: "mapEmbed",
    label: { ar: "الموقع على الخريطة", en: "Location & map" },
    description: {
      ar: "بطاقة الموقع مع رابط الخريطة من الإعدادات العامة.",
      en: "The location card with the map link from the global settings.",
    },
    variants: [],
    mediaPaths: [],
    ctaPaths: ["cta"],
    required: [],
  },
};

/** Media-bearing dotted paths of a whole sections array (§27 — one contract, three consumers). */
export function collectBlockMediaPaths(sections: readonly { blockType?: string | null }[]): string[] {
  const paths: string[] = [];
  sections.forEach((block, index) => {
    const meta = BLOCK_REGISTRY[block?.blockType as BlockKey];
    if (!meta) return;
    for (const path of meta.mediaPaths) paths.push(`sections.${index}.${path}`);
  });
  return paths;
}

/** CTA-bearing dotted paths of a whole sections array (§28). */
export function collectBlockCtaPaths(sections: readonly { blockType?: string | null }[]): string[] {
  const paths: string[] = [];
  sections.forEach((block, index) => {
    const meta = BLOCK_REGISTRY[block?.blockType as BlockKey];
    if (!meta) return;
    for (const path of meta.ctaPaths) paths.push(`sections.${index}.${path}`);
  });
  return paths;
}

/**
 * Required-field paths for a block, resolved per locale: `["sections.3.heading1", …]`.
 * The validator uses this to name exactly what is missing (§17, §75 — never a schema path in the UI).
 */
export function blockRequiredPaths(key: BlockKey, index: number): string[] {
  return BLOCK_REGISTRY[key].required.map((path) => `sections.${index}.${path}`);
}

export function isBlockKey(value: unknown): value is BlockKey {
  return typeof value === "string" && (BLOCK_KEYS as readonly string[]).includes(value);
}
