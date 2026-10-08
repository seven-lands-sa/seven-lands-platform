/**
 * PAGES — the page composition model (§3–§8, §15–§18, §23–§25, §28, §37, §39, §55).
 *
 * One document per logical page, localized fields inside it — never a duplicate AR/EN document.
 * The public site reads through `src/lib/pages/adapter.ts`; the admin writes through this
 * collection. Between the two sits exactly one publication validator (`src/lib/pages/publish.ts`),
 * which is also what the publish endpoints call, so the API and the UI can never disagree.
 *
 * IDENTITY
 *   systemKey  the six routes that already exist (immutable, unique). Home, about, contact,
 *              start-a-project, privacy, terms. Slug for these is fixed by the router table.
 *   slug       custom pages only. Validated by `validateSlug` (lowercase, hyphenated, not reserved).
 *
 * PUBLICATION MODEL
 *   `_status`      Payload's document-level draft/publish flag. The main row holds the published
 *                  version; `_pages_v` holds history and the working draft.
 *   localeState    per-locale publication state, written only by the publish endpoints after the
 *                  validation gate passes. A locale that is not `published` is either served from
 *                  the static baseline (system pages) or 404s (custom pages) — never half-served.
 *
 * Every localized read and write in the endpoints names its locale explicitly (Phase E §1).
 */
import { addDataAndFileToRequest, type CollectionConfig, type Payload, type PayloadRequest } from "payload";

import { permissionsFor, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { getPreviewPage } from "@/lib/pages/adapter";
import { PAGE_BLOCK_DEFINITIONS } from "@/lib/blocks/schema";
import { collectBlockCtaPaths } from "@/lib/blocks/types";
import { invalidateTags } from "@/lib/content/invalidate";
import { pageSystemTag, pageTag, PAGES_LIST_TAG } from "@/lib/content/tags";
import { publicError } from "@/lib/errors";
import { flattenLocaleValue, mergeLocaleValues } from "@/lib/pages/locale-merge";
import { validateCta } from "@/lib/pages/links";
import { resolveMediaFacts } from "@/lib/pages/media";
import {
  PUBLISH_LOCALES,
  blockerSummary,
  localizedText,
  collectPageMediaIds,
  validatePageForPublish,
  type PageLike,
  type PublishLocale,
} from "@/lib/pages/publish";
import { validateSlug } from "@/lib/pages/slug";
import { SYSTEM_PAGES, SYSTEM_PAGE_KEYS, isSystemPageKey } from "@/lib/pages/system-pages";

const systemPageOptions = SYSTEM_PAGE_KEYS.map((key) => ({
  value: key,
  label: { ar: SYSTEM_PAGES[key].label.ar, en: SYSTEM_PAGES[key].label.en },
}));

type LocaleState = {
  ar?: { state?: string | null; at?: string | null } | null;
  en?: { state?: string | null; at?: string | null } | null;
};

const readLocaleState = (doc: { localeState?: unknown }): LocaleState => {
  const state = doc.localeState;
  return state && typeof state === "object" ? (state as LocaleState) : {};
};

const isPublished = (state: LocaleState, locale: PublishLocale): boolean =>
  state[locale]?.state === "published";

/** Runs the publication validator against a page document read with `locale: "all"`. */
export async function evaluatePage(payload: Payload, doc: PageLike) {
  const media = await resolveMediaFacts(payload, collectPageMediaIds(doc));
  return validatePageForPublish(doc, media);
}

const invalidatePage = (doc: { id?: string | number; systemKey?: string | null }) => {
  const tags: string[] = [PAGES_LIST_TAG];
  if (doc.id !== undefined) tags.push(pageTag(doc.id));
  if (doc.systemKey) tags.push(pageSystemTag(doc.systemKey));
  invalidateTags(tags);
};

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "صفحة", plural: "الصفحات" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "systemKey", "slug", "_status", "updatedAt"],
    group: "المحتوى",
    description:
      "أقسام الصفحات ونصوصها بالعربية والإنجليزية. المسودة لا تظهر للزائر أبدًا، والنشر يمرّ من فحص مكتمل قبل أن يظهر.",
    /**
     * DRAFT PREVIEW (§20/§21) — the "معاينة" button in the edit view.
     *
     * It opens `/{locale}/preview?path=…` on the public site, which renders the newest DRAFT for
     * this editor's session only. No preview token is placed in the URL or the markup: the preview
     * surface authenticates with the admin session cookie the browser already holds, and the proxy
     * answers a real 404 to anyone without it. The path comes from the document's own identity —
     * the locked route for a system page, the validated slug for a custom page — never from a
     * field an editor can point somewhere else.
     */
    preview: (doc, { locale }) => {
      const key = typeof doc?.systemKey === "string" ? doc.systemKey : null;
      const path = isSystemPageKey(key)
        ? SYSTEM_PAGES[key].path
        : typeof doc?.slug === "string" && doc.slug.trim()
          ? `/${doc.slug.trim()}`
          : null;
      if (!path) return null;
      const origin = process.env.RUNTIME_ORIGIN || process.env.SITE_CANONICAL_URL || "";
      const target = locale === "en" ? "en" : "ar";
      return `${origin}/${target}/preview?path=${encodeURIComponent(path)}`;
    },
  },
  versions: {
    drafts: {
      autosave: false, // §14 — autosave stays off; a save is a deliberate act
    },
    maxPerDoc: 25,
  },
  access: {
    read: requirePermission("pages.read"),
    create: requirePermission("pages.create"),
    update: requirePermission("pages.update"),
    delete: requirePermission("pages.delete"),
    readVersions: requirePermission("pages.read"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: { ar: "عنوان الصفحة (داخلي)", en: "Page title (internal)" },
      localized: true,
      required: true,
      admin: {
        description: {
          ar: "هذا العنوان تراه أنت في القوائم والروابط — لا يظهر للزائر إلا إذا أدرجته في قسم.",
          en: "You see this title in lists and links — visitors only see it if a section shows it.",
        },
      },
    },
    {
      name: "systemKey",
      type: "select",
      label: { ar: "صفحة أساسية", en: "System page" },
      options: systemPageOptions,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: {
          ar: "معرّف ثابت للصفحات الأساسية — لا يُعدّل ولا يُحذف.",
          en: "A fixed identity for core pages — not editable or deletable.",
        },
      },
    },
    {
      name: "slug",
      type: "text",
      label: { ar: "الرابط", en: "Slug" },
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: {
          ar: "الجزء الأخير من الرابط الإنجليزي للصفحات الجديدة، مثل brand-refresh. لا يمكن تغييره بعد النشر.",
          en: "The final path segment for new pages, e.g. brand-refresh. Cannot change after publishing.",
        },
      },
      validate: (value: unknown, { data }: { data?: Record<string, unknown> }) => {
        const systemKey = data?.systemKey;
        if (systemKey && isSystemPageKey(systemKey)) return true; // fixed by the router table
        const check = validateSlug(value);
        return check.ok ? true : check.reason.ar;
      },
    },
    {
      name: "sections",
      type: "blocks",
      label: { ar: "أقسام الصفحة", en: "Page sections" },
      labels: { singular: "قسم", plural: "أقسام" },
      /*
       * ONE composition for both languages (§7, §15–§18): order, visibility and approved variant are
       * decided once, while every text inside a block is localized. An editor never has to rebuild
       * the page in the second language — and `localeVisibility` keeps its real meaning: a block can
       * be intentionally Arabic-only or English-only.
       */
      blocks: PAGE_BLOCK_DEFINITIONS,
      admin: {
        description: {
          ar: "رتّب الأقسام كما تظهر للزائر. كل قسم يحمل نصّه بالعربية والإنجليزية معًا.",
          en: "Order sections as visitors see them. Each block carries both Arabic and English text.",
        },
      },
    },
    {
      name: "seo",
      type: "group",
      label: { ar: "بيانات الظهور", en: "SEO" },
      localized: true,
      admin: {
        description: {
          ar: "حدود هذا القسم §37: العنوان والوصف وصورة المشاركة ومنع الفهرسة. الرابط الأساسي يُشتق من المسار الحقيقي.",
          en: "§37 scope: title, description, share image, noindex. The canonical URL is derived from the real route.",
        },
      },
      fields: [
        { name: "title", type: "text", label: { ar: "عنوان الظهور", en: "SEO title" } },
        { name: "description", type: "textarea", label: { ar: "وصف الظهور", en: "Meta description" } },
        { name: "ogImage", type: "upload", relationTo: "media", label: { ar: "صورة المشاركة", en: "Share image" } },
        { name: "noindex", type: "checkbox", label: { ar: "منع الفهرسة", en: "noindex" }, defaultValue: false },
      ],
    },
    {
      name: "localeState",
      type: "group",
      label: { ar: "حالة النشر لكل لغة", en: "Publication state per locale" },
      admin: {
        position: "sidebar",
        readOnly: true,
        description: {
          ar: "تُدار من لوحة النشر بعد اجتياز الفحص — لا تُحرّر يدويًا.",
          en: "Managed by the publish panel after the gate passes — never edited by hand.",
        },
      },
      fields: (["ar", "en"] as const).map((locale) => ({
        name: locale,
        type: "group",
        label: locale === "ar" ? "العربية" : "الإنجليزية",
        fields: [
          {
            name: "state",
            type: "select",
            label: { ar: "الحالة", en: "State" },
            defaultValue: "draft",
            options: [
              { value: "draft", label: { ar: "مسودة", en: "Draft" } },
              { value: "published", label: { ar: "منشورة", en: "Published" } },
            ],
          },
          { name: "at", type: "date", label: { ar: "تاريخ النشر", en: "Published at" } },
        ],
      })),
    },
  ],
  hooks: {
    /**
     * Write-time safety (§28, §37, §39): nothing unsafe or ambiguous may ever reach the database,
     * whichever door the write came through — admin UI, REST or a script.
     */
    beforeValidate: [
      async ({ data, originalDoc, operation }) => {
        if (!data) return data;

        /* systemKey is an identity, not a preference. */
        const originalKey = (originalDoc as { systemKey?: string | null } | undefined)?.systemKey ?? null;
        if (operation === "update" && originalKey && data.systemKey && data.systemKey !== originalKey) {
          throw publicError("لا يمكن تغيير هوية صفحة أساسية.", 400);
        }
        if (operation === "update" && !originalKey && data.systemKey) {
          throw publicError("لا يمكن تحويل صفحة مخصّصة إلى صفحة أساسية.", 400);
        }

        /* System pages take their slug from the router table; custom pages pass `validateSlug`. */
        if (isSystemPageKey(data.systemKey)) {
          data.slug = data.systemKey;
        }

        /* §39 — a published custom page cannot change its public address without redirects. */
        const publishedBefore = Object.values(readLocaleState(originalDoc ?? {})).some(
          (entry) => entry?.state === "published",
        );
        const slugBefore = (originalDoc as { slug?: string | null } | undefined)?.slug ?? null;
        if (operation === "update" && !data.systemKey && publishedBefore && slugBefore && data.slug && data.slug !== slugBefore) {
          throw publicError(
            "لا يمكن تغيير رابط صفحة منشورة قبل توفّر إدارة التحويلات (Redirects). ألغِ النشر أولًا إن كان التغيير ضروريًا.",
            400,
          );
        }

        /* §28 — reject unsafe CTA destinations at the door. */
        const sections = Array.isArray(data.sections) ? (data.sections as Array<Record<string, unknown>>) : [];
        const ctaPaths = collectBlockCtaPaths(sections as { blockType?: string | null }[]);
        for (const path of ctaPaths) {
          const [indexRaw, group] = path.split(".").slice(1, 3);
          const index = Number(indexRaw);
          const section = sections[index];
          if (!section) continue;
          const blockLabel = typeof section.label === "string" && section.label.trim() ? section.label : `قسم ${index + 1}`;
          const problem = validateCta(section[group] as never, `${blockLabel} → ${group}`);
          if (problem) throw publicError(problem, 400);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        invalidatePage(doc as { id?: string | number; systemKey?: string | null });

        // Auto-create 301 redirect if an existing custom page slug changes
        if (operation === "update" && previousDoc?.slug && doc.slug && previousDoc.slug !== doc.slug && !doc.systemKey) {
          try {
            const oldPath = `/${previousDoc.slug}`;
            const newPath = `/${doc.slug}`;
            await req.payload.create({
              collection: "redirects",
              data: {
                from: oldPath,
                to: newPath,
                statusCode: "301",
                enabled: true,
                internalNotes: `Auto-created upon renaming page ${doc.id} from ${previousDoc.slug} to ${doc.slug}`,
              },
              overrideAccess: true,
            });
          } catch {
            // Ignore if redirect already exists
          }
        }

        /* Publish/unpublish write their own audit entries with the locale detail; a plain save is
           recorded as an edit so the log answers "who touched this page and when". */
        if (req?.context?.pageAudit) return doc;

        const title = localizedText((doc as { title?: unknown }).title);
        const action = operation === "create" ? "page_created" : "page_updated";
        await recordAuditEvent(req.payload, {
          action,
          summary: operation === "create" ? `إنشاء صفحة «${title || "بدون عنوان"}»` : `تعديل صفحة «${title || "بدون عنوان"}»`,
          resourceType: "pages",
          resourceId: (doc as { id?: string | number }).id ?? null,
          req,
          detached: true,
        });
        return doc;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: "pages",
          id,
          depth: 0,
          locale: "ar",
          draft: false,
          overrideAccess: true,
        });
        if (doc?.systemKey) {
          await recordAuditEvent(req.payload, {
            action: "page_archived",
            summary: `محاولة حذف صفحة أساسية «${localizedText(doc.title, null, String(doc.systemKey ?? ""))}» — مرفوضة`,
            resourceType: "pages",
            resourceId: id,
            req,
            detached: true,
          });
          throw publicError("لا يمكن حذف صفحة أساسية. أوقف نشر إحدى اللغتين أو أخفِ الأقسام بدلًا من الحذف.", 400);
        }
        return true;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        invalidatePage(doc as { id?: string | number; systemKey?: string | null });
        await recordAuditEvent(req.payload, {
          action: "page_archived",
          summary: `حذف صفحة «${localizedText((doc as { title?: unknown }).title, null, String((doc as { slug?: string }).slug ?? ""))}»`,
          resourceType: "pages",
          resourceId: (doc as { id?: string | number }).id ?? null,
          req,
          detached: true,
        });
      },
    ],
  },
  endpoints: [
    /**
     * GET /api/pages/:id/publish-status → everything the publish panel shows: per-locale state,
     * the exact blockers with their section/field/asset names, and whether THIS user may publish.
     */
    {
      path: "/:id/publish-status",
      method: "get",
      handler: async (req: PayloadRequest) => {
        const id = req.routeParams?.id as string | number;
        const doc = await req.payload.findByID({
          collection: "pages",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        });
        if (!doc) return Response.json({ errors: [{ message: "الصفحة غير موجودة." }] }, { status: 404 });

        const result = await evaluatePage(req.payload, doc as PageLike);
        const permissions = await permissionsFor(req);
        const state = readLocaleState(doc as { localeState?: unknown });

        return Response.json({
          id: doc.id,
          systemKey: doc.systemKey ?? null,
          slug: doc.slug ?? null,
          requiresBothLocales: result.requiresBothLocales,
          perLocale: result.perLocale,
          blockers: result.blockers,
          localeState: {
            ar: { state: state.ar?.state ?? "draft", at: state.ar?.at ?? null },
            en: { state: state.en?.state ?? "draft", at: state.en?.at ?? null },
          },
          /* Same question the adapter asks before serving a locale, answered once, from one place. */
          published: { ar: isPublished(state, "ar"), en: isPublished(state, "en") },
          canPublish: permissions.has("pages.publish"),
          canUpdate: permissions.has("pages.update"),
        });
      },
    },
    /**
     * POST /api/pages/:id/publish { locales: ["ar" | "en"] } → the only door to the public site.
     *
     * The write for a locale touches ONLY that locale's rows, so publishing Arabic can never blank,
     * overwrite or expose the English document — and the other language keeps exactly what was
     * already live (§15–§18, the no-silent-fallback rule).
     */
    {
      path: "/:id/publish",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("pages.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية نشر الصفحات." }] }, { status: 403 });
        }

        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const requested = (body.locales ?? []).filter((value): value is PublishLocale =>
          (PUBLISH_LOCALES as readonly string[]).includes(value),
        );
        if (requested.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة المطلوب نشرها." }] }, { status: 400 });
        }

        const draft = await req.payload.findByID({
          collection: "pages",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        });
        if (!draft) return Response.json({ errors: [{ message: "الصفحة غير موجودة." }] }, { status: 404 });

        const result = await evaluatePage(req.payload, draft as PageLike);
        const targets = result.requiresBothLocales ? [...PUBLISH_LOCALES] : requested;
        const blocked = targets.filter((locale) => !result.perLocale[locale].ok);
        if (blocked.length > 0) {
          const blockers = result.blockers.filter((blocker) => blocked.includes(blocker.locale as PublishLocale));
          /* A refused publish is an event worth auditing: the summary carries the FIRST named
             reason (section/field/asset), never a generic "validation failed". */
          await recordAuditEvent(req.payload, {
            action: "page_updated",
            summary: `محاولة نشر مرفوضة لصفحة «${localizedText((draft as { title?: unknown }).title, null, "بدون عنوان")}» — ${blockerSummary(result)}`,
            resourceType: "pages",
            resourceId: id,
            req,
            details: { blocked, refused: true },
            detached: true,
          });
          return Response.json(
            {
              errors: [{ message: "لم يجتز الفحص — لم يُنشر أي شيء." }],
              blocked,
              blockers: blockers.length ? blockers : result.blockers,
            },
            { status: 400 },
          );
        }

        const state = readLocaleState(draft as { localeState?: unknown });
        const now = new Date().toISOString();

        /* Publish each target locale with its OWN values, carrying the row ids read from the draft.
           A locale write without ids is the documented way to wipe the sibling language; a write
           with a `{ ar, en }` object stores the object itself (both measured on this database).
           Non-target locales keep exactly what is already published. */
        const live = await req.payload.findByID({
          collection: "pages",
          id,
          draft: false,
          locale: "all" as never,
          depth: 0,
          overrideAccess: true,
        });

        const merged = mergeLocaleValues(
          draft as { title?: unknown; sections?: unknown; seo?: unknown },
          live as { title?: unknown; sections?: unknown; seo?: unknown } | null,
          targets,
        );

        const next: LocaleState = { ...state };
        for (const target of targets) next[target] = { state: "published", at: now };

        for (let index = 0; index < targets.length; index += 1) {
          const locale = targets[index];
          const last = index === targets.length - 1;
          req.context.pageAudit = true;
          await req.payload.update({
            collection: "pages",
            id,
            locale,
            draft: false,
            data: {
              title: flattenLocaleValue(merged.title, locale),
              sections: flattenLocaleValue(merged.sections, locale),
              seo: flattenLocaleValue(merged.seo, locale),
              ...(last ? { localeState: next } : {}),
            } as never,
            overrideAccess: true,
            req,
            context: { ...req.context, pageAudit: true },
          });
        }

        invalidatePage(draft as { id?: string | number; systemKey?: string | null });
        await recordAuditEvent(req.payload, {
          action: "page_published",
          summary: `نشر صفحة «${localizedText((draft as { title?: unknown }).title, null, "بدون عنوان")}» — ${targets
            .map((locale) => (locale === "ar" ? "العربية" : "الإنجليزية"))
            .join(" و")}`,
          resourceType: "pages",
          resourceId: id,
          req,
          details: { locales: targets },
          detached: true,
        });

        return Response.json({ ok: true, published: targets, at: now });
      },
    },
    /**
     * GET /api/pages/preview-data?path=/about&locale=ar
     *
     * The draft view model for the preview surface (§20/§21). It exists so the preview page can
     * read drafts through a `cache: "no-store"` fetch: under `cacheComponents` any read that Next
     * cannot recognise as a dynamic data access is baked into the prerendered shell — measured on
     * this route, where the preview kept serving the draft as it looked at build time.
     *
     * Authorization is enforced here as well as on the page (`pages.read`), and the response is
     * never cached by anything: private, no-store, and it must never be reachable anonymously.
     */
    {
      path: "/preview-data",
      method: "get",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("pages.read")) {
          return Response.json({ errors: [{ message: "غير مصرح." }] }, { status: 403 });
        }
        const url = new URL(req.url ?? "http://localhost", "http://localhost");
        const path = url.searchParams.get("path") ?? "/";
        const locale = url.searchParams.get("locale") ?? "ar";
        if (locale !== "ar" && locale !== "en") {
          return Response.json({ errors: [{ message: "لغة غير مدعومة." }] }, { status: 400 });
        }
        const page = await getPreviewPage(path, locale);
        if (!page) return Response.json({ errors: [{ message: "لا توجد صفحة بهذا المسار." }] }, { status: 404 });

        return Response.json(
          { ...page, pagePaths: Object.fromEntries(page.pagePaths) },
          { headers: { "cache-control": "no-store, private, max-age=0" } },
        );
      },
    },
    /**
     * GET /api/pages/public-slugs → which custom slugs are published, per locale.
     *
     * This is the proxy's read-only source of truth for one question: "does /{locale}/{slug} exist?"
     * It has to be answered BEFORE the response is flushed, because a path that is not published
     * must answer a real 404 status — a `notFound()` inside a streaming render can only answer 200
     * with a not-found body on this stack (measured). The response is deliberately public and
     * contains nothing but the slugs that are already published per locale: the same information
     * `sitemap.xml` already carries. No ids, no titles, no drafts, no locale state, never cached.
     */
    {
      path: "/public-slugs",
      method: "get",
      handler: async (req: PayloadRequest) => {
        const out: Record<string, string[]> = {};
        for (const locale of PUBLISH_LOCALES) {
          const found = await req.payload.find({
            collection: "pages",
            where: { systemKey: { exists: false } },
            limit: 0,
            pagination: false,
            depth: 0,
            locale,
            draft: false,
            overrideAccess: true,
          });
          out[locale] = (found.docs as { slug?: string | null; localeState?: Record<string, { state?: string | null }> }[])
            .filter((doc) => doc.localeState?.[locale]?.state === "published")
            .map((doc) => doc.slug ?? "")
            .filter(Boolean);
        }
        return Response.json(out, { headers: { "cache-control": "no-store, private, max-age=0" } });
      },
    },
    /**
     * POST /api/pages/:id/restore { versionId } → bring an earlier revision back.
     *
     * Payload ships revision restore in the admin panel and the Local API only (there is no REST
     * restore route — verified: POST /api/pages/versions/:id/restore answers "Route not found"), so
     * this endpoint exposes the same operation with the guarantees the rest of the system has:
     * a permission check, an explicit parent check (you cannot restore another page's revision into
     * this one), cache-tag invalidation, and an audit event.
     */
    {
      path: "/:id/restore",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("pages.update")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية تعديل الصفحات." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const versionId = String((req.data as { versionId?: unknown } | undefined)?.versionId ?? "");
        if (!versionId) {
          return Response.json({ errors: [{ message: "حدّد الإصدار المطلوب استعادته." }] }, { status: 400 });
        }

        const version = (await req.payload.findVersionByID({
          collection: "pages",
          id: versionId,
          depth: 0,
          overrideAccess: true,
        })) as { parent?: unknown; version?: { title?: unknown } } | null;
        if (!version) {
          return Response.json({ errors: [{ message: "الإصدار غير موجود." }] }, { status: 404 });
        }
        if (String(version.parent ?? "") !== String(id)) {
          return Response.json({ errors: [{ message: "هذا الإصدار لا يخص هذه الصفحة." }] }, { status: 400 });
        }

        const restored = await req.payload.restoreVersion({
          collection: "pages",
          id: versionId,
          depth: 0,
          overrideAccess: true,
          req,
          context: { ...req.context, pageAudit: true },
        });

        invalidatePage(restored as { id?: string | number; systemKey?: string | null });
        await recordAuditEvent(req.payload, {
          action: "page_restored",
          summary: `استعادة إصدار سابق لصفحة «${localizedText(version.version?.title, null, "بدون عنوان")}»`,
          resourceType: "pages",
          resourceId: id,
          req,
          details: { versionId },
          detached: true,
        });

        return Response.json({ ok: true, restoredVersion: versionId });
      },
    },
    /**
     * POST /api/pages/:id/unpublish { locales } → stop serving a language.
     *
     * The published content stays in the main row (so re-publishing is instant and lossless); only
     * the locale state changes. Public effect: a system page falls back to the static baseline, a
     * custom page 404s — never an empty or half-translated page.
     */
    {
      path: "/:id/unpublish",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("pages.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية إدارة نشر الصفحات." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const targets = (body.locales ?? []).filter((value): value is PublishLocale =>
          (PUBLISH_LOCALES as readonly string[]).includes(value),
        );
        if (targets.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة المطلوب إلغاء نشرها." }] }, { status: 400 });
        }

        const current = await req.payload.findByID({
          collection: "pages",
          id,
          draft: false,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        });
        if (!current) return Response.json({ errors: [{ message: "الصفحة غير موجودة." }] }, { status: 404 });

        const state = readLocaleState(current as { localeState?: unknown });
        const next: LocaleState = { ...state };
        for (const locale of targets) next[locale] = { state: "draft", at: null };

        await req.payload.update({
          collection: "pages",
          id,
          locale: "ar", // locale-irrelevant for this field, but named on purpose (§1)
          draft: false,
          data: { localeState: next } as never,
          overrideAccess: true,
          req,
          context: { ...req.context, pageAudit: true },
        });

        invalidatePage(current as { id?: string | number; systemKey?: string | null });
        await recordAuditEvent(req.payload, {
          action: "page_unpublished",
          summary: `إلغاء نشر صفحة «${localizedText((current as { title?: unknown }).title, null, "بدون عنوان")}» — ${targets
            .map((locale) => (locale === "ar" ? "العربية" : "الإنجليزية"))
            .join(" و")}`,
          resourceType: "pages",
          resourceId: id,
          req,
          details: { locales: targets },
          detached: true,
        });

        return Response.json({ ok: true, unpublished: targets });
      },
    },
  ],
};

