/**
 * PROJECTS / CASE STUDIES — the real-evidence model (Phase F, §13–§15, §8 of the authorization).
 *
 * THE RULE THIS COLLECTION EXISTS TO ENFORCE
 * Nothing here is ever seeded. The public site states honestly that no case study is publishable
 * yet, and that state stays until a real, attributable project is entered by an authorized editor.
 * The schema is therefore complete and the collection is legitimately EMPTY — a professional empty
 * state is the correct output, not placeholder work (no invented clients, sectors, metrics or
 * testimonials, ever).
 *
 * VERIFIED RESULTS
 * A metric is a claim about a real project, so it is entered by hand, one row at a time, with an
 * optional internal source note. The note is for the record and the audit trail only — the public
 * renderer never reads it (§14).
 */
import { addDataAndFileToRequest, type CollectionConfig, type PayloadRequest } from "payload";

import { permissionsFor, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { invalidateTags } from "@/lib/content/invalidate";
import { projectsTag, projectTag } from "@/lib/content/tags";
import { flattenLocaleValue } from "@/lib/pages/locale-merge";
import { resolveMediaFacts } from "@/lib/pages/media";
import { PROJECT_LOCALES, validateProjectForPublish, projectBlockerSummary, collectProjectMediaIds, type ProjectLocale } from "@/lib/projects/publish";
import { SERVICE_KEYS } from "@/lib/services/model";

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "عمل", plural: "الأعمال" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "client", "year", "featured", "_status", "updatedAt"],
    group: "المحتوى",
    description:
      "الأعمال المنشورة تحتاج موافقة العميل وتوثيقًا حقيقيًا. لا يُضاف أي عمل تجريبي، والحقول الجاهزة تنتظر البيانات الفعلية.",
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === "string" ? doc.slug.trim() : "";
      if (!slug) return null;
      const origin = process.env.RUNTIME_ORIGIN || process.env.SITE_CANONICAL_URL || "";
      const target = locale === "en" ? "en" : "ar";
      return `${origin}/${target}/preview?path=${encodeURIComponent(`/work/${slug}`)}`;
    },
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 25 },
  access: {
    read: requirePermission("projects.read"),
    create: requirePermission("projects.update"),
    update: requirePermission("projects.update"),
    delete: requirePermission("projects.update"),
    readVersions: requirePermission("projects.read"),
  },
  fields: [
    { name: "name", type: "text", label: { ar: "اسم العمل (داخلي)", en: "Project name (internal)" }, localized: true, required: true },
    {
      name: "slug",
      type: "text",
      label: { ar: "الرابط", en: "Slug" },
      required: true,
      unique: true,
      admin: { description: { ar: "أحرف لاتينية صغيرة وأرقام وشرطة. لا يتغيّر بعد النشر حتى يوجد مدير تحويلات (المرحلة G).", en: "Lowercase Latin, digits, hyphens. Locked after publication until the Redirect Manager exists (Phase G)." } },
    },
    {
      name: "client",
      type: "text",
      label: { ar: "اسم العميل كما يوافق على نشره", en: "Client name as approved for publication" },
      localized: true,
      admin: { description: { ar: "يُترك فارغًا إن لم يوافق العميل على ذكر الاسم، ويُكتب وصف عام بدلًا منه.", en: "Leave empty when the client has not approved being named; use a general description instead." } },
    },
    { name: "sector", type: "text", label: { ar: "القطاع", en: "Sector" }, localized: true },
    { name: "year", type: "text", label: { ar: "السنة", en: "Year" } },
    { name: "featured", type: "checkbox", label: { ar: "إبراز في الصفحة الرئيسية", en: "Feature on the home page" }, defaultValue: false },
    {
      name: "landKeys",
      type: "select",
      hasMany: true,
      label: { ar: "المجالات المرتبطة", en: "Related capabilities" },
      options: SERVICE_KEYS.map((key) => ({ value: key, label: key })),
    },
    { name: "cover", type: "upload", relationTo: "media", label: { ar: "صورة الغلاف", en: "Cover image" } },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true, label: { ar: "معرض الصور", en: "Gallery" } },

    { name: "summary", type: "textarea", label: { ar: "الملخّص", en: "Summary" }, localized: true },
    { name: "challenge", type: "textarea", label: { ar: "التحدي", en: "Challenge" }, localized: true },
    { name: "objective", type: "textarea", label: { ar: "الهدف", en: "Objective" }, localized: true },
    { name: "approach", type: "textarea", label: { ar: "المنهج", en: "Approach" }, localized: true },
    { name: "execution", type: "textarea", label: { ar: "التنفيذ", en: "Execution" }, localized: true },
    { name: "resultNarrative", type: "textarea", label: { ar: "سرد النتائج", en: "Result narrative" }, localized: true },

    /**
     * VERIFIED METRICS (§14). Each row is entered by a human with an optional source note that is
     * stored for the record and never rendered publicly.
     */
    {
      name: "metrics",
      type: "array",
      label: { ar: "النتائج الموثّقة", en: "Verified results" },
      localized: true,
      admin: {
        description: {
          ar: "تُدخل يدويًا لكل مشروع بعد توثيقها. لا نحسب ولا نستنتج أي رقم. ملاحظة المصدر داخلية ولا تُنشر.",
          en: "Entered by hand per project once documented. Nothing is calculated or inferred. The source note stays internal.",
        },
      },
      fields: [
        { name: "label", type: "text", label: { ar: "اسم المؤشر", en: "Metric label" }, localized: true, required: true },
        { name: "value", type: "text", label: { ar: "القيمة", en: "Value" }, localized: true, required: true },
        {
          name: "sourceNote",
          type: "textarea",
          label: { ar: "ملاحظة المصدر (داخلية)", en: "Source note (internal)" },
          admin: { description: { ar: "لا تظهر على الموقع إطلاقًا.", en: "Never rendered on the public site." } },
        },
      ],
    },

    /**
     * TESTIMONIAL (§13) — only with the client's approval and attribution. The publish gate refuses
     * a quote without attribution, so an anonymous "happy client" can never be published.
     */
    {
      name: "testimonial",
      type: "group",
      label: { ar: "شهادة العميل", en: "Client testimonial" },
      fields: [
        { name: "quote", type: "textarea", label: { ar: "النص", en: "Quote" }, localized: true },
        { name: "attribution", type: "text", label: { ar: "نُسبت إلى", en: "Attributed to" }, localized: true },
        { name: "approved", type: "checkbox", label: { ar: "العميل وافق على النشر", en: "Client approved for publication" }, defaultValue: false },
      ],
    },

    { name: "publishedAt", type: "date", label: { ar: "تاريخ النشر", en: "Publish date" } },
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
    {
      name: "localeState",
      type: "group",
      label: { ar: "حالة النشر لكل لغة", en: "Publication state per locale" },
      fields: PROJECT_LOCALES.map((locale) => ({
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
    afterChange: [
      async ({ doc, req, operation }: { doc: Record<string, unknown>; req: PayloadRequest; operation: string }) => {
        if (req.context?.projectAudit) return doc;
        await recordAuditEvent(req.payload, {
          action: operation === "create" ? "project_created" : "project_updated",
          summary:
            operation === "create"
              ? `إنشاء عمل «${String(doc.name ?? "")}»`
              : `تعديل عمل «${String(doc.name ?? "")}»`,
          resourceType: "projects",
          resourceId: doc.id as string | number,
          req,
          detached: true,
        });
        invalidateTags([projectTag(String(doc.id)), projectsTag]);
        return doc;
      },
    ],
  },
  endpoints: [
    {
      path: "/:id/publish",
      method: "post",
      handler: async (req: PayloadRequest) => {
        const permissions = await permissionsFor(req);
        if (!permissions.has("projects.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية نشر الأعمال." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const requested = (body.locales ?? []).filter((value): value is ProjectLocale =>
          (PROJECT_LOCALES as readonly string[]).includes(value),
        );
        if (requested.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة المطلوب نشرها." }] }, { status: 400 });
        }

        const draft = (await req.payload.findByID({
          collection: "projects",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        })) as unknown as Record<string, unknown> | null;
        if (!draft) return Response.json({ errors: [{ message: "العمل غير موجود." }] }, { status: 404 });

        const media = await resolveMediaFacts(req.payload, collectProjectMediaIds(draft));
        const result = validateProjectForPublish(draft, media);
        const blocked = requested.filter((locale) => !result.perLocale[locale].ok);
        if (blocked.length > 0) {
          await recordAuditEvent(req.payload, {
            action: "project_updated",
            summary: `محاولة نشر مرفوضة لعمل «${String(draft.name ?? "")}» — ${projectBlockerSummary(result)}`,
            resourceType: "projects",
            resourceId: id,
            req,
            details: { blocked, refused: true },
            detached: true,
          });
          return Response.json(
            { errors: [{ message: "لم يجتز الفحص — لم يُنشر أي شيء." }], blocked, blockers: result.blockers.filter((b) => blocked.includes(b.locale)) },
            { status: 400 },
          );
        }

        const now = new Date().toISOString();
        const stored = (draft.localeState ?? {}) as Record<string, { state?: string | null; at?: string | null } | undefined>;
        for (const locale of requested) {
          /* Shared state: carry every locale published so far forward (see Services). */
          stored[locale] = { state: "published", at: now };
          const values = flattenLocaleValue(draft, locale) as Record<string, unknown>;
          await req.payload.update({
            collection: "projects",
            id,
            locale,
            draft: false,
            data: {
              client: values.client,
              sector: values.sector,
              summary: values.summary,
              challenge: values.challenge,
              objective: values.objective,
              approach: values.approach,
              execution: values.execution,
              resultNarrative: values.resultNarrative,
              metrics: values.metrics,
              testimonial: values.testimonial,
              seo: values.seo,
              localeState: { ...stored, [locale]: { state: "published", at: now } },
            } as never,
            context: { projectAudit: true },
            overrideAccess: true,
          } as never);
        }

        await recordAuditEvent(req.payload, {
          action: "project_published",
          summary: `نشر عمل «${String(draft.name ?? "")}» — ${requested.join(" · ")}`,
          resourceType: "projects",
          resourceId: id,
          req,
          details: { published: requested },
          detached: true,
        });
        invalidateTags([projectTag(String(id)), projectsTag]);
        return Response.json({ ok: true, published: requested, at: now });
      },
    },
  ],
};
