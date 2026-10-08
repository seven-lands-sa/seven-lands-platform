/**
 * PHASE E — deterministic page seeder.
 *
 * WHAT IT DOES
 * Rebuilds each migrated page's blocks from the SAME sources the public site already renders:
 * `@/content/home`, `@/content/work` and `src/i18n/messages/{ar,en}.json`. Nothing is retyped and
 * nothing is paraphrased, which is what makes content equivalence a fact rather than a promise.
 *
 * WRITE CONTRACT (measured, then corrected by measurement — do not "simplify" this back)
 *   Payload's Local API coerces `locale: "all"` to the DEFAULT locale on writes, so one bilingual
 *   save stores the `{ ar, en }` OBJECT inside the Arabic row and never writes English at all
 *   (proven on this database; the same call as a `create` throws inside drizzle). The supported
 *   shape is therefore one write PER LOCALE, each carrying that locale's existing row ids at every
 *   nesting level — a second-locale write whose rows arrive without ids persists the rows but loses
 *   their values. Hence: Arabic pass first (creates ids), English pass second (re-uses them).
 * WHAT IT REFUSES TO DO
 *   · Never publishes: the document is saved as a draft, so the public site keeps serving the static
 *     baseline until a human publishes through the gated endpoint.
 *   · Never overwrites an existing page document unless FORCE_PAGE_SEED=true (dev databases only).
 *   · Refuses to run against a production database without ALLOW_PRODUCTION_SEED=true.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";
import config from "@payload-config";

import { problems, principles, positioning, process as processContent } from "@/content/home";
import { workEmptyState } from "@/content/work";
import type { AppLocale } from "@/i18n/routing";

const payload = await getPayload({ config });

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  console.error("REFUSED: refusing to seed pages in production without ALLOW_PRODUCTION_SEED=true.");
  process.exit(1);
}

/* ── content sources ────────────────────────────────────────────────────────────────────────── */

const messagesDir = path.resolve("src/i18n/messages");
const messages: Record<AppLocale, Record<string, unknown>> = {
  ar: JSON.parse(readFileSync(path.join(messagesDir, "ar.json"), "utf8")) as Record<string, unknown>,
  en: JSON.parse(readFileSync(path.join(messagesDir, "en.json"), "utf8")) as Record<string, unknown>,
};

const read = (bag: Record<string, unknown>, dotted: string): unknown =>
  dotted.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), bag);

/** One localized value, both languages — the shape `locale: "all"` expects. */
const L = (dotted: string): { ar: string; en: string } => {
  const values = (["ar", "en"] as const).map((locale) => {
    const value = read(messages[locale], dotted);
    if (typeof value !== "string" || !value.trim()) throw new Error(`missing message ${dotted} (${locale})`);
    return value;
  });
  return { ar: values[0], en: values[1] };
};

/** One localized ARRAY (legal sections), both languages. */
const LA = <T,>(dotted: string): { ar: T[]; en: T[] } => {
  const values = (["ar", "en"] as const).map((locale) => {
    const value = read(messages[locale], dotted);
    if (!Array.isArray(value) || value.length === 0) throw new Error(`missing message array ${dotted} (${locale})`);
    return value as T[];
  });
  return { ar: values[0], en: values[1] };
};

/** One paragraph node of a Lexical document. */
const paragraph = (text: string): Record<string, unknown> => ({
  type: "paragraph",
  format: "",
  indent: 0,
  version: 1,
  direction: null,
  textFormat: 0,
  textStyle: "",
  children: [{ type: "text", version: 1, text, format: 0, detail: 0, mode: "normal", style: "" }],
});

/** Text → a Lexical document with ONE paragraph per entry (story copy is several paragraphs). */
const lexicalDoc = (paragraphs: string[]): Record<string, unknown> => ({
  root: { type: "root", format: "", indent: 0, version: 1, direction: null, children: paragraphs.map(paragraph) },
});

/** A plain string → a one-paragraph Lexical document (the legal copy has no inline marks yet). */
const lexical = (text: string): Record<string, unknown> => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: null,
        textFormat: 0,
        textStyle: "",
        children: [{ type: "text", version: 1, text, format: 0, detail: 0, mode: "normal", style: "" }],
      },
    ],
  },
});

const LM = (make: (locale: AppLocale) => string): { ar: string; en: string } => ({ ar: make("ar"), en: make("en") });

/* ── the eight home blocks: one composition, both languages inside it (§7, §15–§18) ─────────── */

function buildHomeBlocks() {
  return [
    {
      blockType: "hero",
      label: "الهيرو",
      enabled: true,
      localeVisibility: "both",
      variant: "brandPath",
      eyebrow: L("home.hero.eyebrow"),
      title1: L("home.hero.title1"),
      title2: L("home.hero.title2"),
      titleAccent: L("home.hero.titleAccent"),
      support: L("home.hero.support"),
      pathCaption: L("home.hero.pathCaption"),
      whatsappLine: L("home.hero.whatsappLine"),
      primary: { kind: "internal", routeKey: "start-a-project", label: L("home.hero.primary") },
      secondary: { kind: "internal", routeKey: "work", label: L("home.hero.secondary") },
    },
    {
      blockType: "trustStatement",
      label: "بيان الثقة",
      enabled: true,
      localeVisibility: "both",
      heading: LM((locale) => positioning[locale].heading),
      body: LM((locale) => positioning[locale].body),
      note: L("home.trust.note"),
      facts: positioning.ar.facts.map((_, index) => ({
        label: LM((locale) => positioning[locale].facts[index].label),
        value: LM((locale) => positioning[locale].facts[index].value),
      })),
    },
    {
      blockType: "landsSystem",
      label: "نظام المجالات",
      enabled: true,
      localeVisibility: "both",
      variant: "system",
      eyebrow: L("home.lands.eyebrow"),
      heading: L("home.lands.heading"),
      lede: L("home.lands.lede"),
    },
    {
      blockType: "problems",
      label: "المشكلات",
      enabled: true,
      localeVisibility: "both",
      eyebrow: L("home.problems.eyebrow"),
      heading: LM((locale) => problems[locale].heading),
      lede: LM((locale) => problems[locale].lede),
      explore: L("home.problems.explore"),
      items: problems.ar.items.map((_, index) => ({
        question: LM((locale) => problems[locale].items[index].question),
        answer: LM((locale) => problems[locale].items[index].answer),
        land: problems.ar.items[index].land,
      })),
    },
    {
      blockType: "workTeaser",
      label: "لمحة الأعمال",
      enabled: true,
      localeVisibility: "both",
      eyebrow: L("home.work.eyebrow"),
      selected: L("home.work.selected"),
      allWork: L("home.work.allWork"),
      workPage: L("home.work.workPage"),
      emptyTitle: LM((locale) => workEmptyState[locale].title),
      emptyBody: LM((locale) => workEmptyState[locale].body),
      primary: { kind: "internal", routeKey: "work", label: L("home.work.workPage") },
      emptyPoints: (read(messages.ar, "home.work.emptyPoints") as string[]).map((_, index) => ({
        text: {
          ar: (read(messages.ar, "home.work.emptyPoints") as string[])[index],
          en: (read(messages.en, "home.work.emptyPoints") as string[])[index],
        },
      })),
    },
    {
      blockType: "process",
      label: "طريقة العمل",
      enabled: true,
      localeVisibility: "both",
      eyebrow: L("home.process.eyebrow"),
      heading: LM((locale) => processContent[locale].heading),
      lede: LM((locale) => processContent[locale].lede),
      steps: processContent.ar.steps.map((_, index) => ({
        label: LM((locale) => processContent[locale].steps[index].label),
        body: LM((locale) => processContent[locale].steps[index].body),
      })),
    },
    {
      blockType: "why",
      label: "لماذا سفن لاند",
      enabled: true,
      localeVisibility: "both",
      eyebrow: L("home.why.eyebrow"),
      heading: LM((locale) => principles[locale].heading),
      lede: LM((locale) => principles[locale].lede),
      items: principles.ar.items.map((_, index) => ({
        title: LM((locale) => principles[locale].items[index].title),
        body: LM((locale) => principles[locale].items[index].body),
      })),
    },
    {
      blockType: "cta",
      label: "الدعوة الختامية",
      enabled: true,
      localeVisibility: "both",
      variant: "dark",
      eyebrow: L("home.finalCta.eyebrow"),
      heading1: L("home.finalCta.heading1"),
      heading2: L("home.finalCta.heading2"),
      body: L("home.finalCta.body"),
      primary: { kind: "internal", routeKey: "start-a-project", label: L("home.finalCta.primary") },
      secondary: { kind: "whatsapp", label: L("home.finalCta.secondary") },
    },
  ];
}


/* ── the about / contact / start-a-project compositions (§43 — the same sources the pages use) ──
 *
 * Every string below comes from the SAME authority the shipped page reads: `src/i18n/messages/*`
 * or `@/content/home`. A few strings live inline in the page files (the capability index wording,
 * the two contact side cards) — they are copied here VERBATIM from those files, which is why the
 * text-equivalence proof compares the rendered pages rather than trusting this comment.
 */

/** Strings the shipped pages hold inline (not in the message catalogue) — both languages, verbatim. */
const INLINE = {
  aboutIndexEyebrow: { ar: "المجالات", en: "Capabilities" },
  aboutIndexHeading: { ar: "سبعة مجالات، فريق واحد.", en: "Seven capabilities, one team." },
  aboutIndexLede: {
    ar: "كل مجال يعمل كتخصص مستقل، ويُدار مع بقية المجالات حول الهدف نفسه.",
    en: "Each capability stands as its own discipline, run alongside the others against the same goal.",
  },
  principlesEyebrow: { ar: "المبادئ", en: "Principles" },
  contactAsideProjectHeading: { ar: "مشروع جديد؟", en: "New project?" },
  contactAsideProjectBody: {
    ar: "نموذج بدء المشروع يعطينا الهدف والنطاق والتوقيت، فيكون ردنا أدق من أول رسالة.",
    en: "The project brief gives us the goal, scope and timing, so our first reply is more useful.",
  },
  contactAsideDirectionsBody: {
    ar: "نستقبل المشاريع من كل مناطق المملكة، والزيارات الميدانية تُحدد حسب المشروع.",
    en: "We deliver across Saudi Arabia; on-site visits are arranged per project.",
  },
} as const;

/** One inline bilingual pair as a `{ ar, en }` leaf. */
const I = (pair: { ar: string; en: string }): { ar: string; en: string } => ({ ar: pair.ar, en: pair.en });

function buildAboutBlocks() {
  const story = LA<string>("about.story");
  return [
    {
      blockType: "pageHeader",
      enabled: true,
      localeVisibility: "both",
      variant: "withArt",
      label: "ترويسة الصفحة",
      eyebrow: L("about.hero.eyebrow"),
      title: L("about.hero.title"),
      lede: L("about.hero.lede"),
    },
    {
      blockType: "richText",
      enabled: true,
      localeVisibility: "both",
      variant: "split",
      label: "قصة الشركة",
      heading: L("about.storyHeading"),
      body: { ar: lexicalDoc(story.ar), en: lexicalDoc(story.en) },
    },
    {
      blockType: "servicesTeaser",
      enabled: true,
      localeVisibility: "both",
      variant: "index",
      label: "فهرس المجالات",
      eyebrow: I(INLINE.aboutIndexEyebrow),
      heading: I(INLINE.aboutIndexHeading),
      lede: I(INLINE.aboutIndexLede),
    },
    {
      blockType: "why",
      enabled: true,
      localeVisibility: "both",
      label: "المبادئ",
      eyebrow: I(INLINE.principlesEyebrow),
      heading: LM((locale) => principles[locale].heading),
      lede: LM((locale) => principles[locale].lede),
      items: principles.ar.items.map((_, index) => ({
        title: LM((locale) => principles[locale].items[index].title),
        body: LM((locale) => principles[locale].items[index].body),
      })),
    },
    {
      blockType: "operations",
      enabled: true,
      localeVisibility: "both",
      label: "كيف نعمل + الموقع",
      heading: LM((locale) => processContent[locale].heading),
      steps: processContent.ar.steps.map((_, index) => ({
        label: LM((locale) => processContent[locale].steps[index].label),
        body: LM((locale) => processContent[locale].steps[index].body),
      })),
      facts: (["factsModel", "factsStart", "factsArea"] as const).map((key) => ({
        label: L(`about.${key}`),
        value: L(`about.${key}Value`),
      })),
      locationHeading: L("about.locationHeading"),
      locationBody: L("about.locationBody"),
    },
    {
      blockType: "noteSection",
      enabled: true,
      localeVisibility: "both",
      label: "ملاحظة الفريق",
      heading: L("about.teamHeading"),
      note: L("about.teamNote"),
    },
    {
      blockType: "buttonRow",
      enabled: true,
      localeVisibility: "both",
      label: "صفّ الأزرار",
      primary: { kind: "internal", routeKey: "start-a-project", label: L("cta.start") },
      secondary: { kind: "internal", routeKey: "services", label: L("cta.exploreServices") },
    },
    {
      blockType: "cta",
      enabled: true,
      localeVisibility: "both",
      variant: "dark",
      label: "الدعوة الختامية",
      eyebrow: L("home.finalCta.eyebrow"),
      heading1: L("home.finalCta.heading1"),
      heading2: L("home.finalCta.heading2"),
      body: L("home.finalCta.body"),
      primary: { kind: "internal", routeKey: "start-a-project", label: L("home.finalCta.primary") },
      secondary: { kind: "whatsapp", label: L("home.finalCta.secondary") },
    },
  ];
}

function buildContactBlocks() {
  return [
    {
      blockType: "contactPanel",
      enabled: true,
      localeVisibility: "both",
      label: "لوحة التواصل",
      eyebrow: L("contact.hero.eyebrow"),
      title: L("contact.hero.title"),
      lede: L("contact.hero.lede"),
      channelsHeading: L("contact.channelsHeading"),
      formHeading: L("contact.formHeading"),
      formHelp: L("contact.formHelp"),
      asideProjectHeading: I(INLINE.contactAsideProjectHeading),
      asideProjectBody: I(INLINE.contactAsideProjectBody),
      asideProjectCta: { kind: "internal", routeKey: "start-a-project", label: L("contact.startInstead") },
      asideDirectionsHeading: L("cta.directions"),
      asideDirectionsBody: I(INLINE.contactAsideDirectionsBody),
    },
  ];
}

function buildStartBlocks() {
  const points = LA<string>("start.aside.points");
  return [
    {
      blockType: "briefForm",
      enabled: true,
      localeVisibility: "both",
      variant: "full",
      label: "نموذج بدء المشروع",
      eyebrow: L("start.hero.eyebrow"),
      title: L("start.hero.title"),
      lede: L("start.hero.lede"),
      asideHeading: L("start.aside.heading"),
      asidePoints: points.ar.map((text, index) => ({ text: { ar: text, en: points.en[index] ?? text } })),
      asideNote: L("start.aside.note"),
    },
  ];
}

/** Replaces every `{ ar, en }` leaf with one locale's plain value — the shape a locale write needs. */
function flattenLocale(node: unknown, locale: "ar" | "en"): unknown {
  const isLeaf = (value: unknown): value is Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const keys = Object.keys(value);
    return keys.length > 0 && keys.every((key) => key === "ar" || key === "en");
  };
  if (isLeaf(node)) return node[locale] ?? null;
  if (Array.isArray(node)) return node.map((row) => flattenLocale(row, locale));
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) out[key] = flattenLocale(child, locale);
    return out;
  }
  return node;
}

/* ── the legal pages: one `legalDocument` block per page, straight from `messages.legal.*` ────── */

function buildLegalBlocks(page: "privacy" | "terms"): unknown[] {
  const meta = L(page === "privacy" ? "meta.privacy.title" : "meta.terms.title");
  const intro = L(`legal.${page}.intro`);
  const draftNotice = L("legal.draftNotice");
  const lastUpdatedLabel = L("legal.lastUpdated");
  const sections = LA<{ title: string; body: string }>(`legal.${page}.sections`);

  return [
    {
      blockType: "legalDocument",
      enabled: true,
      localeVisibility: "both",
      label: meta,
      intro,
      draftNotice,
      lastUpdatedLabel,
      sections: sections.ar.map((section, index) => ({
        title: { ar: section.title, en: sections.en[index]?.title ?? section.title },
        /* Bilingual rich text: the leaf-detection in `flattenLocale` sees `{ ar, en }` and picks the
           right Lexical document per locale — no string ever lands in a rich-text column. */
        body: { ar: lexical(section.body), en: lexical(sections.en[index]?.body ?? section.body) },
      })),
    },
  ];
}

/* ── the seed run ───────────────────────────────────────────────────────────────────────────── */


/**
 * Re-attaches the row ids read back from the database onto the seed's own values.
 *
 * Why ids at every level: a second-locale write whose rows arrive without ids persists the rows but
 * loses their values (measured here — `facts`, `items` and `steps` came back empty to the publish
 * gate until the ids were carried through). A single-locale read returns PLAIN values, not
 * `{ ar, en }` leaves, so values come from the seed and only ids come from the read.
 */
function attachIds(readNode: unknown, seedNode: unknown): unknown {
  if (Array.isArray(seedNode)) {
    const readArray = Array.isArray(readNode) ? readNode : [];
    return seedNode.map((row, index) => attachIds(readArray[index], row));
  }
  if (seedNode && typeof seedNode === "object") {
    const readRecord =
      readNode && typeof readNode === "object" && !Array.isArray(readNode) ? (readNode as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    if (typeof readRecord.id === "string") out.id = readRecord.id;
    for (const [key, child] of Object.entries(seedNode as Record<string, unknown>)) {
      out[key] = attachIds(readRecord[key], child);
    }
    return out;
  }
  return seedNode;
}

type SeedTarget = {
  systemKey: "home" | "privacy" | "terms" | "about" | "contact" | "start-a-project";
  slug: string;
  title: { ar: string; en: string };
  blocks: unknown[];
  seo: { title: { ar: string; en: string }; description: { ar: string; en: string }; noindex: boolean };
};

const targets: SeedTarget[] = [
  {
    systemKey: "home",
    slug: "home",
    title: L("home.hero.title1"),
    blocks: buildHomeBlocks(),
    seo: {
      title: L("meta.home.title"),
      description: L("meta.home.description"),
      noindex: false,
    },
  },
  {
    systemKey: "privacy",
    slug: "privacy",
    title: L("meta.privacy.title"),
    blocks: buildLegalBlocks("privacy"),
    seo: { title: L("meta.privacy.title"), description: L("meta.privacy.description"), noindex: true },
  },
  {
    systemKey: "terms",
    slug: "terms",
    title: L("meta.terms.title"),
    blocks: buildLegalBlocks("terms"),
    seo: { title: L("meta.terms.title"), description: L("meta.terms.description"), noindex: true },
  },
  {
    systemKey: "about",
    slug: "about",
    title: L("about.hero.title"),
    blocks: buildAboutBlocks(),
    seo: { title: L("meta.about.title"), description: L("meta.about.description"), noindex: false },
  },
  {
    systemKey: "contact",
    slug: "contact",
    title: L("contact.hero.title"),
    blocks: buildContactBlocks(),
    seo: { title: L("meta.contact.title"), description: L("meta.contact.description"), noindex: false },
  },
  {
    systemKey: "start-a-project",
    slug: "start-a-project",
    title: L("start.hero.title"),
    blocks: buildStartBlocks(),
    seo: { title: L("meta.start.title"), description: L("meta.start.description"), noindex: false },
  },
];

/**
 * Seeds ONE system page: Arabic pass (creates every row id), then the English pass that re-uses
 * those ids. Idempotent: an existing page is only rebuilt when FORCE_PAGE_SEED=true.
 */
async function seedTarget(target: SeedTarget): Promise<void> {
  const existing = await payload.find({
    collection: "pages",
    where: { systemKey: { equals: target.systemKey } },
    limit: 1,
    pagination: false,
    draft: true,
    locale: "ar",
    depth: 0,
    overrideAccess: true,
  });

  if (existing.docs.length > 0 && process.env.FORCE_PAGE_SEED !== "true") {
    console.log(`skip: ${target.systemKey} already exists (id ${existing.docs[0].id}) — pass FORCE_PAGE_SEED=true to rebuild.`);
    return;
  }

  let id: string | number;
  let action: string;

  if (existing.docs.length > 0) {
    id = existing.docs[0].id;
    await payload.update({
      collection: "pages",
      id,
      locale: "ar",
      draft: true,
      data: {
        title: target.title.ar,
        seo: { title: target.seo.title.ar, description: target.seo.description.ar, noindex: target.seo.noindex },
        sections: flattenLocale(target.blocks, "ar"),
      } as never,
      overrideAccess: true,
    });
    action = "rebuilt";
  } else {
    const doc = await payload.create({
      collection: "pages",
      locale: "ar",
      draft: true,
      data: {
        systemKey: target.systemKey,
        slug: target.slug,
        title: target.title.ar,
        seo: { title: target.seo.title.ar, description: target.seo.description.ar, noindex: target.seo.noindex },
        sections: flattenLocale(target.blocks, "ar"),
      } as never,
      overrideAccess: true,
    } as never);
    id = doc.id;
    action = "created";
  }

  const arDoc = (await payload.findByID({
    collection: "pages",
    id: String(id),
    locale: "ar",
    draft: true,
    depth: 0,
    overrideAccess: true,
  })) as { sections?: unknown };

  await payload.update({
    collection: "pages",
    id: String(id),
    locale: "en",
    draft: true,
    data: {
      title: target.title.en,
      seo: { title: target.seo.title.en, description: target.seo.description.en, noindex: target.seo.noindex },
      sections: flattenLocale(attachIds(arDoc.sections, target.blocks), "en"),
    } as never,
    overrideAccess: true,
  } as never);

  console.log(`${action} ${target.systemKey} page #${id}`);

  /* Read BOTH locales back — the check that would have caught the `locale:"all"` trap. */
  for (const locale of ["ar", "en"] as const) {
    const doc = (await payload.findByID({
      collection: "pages",
      id: String(id),
      locale,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })) as never as {
      title?: string;
      sections?: Array<Record<string, unknown>>;
    };
    const summary = (doc.sections ?? [])
      .map((block) => {
        const rows = ["items", "steps", "facts", "emptyPoints", "sections"].find((key) => Array.isArray(block[key]));
        return `${String(block.blockType)}${rows ? `(${(block[rows] as unknown[]).length})` : ""}`;
      })
      .join(" · ");
    console.log(`  ${locale}: title=${JSON.stringify(doc.title)}`);
    console.log(`    ${summary}`);
  }
}

for (const target of targets) {
  await seedTarget(target);
}

await payload.destroy();
