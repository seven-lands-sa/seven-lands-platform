/**
 * SERVICES — the seven capabilities as editable domain documents (Phase F, §10–§12).
 *
 * IDENTITY
 *   `landKey`  one of the seven immutable keys. It decides the public route (`/services/{key}`), the
 *              order number and the shipped fallback. It can never be edited, and a service can never
 *              be created with a key that does not already exist on the public site — which is what
 *              makes "the migration cannot break an indexed URL" a structural fact rather than a
 *              promise.
 *   `glyph`    one of the seven glyphs the design system ships (§12 — a safe registry, not a free text
 *              field, and never an arbitrary icon).
 *   `order`    the display order of the seven cards; the route never changes with it.
 *   `enabled`  whether the capability is offered. Disabling a PUBLISHED capability is refused: it
 *              would turn an indexed URL into a 404 with no redirect (the Redirect Manager arrives in
 *              Phase G — §39 policy).
 *
 * PUBLICATION
 *   Payload drafts + per-locale `localeState`, written only by the gated endpoints below. A locale
 *   that is not published falls back to the shipped static content for THAT locale only (§15/§55).
 *
 * Every localized read and write names its locale (§1).
 */
import { addDataAndFileToRequest, type CollectionConfig, type PayloadRequest } from "payload";

import { permissionsFor, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { invalidateTags } from "@/lib/content/invalidate";
import { servicesTag, serviceTag } from "@/lib/content/tags";
import { publicError } from "@/lib/errors";
import { flattenLocaleValue } from "@/lib/pages/locale-merge";
import { resolveMediaFacts } from "@/lib/pages/media";
import {
  SERVICE_GLYPHS,
  SERVICE_KEYS,
  SERVICE_LOCALES,
  serviceNumber,
  servicePath,
  type ServiceLocale,
} from "@/lib/services/model";
import {
  collectServiceMediaIds,
  serviceBlockerSummary,
  validateServiceForPublish,
  type ServiceLike,
} from "@/lib/services/publish";

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "مجال", plural: "المجالات" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["number", "title", "landKey", "enabled", "_status", "order"],
    group: "المحتوى",
    description:
      "المجالات السبعة. المحتوى يُعدّل هنا، والمسار والترتيب محسومان: كل مجال يحتفظ برابطه الحالي.",
    /**
     * DRAFT PREVIEW: same surface as pages, resolved from the immutable key, never a stored path.
     */
    preview: (doc, { locale }) => {
      const key = typeof doc?.landKey === "string" ? doc.landKey : null;
      if (!key || !(SERVICE_KEYS as string[]).includes(key)) return null;
      const origin = process.env.RUNTIME_ORIGIN || process.env.SITE_CANONICAL_URL || "";
      const target = locale === "en" ? "en" : "ar";
      return `${origin}/${target}/preview?path=${encodeURIComponent(servicePath(key))}`;
    },
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 25,
  },
  access: {
    read: requirePermission("services.read"),
    create: requirePermission("services.update"),
    update: requirePermission("services.update"),
    delete: requirePermission("services.update"),
    readVersions: requirePermission("services.read"),
  },
  defaultSort: "order",
  fields: [
    {
      name: "landKey",
      type: "select",
      label: { ar: "هوية المجال (ثابتة)", en: "Capability identity (immutable)" },
      required: true,
      unique: true,
      options: SERVICE_KEYS.map((key) => ({ value: key, label: key })),
      admin: {
        description: {
          ar: "تحدّد الرابط العام /services/… ولا يمكن تغييرها بعد الإنشاء. المجالات السبعة الحالية هي نفسها الموجودة على الموقع.",
          en: "Decides the public route /services/… and cannot change after creation. The seven existing capabilities are the same ones already on the site.",
        },
        readOnly: true,
      },
      validate: (value: unknown) =>
        typeof value === "string" && (SERVICE_KEYS as string[]).includes(value)
          ? true
          : "اختر أحد المجالات السبعة الموجودة.",
    },
    {
      name: "number",
      type: "text",
      label: { ar: "الرقم المعروض", en: "Display number" },
      admin: {
        readOnly: true,
        description: { ar: "يُشتق من ترتيب المجالات المعروف (01…07).", en: "Derived from the known capability order (01…07)." },
      },
      hooks: {
        beforeChange: [
          ({ data }: { data?: Record<string, unknown> }) =>
            typeof data?.landKey === "string" ? serviceNumber(data.landKey) : undefined,
        ],
      },
    },
    {
      name: "order",
      type: "number",
      label: { ar: "الترتيب", en: "Order" },
      required: true,
      defaultValue: 1,
      admin: {
        description: {
          ar: "ترتيب الظهور في صفحة الخدمات وفي قوائم الموقع. لا يغيّر روابط المجالات.",
          en: "Display order in the services page and site lists. It never changes a capability's URL.",
        },
      },
    },
    {
      name: "enabled",
      type: "checkbox",
      label: { ar: "المجال مُتاح", en: "Capability offered" },
      defaultValue: true,
      admin: {
        description: {
          ar: "إيقاف مجال منشور مرفوض — ألغِ نشره أولًا حتى لا يسقط رابط مفهرس بلا تحويل.",
          en: "Stopping a published capability is refused — unpublish it first so an indexed URL cannot drop without a redirect.",
        },
      },
    },
    {
      name: "glyph",
      type: "select",
      label: { ar: "الأيقونة المعتمدة", en: "Approved glyph" },
      required: true,
      options: SERVICE_GLYPHS.map((glyph) => ({ value: glyph, label: glyph })),
      admin: {
        description: {
          ar: "من مجموعة الأيقونات المعتمدة فقط. لا رفع أيقونات ولا أيقونات مخصّصة.",
          en: "From the approved glyph set only. No uploads, no custom icons.",
        },
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: { ar: "صورة الغلاف (اختياري)", en: "Cover image (optional)" },
      admin: {
        description: {
          ar: "اختيارية: لا تُعرض على الموقع في هذه المرحلة — رفعها يخضع لنفس قواعد الوسائط (عامة + نص بديل).",
          en: "Optional: not rendered on the site in this phase — uploading still obeys the media rules (public + alt text).",
        },
      },
    },

    /* ── editorial copy, per locale ─────────────────────────────────────────────────────────── */
    {
      name: "title",
      type: "text",
      label: { ar: "اسم المجال", en: "Capability name" },
      localized: true,
      required: true,
    },
    {
      name: "short",
      type: "text",
      label: { ar: "الاسم المختصر", en: "Short label" },
      localized: true,
      admin: { description: { ar: "يُستخدم في قوائم المجالات وفي شبكة الصفحة الرئيسية.", en: "Used in capability lists and the home grid." } },
    },
    {
      name: "promise",
      type: "textarea",
      label: { ar: "الوعد (المخرَج)", en: "Promise (outcome)" },
      localized: true,
      required: true,
      admin: { description: { ar: "لغة نتيجة لا لغة خدمة.", en: "Outcome language, not service language." } },
    },
    {
      name: "intro",
      type: "textarea",
      label: { ar: "المقدمة", en: "Introduction" },
      localized: true,
      required: true,
    },
    {
      name: "wa",
      type: "text",
      label: { ar: "رسالة واتساب لهذا المجال", en: "WhatsApp opener for this capability" },
      localized: true,
      admin: { description: { ar: "نص مفتوح مخصص لكل مجال — لا رسالة عامة.", en: "A context-aware opener per capability — never a generic message." } },
    },
    {
      name: "capabilities",
      type: "array",
      label: { ar: "نطاق العمل (العناصر داخل المجال)", en: "Scope items" },
      localized: true,
      fields: [{ name: "item", type: "text", label: { ar: "العنصر", en: "Item" }, localized: true, required: true }],
      admin: {
        description: {
          ar: "تُعرض كمناطق عمل مع ملاحظة النطاق المعروضة، لا كالتزامات سعرية.",
          en: "Shown as scope areas with the published scope note — not as priced commitments.",
        },
      },
    },
    {
      name: "problems",
      type: "array",
      label: { ar: "متى تحتاج هذا المجال", en: "When you need this" },
      localized: true,
      fields: [
        { name: "question", type: "textarea", label: { ar: "الحالة", en: "Situation" }, localized: true, required: true },
        { name: "answer", type: "textarea", label: { ar: "النتيجة", en: "Outcome" }, localized: true, required: true },
      ],
    },
    {
      name: "faqs",
      type: "array",
      label: { ar: "الأسئلة الشائعة", en: "FAQs" },
      localized: true,
      fields: [
        { name: "q", type: "textarea", label: { ar: "السؤال", en: "Question" }, localized: true, required: true },
        { name: "a", type: "textarea", label: { ar: "الجواب", en: "Answer" }, localized: true, required: true },
      ],
    },
    {
      name: "scopeNote",
      type: "textarea",
      label: { ar: "ملاحظة النطاق", en: "Scope note" },
      localized: true,
    },

    /* ── SEO contract (§37, Phase G extends it) ─────────────────────────────────────────────── */
    {
      name: "seo",
      type: "group",
      label: { ar: "بيانات الظهور", en: "SEO" },
      fields: [
        { name: "title", type: "text", label: { ar: "عنوان الظهور", en: "SEO title" }, localized: true },
        { name: "description", type: "textarea", label: { ar: "وصف الظهور", en: "Meta description" }, localized: true },
        { name: "ogImage", type: "upload", relationTo: "media", label: { ar: "صورة المشاركة", en: "Share image" } },
        { name: "noindex", type: "checkbox", label: { ar: "منع الفهرسة", en: "noindex" }, defaultValue: false },
      ],
    },

    /* ── publication state per locale (written only by the endpoints below) ─────────────────── */
    {
      name: "localeState",
      type: "group",
      label: { ar: "حالة النشر لكل لغة", en: "Publication state per locale" },
      admin: { description: { ar: "تُكتب من زر النشر بعد اجتياز الفحص فقط.", en: "Written by the publish action after the gate passes." } },
      fields: SERVICE_LOCALES.map((locale) => ({
        name: locale,
        type: "group",
        label: locale === "ar" ? "العربية" : "English",
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
    beforeChange: [
      async ({ data, req, operation, originalDoc }: { data: Record<string, unknown>; req: PayloadRequest; operation: string; originalDoc?: Record<string, unknown> }) => {
        if (req.context?.serviceAudit) return data;
        if (operation === "update" && originalDoc && data.landKey !== undefined && data.landKey !== originalDoc.landKey) {
          throw new Error("هوية المجال ثابتة: لا يمكن تغييرها بعد الإنشاء.");
        }
        /**
         * A capability that is live in any language cannot be switched off.
         *
         * Turning it off would remove a page that search engines already know, with no redirect
         * (the Redirect Manager arrives in Phase G) — so the rule is: unpublish first, then stop.
         * The published state is read from the PUBLISHED row, not from the draft being edited,
         * because a draft's own snapshot cannot be trusted to describe what is live.
         */
        if (operation === "update" && data.enabled === false) {
          const live = await publishedLocalesFor(req, originalDoc);
          if (live.length > 0) {
            const label = String(data.landKey ?? originalDoc?.landKey ?? "");
            throw new Error(
              `«${label}» منشور حاليًا (${live.map((locale) => (locale === "ar" ? "العربية" : "الإنجليزية")).join(" و")}). ألغِ نشره أولًا ثم أوقفه — لا نترك رابطًا مفهرسًا يسقط بلا تحويل.`,
            );
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }: { doc: Record<string, unknown>; req: PayloadRequest; operation: string; previousDoc?: Record<string, unknown> }) => {
        if (req.context?.serviceAudit) return doc;
        const title = typeof doc.title === "string" && doc.title ? doc.title : String(doc.landKey ?? "");
        const action = operation === "create" ? "service_created" : "service_updated";
        const changed: string[] = [];
        if (operation === "update" && previousDoc) {
          for (const field of ["title", "promise", "intro", "order", "enabled", "glyph"]) {
            if (JSON.stringify(previousDoc[field]) !== JSON.stringify(doc[field])) changed.push(field);
          }
        }
        await recordAuditEvent(req.payload, {
          action,
          summary:
            operation === "create"
              ? `إنشاء مجال «${title}»`
              : `تعديل مجال «${title}»${changed.length ? ` — الحقول: ${changed.join("، ")}` : ""}`,
          resourceType: "services",
          resourceId: doc.id as string | number,
          req,
          detached: true,
        });
        invalidateTags([serviceTag(String(doc.id)), servicesTag]);
        return doc;
      },
    ],
  },
  endpoints: [
    /**
     * GET /api/services/:id/publish-status → per-locale verdict, for the admin banner.
     * `?check=1` re-runs the full gate (media included); the plain read reports stored state only.
     */
    {
      path: "/:id/publish-status",
      method: "get",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("services.read")) {
          return Response.json({ errors: [{ message: "غير مصرح." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        const draft = (await req.payload.findByID({
          collection: "services",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        })) as unknown as ServiceLike & { localeState?: Record<string, { state?: string | null } | undefined> };
        if (!draft) return Response.json({ errors: [{ message: "المجال غير موجود." }] }, { status: 404 });

        const media = await resolveMediaFacts(req.payload, collectServiceMediaIds(draft));
        const result = validateServiceForPublish(draft, media);
        return Response.json({
          ok: result.ok,
          perLocale: result.perLocale,
          blockers: result.blockers,
          stored: {
            ar: draft.localeState?.ar?.state ?? "draft",
            en: draft.localeState?.en?.state ?? "draft",
          },
        });
      },
    },

    /**
     * POST /api/services/:id/publish { locales } → the only door to the public site.
     *
     * One write per locale, carrying that locale's row ids (the measured contract from Phase E): a
     * locale-less write would blank the sibling language.
     */
    {
      path: "/:id/publish",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("services.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية نشر المجالات." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const requested = (body.locales ?? []).filter((value): value is ServiceLocale =>
          (SERVICE_LOCALES as readonly string[]).includes(value),
        );
        if (requested.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة المطلوب نشرها." }] }, { status: 400 });
        }

        const draft = (await req.payload.findByID({
          collection: "services",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        })) as unknown as ServiceLike & { localeState?: Record<string, { state?: string | null } | undefined> };
        if (!draft) return Response.json({ errors: [{ message: "المجال غير موجود." }] }, { status: 404 });

        const media = await resolveMediaFacts(req.payload, collectServiceMediaIds(draft));
        const result = validateServiceForPublish(draft, media);
        const blocked = requested.filter((locale) => !result.perLocale[locale].ok);
        if (blocked.length > 0) {
          const blockers = result.blockers.filter((blocker) => blocked.includes(blocker.locale));
          await recordAuditEvent(req.payload, {
            action: "service_updated",
            summary: `محاولة نشر مرفوضة لمجال «${String(draft.landKey ?? "")}» — ${serviceBlockerSummary(result)}`,
            resourceType: "services",
            resourceId: id,
            req,
            details: { blocked, refused: true },
            detached: true,
          });
          return Response.json(
            { errors: [{ message: "لم يجتز الفحص — لم يُنشر أي شيء." }], blocked, blockers },
            { status: 400 },
          );
        }

        const now = new Date().toISOString();
        const stored = readLocaleState(draft);
        const published: ServiceLocale[] = [];

        for (const locale of requested) {
          /* Carry the previous locale's state forward: `localeState` is shared, so a stale snapshot
             would reset the language published a moment ago (found by the mixed-state test). */
          stored[locale] = { state: "published", at: now };
          const values = flattenLocaleValue(draft as unknown as Record<string, unknown>, locale) as Record<string, unknown>;
          await req.payload.update({
            collection: "services",
            id,
            locale,
            draft: false,
            data: {
              title: values.title,
              short: values.short,
              promise: values.promise,
              intro: values.intro,
              wa: values.wa,
              capabilities: values.capabilities,
              problems: values.problems,
              faqs: values.faqs,
              scopeNote: values.scopeNote,
              seo: values.seo,
              localeState: {
                ...stored,
                [locale]: { state: "published", at: now },
              },
            } as never,
            context: { serviceAudit: true },
            overrideAccess: true,
          } as never);
          published.push(locale);
        }

        const title = String(draft.landKey ?? "");
        await recordAuditEvent(req.payload, {
          action: "service_published",
          summary: `نشر مجال «${title}» — ${published.map((l) => (l === "ar" ? "العربية" : "الإنجليزية")).join(" والإنجليزية".slice(0))}`,
          resourceType: "services",
          resourceId: id,
          req,
          details: { published },
          detached: true,
        });
        invalidateTags([serviceTag(String(id)), servicesTag]);
        return Response.json({ ok: true, published, at: now });
      },
    },

    /**
     * POST /api/services/:id/unpublish { locales } → back to the shipped static content for that
     * locale, or (if the whole capability is unpublished) its shipped page — never a 404, because
     * the seven capability routes ship in code.
     */
    {
      path: "/:id/unpublish",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("services.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية نشر المجالات." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const requested = (body.locales ?? []).filter((value): value is ServiceLocale =>
          (SERVICE_LOCALES as readonly string[]).includes(value),
        );
        if (requested.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة." }] }, { status: 400 });
        }

        const current = (await req.payload.findByID({
          collection: "services",
          id,
          draft: false,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        })) as unknown as { localeState?: Record<string, { state?: string | null } | undefined> } | null;
        if (!current) return Response.json({ errors: [{ message: "المجال غير موجود." }] }, { status: 404 });

        const stored = readLocaleState(current);
        for (const locale of requested) stored[locale] = { state: "draft", at: null };

        await req.payload.update({
          collection: "services",
          id,
          draft: false,
          data: { localeState: stored } as never,
          context: { serviceAudit: true },
          overrideAccess: true,
        } as never);

        await recordAuditEvent(req.payload, {
          action: "service_unpublished",
          summary: `إلغاء نشر مجال #${id} — ${requested.map((l) => (l === "ar" ? "العربية" : "الإنجليزية")).join(" و")}`,
          resourceType: "services",
          resourceId: id,
          req,
          details: { requested },
          detached: true,
        });
        invalidateTags([serviceTag(String(id)), servicesTag]);
        return Response.json({ ok: true, unpublished: requested });
      },
    },
  ],
};

type StoredLocaleState = Record<ServiceLocale, { state?: string | null; at?: string | null } | undefined>;

function readLocaleState(doc: { localeState?: unknown }): StoredLocaleState {
  const raw = (doc.localeState ?? {}) as Record<string, { state?: string | null; at?: string | null } | undefined>;
  return { ar: raw.ar ?? { state: "draft", at: null }, en: raw.en ?? { state: "draft", at: null } };
}

/** Locales the PUBLISHED row says this capability is live in (empty when nothing is live). */
async function publishedLocalesFor(req: PayloadRequest, originalDoc?: Record<string, unknown>): Promise<string[]> {
  const fromOriginal = publishedLocalesOf(originalDoc ?? {});
  if (fromOriginal.length > 0) return fromOriginal;
  const id = originalDoc?.id;
  if (id === undefined || id === null) return [];
  try {
    const live = (await req.payload.findByID({
      collection: "services",
      id: id as string | number,
      draft: false,
      locale: "all",
      depth: 0,
      overrideAccess: true,
    })) as unknown as Record<string, unknown> | null;
    return publishedLocalesOf(live ?? {});
  } catch {
    return [];
  }
}

/** Locales a (possibly previous) document is currently published in. */
function publishedLocalesOf(doc: Record<string, unknown>): string[] {
  const raw = (doc.localeState ?? {}) as Record<string, { state?: string | null } | undefined>;
  return SERVICE_LOCALES.filter((locale) => raw[locale]?.state === "published");
}

export { publicError };
