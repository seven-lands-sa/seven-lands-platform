/**
 * INSIGHTS — the editorial model (Phase F, §16–§17).
 *
 * The public Insights page states honestly that nothing is published yet; this collection is the
 * professional home for real articles when they exist, and it is legitimately EMPTY until then.
 *
 * BODY: Payload's own rich text (lexical) — headings, paragraphs, lists, links. No raw HTML, no
 * scripts, no styles from the editor (§17). Images are media-library references, never URLs.
 */
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { addDataAndFileToRequest, type CollectionConfig, type PayloadRequest } from "payload";

import { permissionsFor, requirePermission } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { invalidateTags } from "@/lib/content/invalidate";
import { insightsTag, insightTag } from "@/lib/content/tags";
import { INSIGHT_LOCALES, collectInsightMediaIds, insightBlockerSummary, validateInsightForPublish, type InsightLocale } from "@/lib/insights/publish";
import { flattenLocaleValue } from "@/lib/pages/locale-merge";
import { resolveMediaFacts } from "@/lib/pages/media";
import { SERVICE_KEYS } from "@/lib/services/model";

export const Insights: CollectionConfig = {
  slug: "insights",
  labels: { singular: "مقال", plural: "الرؤى" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "author", "publishedAt", "_status", "updatedAt"],
    group: "المحتوى",
    description:
      "مقالات الرؤى. لا يُنشر مقال بلا مقتطف ونص كامل باللغة نفسها، والصورة — إن وُجدت — من مكتبة الوسائط.",
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === "string" ? doc.slug.trim() : "";
      if (!slug) return null;
      const origin = process.env.RUNTIME_ORIGIN || process.env.SITE_CANONICAL_URL || "";
      const target = locale === "en" ? "en" : "ar";
      return `${origin}/${target}/preview?path=${encodeURIComponent(`/insights/${slug}`)}`;
    },
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 25 },
  access: {
    read: requirePermission("insights.read"),
    create: requirePermission("insights.update"),
    update: requirePermission("insights.update"),
    delete: requirePermission("insights.update"),
    readVersions: requirePermission("insights.read"),
  },
  fields: [
    { name: "title", type: "text", label: { ar: "العنوان", en: "Title" }, localized: true, required: true },
    {
      name: "slug",
      type: "text",
      label: { ar: "الرابط", en: "Slug" },
      required: true,
      unique: true,
      admin: { description: { ar: "أحرف لاتينية صغيرة وأرقام وشرطة.", en: "Lowercase Latin, digits and hyphens." } },
    },
    { name: "excerpt", type: "textarea", label: { ar: "المقتطف", en: "Excerpt" }, localized: true, required: true },
    { name: "cover", type: "upload", relationTo: "media", label: { ar: "صورة الغلاف", en: "Cover image" } },
    {
      name: "category",
      type: "text",
      label: { ar: "التصنيف", en: "Category" },
      localized: true,
      admin: { description: { ar: "نص حر بسيط بلا نظام تصنيفات حتى يوجد محتوى حقيقي يستدعيه.", en: "A simple free label until real content justifies a taxonomy." } },
    },
    {
      name: "author",
      type: "text",
      label: { ar: "النسبة المعروضة", en: "Display attribution" },
      localized: true,
      admin: { description: { ar: "لا تُنشر أسماء أشخاص غير معتمدين. اتركه فارغًا أو اكتب «فريق سفن لاند».", en: "Never publish unapproved personal names. Leave empty or use the team line." } },
    },
    {
      name: "landKeys",
      type: "select",
      hasMany: true,
      label: { ar: "المجالات المرتبطة", en: "Related capabilities" },
      options: SERVICE_KEYS.map((key) => ({ value: key, label: key })),
    },
    {
      name: "body",
      type: "richText",
      label: { ar: "النص", en: "Body" },
      localized: true,
      editor: lexicalEditor(),
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
      fields: INSIGHT_LOCALES.map((locale) => ({
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
              { value: "published", label: { ar: "منشور", en: "Published" } },
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
        if (req.context?.insightAudit) return doc;
        const title = typeof doc.title === "string" && doc.title ? doc.title : String(doc.slug ?? "");
        await recordAuditEvent(req.payload, {
          action: operation === "create" ? "insight_created" : "insight_updated",
          summary: operation === "create" ? `إنشاء مقال «${title}»` : `تعديل مقال «${title}»`,
          resourceType: "insights",
          resourceId: doc.id as string | number,
          req,
          detached: true,
        });
        invalidateTags([insightTag(String(doc.id)), insightsTag]);
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
        if (!permissions.has("insights.publish")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية نشر المقالات." }] }, { status: 403 });
        }
        const id = req.routeParams?.id as string | number;
        await addDataAndFileToRequest(req);
        const body = (req.data ?? {}) as { locales?: string[] };
        const requested = (body.locales ?? []).filter((value): value is InsightLocale =>
          (INSIGHT_LOCALES as readonly string[]).includes(value),
        );
        if (requested.length === 0) {
          return Response.json({ errors: [{ message: "حدّد اللغة المطلوب نشرها." }] }, { status: 400 });
        }

        const draft = (await req.payload.findByID({
          collection: "insights",
          id,
          draft: true,
          locale: "all",
          depth: 0,
          overrideAccess: true,
        })) as unknown as Record<string, unknown> | null;
        if (!draft) return Response.json({ errors: [{ message: "المقال غير موجود." }] }, { status: 404 });

        const media = await resolveMediaFacts(req.payload, collectInsightMediaIds(draft));
        const result = validateInsightForPublish(draft, media);
        const blocked = requested.filter((locale) => !result.perLocale[locale].ok);
        if (blocked.length > 0) {
          await recordAuditEvent(req.payload, {
            action: "insight_updated",
            summary: `محاولة نشر مقال مرفوضة — ${insightBlockerSummary(result)}`,
            resourceType: "insights",
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
            collection: "insights",
            id,
            locale,
            draft: false,
            data: {
              title: values.title,
              excerpt: values.excerpt,
              category: values.category,
              author: values.author,
              body: values.body,
              seo: values.seo,
              localeState: { ...stored, [locale]: { state: "published", at: now } },
            } as never,
            context: { insightAudit: true },
            overrideAccess: true,
          } as never);
        }

        await recordAuditEvent(req.payload, {
          action: "insight_published",
          summary: `نشر مقال «${String(draft.title ?? "")}» — ${requested.join(" · ")}`,
          resourceType: "insights",
          resourceId: id,
          req,
          details: { published: requested },
          detached: true,
        });
        invalidateTags([insightTag(String(id)), insightsTag]);
        return Response.json({ ok: true, published: requested, at: now });
      },
    },
  ],
};
