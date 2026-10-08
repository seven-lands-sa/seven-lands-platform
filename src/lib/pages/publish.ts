/**
 * THE publication validator — one authoritative gate for "can this page be published?" (§24, §25).
 *
 * Every publish path calls `validatePageForPublish` and every refusal NAMES the page, the section,
 * the field and — for media — the asset, with a concrete Arabic fix. Nothing here mutates data, and
 * nothing here silently changes media visibility: private media is reported as a blocker, never
 * flipped to public (§25).
 *
 * The validator runs per locale (§16–§18):
 *   · a locale can only publish when ITS OWN fields are complete;
 *   · a core page (system page flagged `requiresBothLocales`) needs both locales;
 *   · blocks whose `localeVisibility` excludes a language no longer count as blockers for it, and
 *     the UI states the consequence in words (no silent AR→EN inheritance anywhere).
 */
import { BLOCK_REGISTRY, collectBlockMediaPaths, type BlockKey } from "@/lib/blocks/types";
import { validateSlug } from "./slug";
import { SYSTEM_PAGES, isSystemPageKey, type SystemPageKey } from "./system-pages";

export type PublishLocale = "ar" | "en";
export const PUBLISH_LOCALES: readonly PublishLocale[] = ["ar", "en"];

export type Blocker = {
  /** `field` — empty required content; `media` — missing/private/broken asset; `structure` — cannot publish. */
  kind: "field" | "media" | "structure";
  locale: PublishLocale | "all";
  /** Index of the section in the page's array, when the blocker belongs to one. */
  sectionIndex?: number;
  /** Human label of the section, already localized for the admin. */
  sectionLabel?: string;
  /** Human label of the field, already localized for the admin. */
  fieldLabel?: string;
  /** Exact, actionable Arabic sentence shown in the publish panel. */
  message: string;
};

export type PageLike = {
  id?: string | number;
  title?: { ar?: string | null; en?: string | null } | string | null;
  systemKey?: string | null;
  slug?: string | null;
  /** Shared array today; a `{ ar: [...], en: [...] }` shape is tolerated for forward compatibility. */
  sections?: SectionLike[] | Record<string, SectionLike[]> | null;
  seo?: { title?: unknown; description?: unknown; noindex?: boolean | null } | null;
};

export type SectionLike = {
  id?: string | null;
  blockType?: string | null;
  label?: string | null;
  enabled?: boolean | null;
  localeVisibility?: "both" | "ar" | "en" | null;
  variant?: string | null;
  [key: string]: unknown;
};

export type MediaFacts = {
  id: string | number;
  filename?: string | null;
  /** Public visibility (Phase D model: public | private). */
  visibility?: "public" | "private" | null;
  /** Alt text per locale, resolved WITHOUT cross-locale fallback, exactly as the public site reads it. */
  alt?: { ar?: string | null; en?: string | null } | null;
  decorative?: boolean | null;
};

export type ValidationResult = {
  ok: boolean;
  /** Blockers for each locale, in the order they appear on the page. */
  blockers: Blocker[];
  /** Per-locale verdict, used by the admin banner and by `localeState`. */
  perLocale: Record<PublishLocale, { ok: boolean; count: number }>;
  /** True when the page is a system page that must publish in both languages. */
  requiresBothLocales: boolean;
  /** Set when the page cannot publish at all (structure/identity problem). */
  fatal?: string;
};

/**
 * A localized value as display text: `"عنوان"`, `{ ar, en }` or anything else.
 *
 * Audit summaries and refusal messages are read by humans in the admin panel, and a localized field
 * read with `locale: "all"` arrives as an object — interpolating it directly wrote «[object Object]»
 * into the audit log (found while reviewing live audit rows). Every summary in the Pages collection
 * goes through this helper now.
 */
export function localizedText(value: unknown, preferred: "ar" | "en" | null = null, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const leaf = value as Record<string, unknown>;
    const order = preferred ? [preferred, preferred === "ar" ? "en" : "ar"] : ["ar", "en"];
    for (const key of order) {
      const candidate = leaf[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
  }
  return fallback;
}

/** A section's admin label as text, whatever shape the stored value has (string or localized leaf). */
function sectionLabelText(section: SectionLike, locale: PublishLocale): string {
  const value = section.label;
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const leaf = value as unknown as Record<string, unknown>;
    const own = leaf[locale] ?? leaf.ar ?? leaf.en;
    return typeof own === "string" ? own.trim() : "";
  }
  return "";
}

const localeLabel = (locale: PublishLocale) => (locale === "ar" ? "العربية" : "الإنجليزية");

/** Normalises the stored sections shape; `locale: null` returns the shared array. */
function normalizeSections(
  value: PageLike["sections"],
  locale: PublishLocale | null,
): SectionLike[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (locale) return value[locale] ?? [];
  /* Shared-by-design: if a document ever stores per-locale arrays, validate the union. */
  return Object.values(value).flat();
}

/** Reads a dotted path (`primary.label`) from a block's data object. */
function readPath(source: Record<string, unknown> | null | undefined, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source ?? {});
}

/** True when the object is a localized leaf (`{ ar, en }`) rather than a structural group. */
const isLocalizedLeaf = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key === "ar" || key === "en");
};

/**
 * "Does this value carry content IN THIS LOCALE?" — the only question the gate may ask (§16–§18).
 * Arrays must be non-empty and every row must carry a value for the locale; a localized leaf is read
 * for that locale alone (never the other language); groups are searched deeply.
 */
function localeValuePresent(value: unknown, locale: PublishLocale): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every((row) => rowCarries(row, locale));
  if (isLocalizedLeaf(value)) {
    const own = value[locale];
    if (typeof own === "string") return own.trim().length > 0;
    return own !== null && own !== undefined && own !== "";
  }
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).some((child) => rowCarries(child, locale));
  return value !== null && value !== undefined;
}

/** Any leaf inside a row that holds a value for the locale. */
function rowCarries(node: unknown, locale: PublishLocale): boolean {
  if (typeof node === "string") return node.trim().length > 0;
  if (Array.isArray(node)) return node.some((row) => rowCarries(row, locale));
  if (isLocalizedLeaf(node)) return localeValuePresent(node, locale);
  if (node && typeof node === "object") return Object.values(node as Record<string, unknown>).some((child) => rowCarries(child, locale));
  return node !== null && node !== undefined;
}

const isBlank = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    /* A localized field read with `locale: "all"` arrives as { ar, en }. */
    const record = value as Record<string, unknown>;
    if ("ar" in record || "en" in record) return Object.values(record).every(isBlank);
    return Object.keys(record).length === 0;
  }
  return false;
};

/** Field-level labels for the messages — kept beside the paths they describe. */
const FIELD_LABELS: Record<string, string> = {
  eyebrow: "النص العلوي",
  title1: "السطر الأول من العنوان",
  title2: "السطر الثاني من العنوان",
  titleAccent: "السطر المميّز",
  title: "العنوان",
  support: "النص الداعم",
  lede: "المقدمة",
  heading: "عنوان القسم",
  intro: "المقدمة",
  note: "الملاحظة",
  "primary.label": "نص الزر الأساسي",
  "secondary.label": "نص الزر الثانوي",
  "cta.label": "نص زر الاتجاهات",
};

const fieldLabel = (path: string) => FIELD_LABELS[path] ?? path;

/**
 * Validates one page for publication.
 *
 * @param page     the draft document, read with `locale: "all"` for localized values
 * @param mediaById resolved media facts for every referenced asset (Phase D read model)
 */
export function validatePageForPublish(
  page: PageLike,
  mediaById: Map<string, MediaFacts>,
): ValidationResult {
  const blockers: Blocker[] = [];
  const perLocale: ValidationResult["perLocale"] = {
    ar: { ok: true, count: 0 },
    en: { ok: true, count: 0 },
  };

  const systemKey = page.systemKey && isSystemPageKey(page.systemKey) ? (page.systemKey as SystemPageKey) : null;
  const requiresBothLocales = systemKey ? SYSTEM_PAGES[systemKey].requiresBothLocales : false;

  const add = (blocker: Blocker) => {
    blockers.push(blocker);
    if (blocker.locale !== "all") perLocale[blocker.locale].count += 1;
  };

  /* ── structure ─────────────────────────────────────────────────────────────────────────────── */
  const sections = normalizeSections(page.sections, null).filter((section) => section?.blockType);
  if (sections.length === 0) {
    return {
      ok: false,
      blockers: [
        {
          kind: "structure",
          locale: "all",
          message: "الصفحة لا تحتوي أي قسم. أضف قسمًا واحدًا على الأقل ثم أعد المحاولة.",
        },
      ],
      perLocale: { ar: { ok: false, count: 1 }, en: { ok: false, count: 1 } },
      requiresBothLocales,
      fatal: "empty_page",
    };
  }

  /* ── per locale, per section ───────────────────────────────────────────────────────────────── */
  for (const locale of PUBLISH_LOCALES) {
    sections.forEach((section, index) => {
      const key = section.blockType as BlockKey;
      const meta = BLOCK_REGISTRY[key];
      if (!meta) {
        add({
          kind: "structure",
          locale,
          sectionIndex: index,
          message: `القسم رقم ${index + 1} نوعه غير معروف — احذفه أو استبدله ثم أعد المحاولة.`,
        });
        return;
      }

      if (!meta.rendered) {
        add({
          kind: "structure",
          locale,
          sectionIndex: index,
          message: `«${sectionLabelText(section, locale) || meta.label.ar}» — هذا النوع من الأقسام غير مدعوم في هذا الإصدار، فلا يمكن نشره.`,
        });
        return;
      }

      const visibility = section.localeVisibility ?? "both";
      const blockedByLanguage = visibility !== "both" && visibility !== locale;
      const sectionTitle = sectionLabelText(section, locale) || `${meta.label.ar} (قسم ${index + 1})`;

      /* Sections excluded from this language do not block it — but the reason is stated in words
         in the publish panel, so nobody assumes the content is inherited. */
      if (blockedByLanguage) return;

      /* Media that this release can store but not display (§27/§83): refused loudly instead of
         publishing an image the visitor will never see. */
      if (meta.rendersMedia === false) {
        const carried = meta.mediaPaths.filter((path) => !isBlank(readPath(section, path)));
        if (carried.length > 0) {
          add({
            kind: "structure",
            locale,
            sectionIndex: index,
            sectionLabel: sectionTitle,
            fieldLabel: carried.join(", "),
            message: `«${sectionTitle}» — الصورة مرفقة، لكن عرض الصورة في هذا القسم يصل مع تحديث تصميم لاحق. أزل الصورة أو احفظ الصفحة كمسودة.`,
          });
        }
      }

      /* Required content, read from THIS locale's own values only. */
      for (const path of meta.required) {
        const value = readPath(section, path);
        if (!localeValuePresent(value, locale)) {
          add({
            kind: "field",
            locale,
            sectionIndex: index,
            sectionLabel: sectionTitle,
            fieldLabel: fieldLabel(path),
            message: `«${sectionTitle}» — ${fieldLabel(path)} فارغ في النسخة ${localeLabel(locale)}. لن تُنشر الصفحة وفيها نص أساسي ناقص.`,
          });
        }
      }

      /* Media references: public + alt-complete for the locales the block targets. */
      for (const path of meta.mediaPaths) {
        const value = readPath(section, path);
        if (isBlank(value)) continue;
        const id = typeof value === "object" && value !== null ? (value as { id?: string | number }).id : value;
        if (id === null || id === undefined) continue;

        const facts = mediaById.get(String(id));
        if (!facts) {
          add({
            kind: "media",
            locale,
            sectionIndex: index,
            sectionLabel: sectionTitle,
            message: `«${sectionTitle}» — الصورة المرتبطة بهذا القسم غير موجودة أو حُذفت. اختر صورة أخرى.`,
          });
          continue;
        }

        if (facts.visibility !== "public") {
          add({
            kind: "media",
            locale,
            sectionIndex: index,
            sectionLabel: sectionTitle,
            message: `«${sectionTitle}» — الملف «${facts.filename ?? facts.id}» خاص. لن نغيّر ظهوره تلقائيًا: اجعله عامًا من مكتبة الوسائط ثم انشر.`,
          });
        }

        if (!facts.decorative) {
          if (isBlank(facts.alt?.[locale])) {
            add({
              kind: "media",
              locale,
              sectionIndex: index,
              sectionLabel: sectionTitle,
              message: `«${sectionTitle}» — النص البديل للملف «${facts.filename ?? facts.id}» ناقص بالـ${localeLabel(locale)}.`,
            });
          }
        }
      }
    });

    /* Page-level identity: title is the label everyone navigates by. */
    const title = typeof page.title === "string" ? page.title : page.title?.[locale];
    if (isBlank(title)) {
      add({
        kind: "field",
        locale,
        fieldLabel: "عنوان الصفحة",
        message: `عنوان الصفحة فارغ في النسخة ${localeLabel(locale)} — العنوان الداخلي ضروري للإدارة والروابط.`,
      });
    }
  }

  /* ── custom pages (§4/§5/§38/§39/§43) ────────────────────────────────────────────────────────
     A custom page is served by `/[locale]/[slug]`, which shipped with this phase — so publishing
     one is now a real publication and not a link to a 404. Two things are still enforced:

       · the slug must be a valid, non-reserved segment (`validateSlug`) — a page may never take
         over `/about`, `/preview`, `/api` or any other route the application owns;
       · a custom page is served PER LOCALE: Arabic may be published while English stays a draft,
         and the unpublished locale then answers a real 404 rather than falling back to the other
         language (§15/§16 — a custom page has no static baseline to fall back to). */

  if (!systemKey) {
    const slugCheck = validateSlug(page.slug);
    if (!slugCheck.ok) {
      for (const locale of PUBLISH_LOCALES) {
        add({ kind: "structure", locale, message: slugCheck.reason.ar });
      }
    }
  }

  /* ── both-locales rule for core pages (§16) ────────────────────────────────────────────────── */
  if (requiresBothLocales) {
    for (const locale of PUBLISH_LOCALES) {
      if (perLocale[locale].count > 0) {
        add({
          kind: "structure",
          locale,
          message: `هذه صفحة أساسية: لا يمكن نشر ${localeLabel(locale)} وحدها. أكمل المتطلبات أعلاه ثم انشر النسختين معًا.`,
        });
      }
    }
  }

  for (const locale of PUBLISH_LOCALES) perLocale[locale].ok = perLocale[locale].count === 0;

  return {
    ok: blockers.length === 0,
    blockers,
    perLocale,
    requiresBothLocales,
  };
}

/** Media ids referenced by a page's sections, in document order (§27, one contract). */
export function collectPageMediaIds(page: PageLike): (string | number)[] {
  const ids: (string | number)[] = [];
  const sections = normalizeSections(page.sections, null).filter((section) => section?.blockType);
  const paths = collectBlockMediaPaths(sections as { blockType?: string | null }[]);
  /* The helper returns document-level paths (`sections.0.media`), so the lookup must run against
     the whole page — reading them from the array itself silently returned nothing, which would have
     left the media gate passing every asset (found by the Phase E suite). */
  for (const path of paths) {
    const value = readPath(page as unknown as Record<string, unknown>, path);
    const id = typeof value === "object" && value !== null ? (value as { id?: string | number }).id : value;
    if (id !== null && id !== undefined && id !== "") ids.push(id as string | number);
  }
  return ids;
}

/** Converts a validation result into the short Arabic reason stored in the audit log. */
export function blockerSummary(result: ValidationResult): string {
  if (result.ok) return "كل المتطلبات مكتملة.";
  const first = result.blockers[0];
  const extra = result.blockers.length - 1;
  return extra > 0 ? `${first.message} (+${extra} ملاحظة أخرى)` : first.message;
}
