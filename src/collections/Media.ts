import path from "node:path";

import { createHash } from "node:crypto";
import { addDataAndFileToRequest, type CollectionConfig, type PayloadRequest } from "payload";

import { isActiveUser, permissionsFor, requirePermission, type AuthUser } from "@/lib/auth/access";
import { recordAuditEvent } from "@/lib/auth/audit";
import { invalidateTags } from "@/lib/content/invalidate";
import { mediaTag } from "@/lib/content/tags";
import { MEDIA_VISIBILITIES } from "@/lib/content/media";
import { publicError } from "@/lib/errors";
import {
  MAX_IMAGE_BYTES,
  MAX_SVG_BYTES,
  expectedMimeFromExtension,
  isForbiddenExtension,
  normaliseRaster,
  replaceStoredFilename,
  safeStoredFilename,
  sniffMimeType,
  validateSvg,
} from "@/lib/media/policy";
import { dependentTagsFor, findMediaUsage, usageBlockMessage } from "@/lib/media/usage";

/**
 * MEDIA LIBRARY — مكتبة الوسائط (§4–§7, §11, §18, §20, §31)
 *
 * The asset store every future content phase depends on. Three layers, each with one job:
 *
 *   1. POLICY (`src/lib/media/policy.ts`) — what may enter and how it is vetted: allowed types,
 *      size ceilings, magic-byte sniffing, the SVG refusal rules, deterministic filenames.
 *   2. THIS COLLECTION — the model, the write pipeline (normalise → hash → store), access, audit.
 *   3. USAGE (`src/lib/media/usage.ts`) — where an asset is referenced, which decides whether it
 *      can be deleted and which caches a change must invalidate.
 *
 * ACCESS MODEL
 *   read        staff with `media.read` see everything; everyone else is constrained to
 *               `visibility = public`. That single constraint is what the binary layer enforces
 *               (Payload applies it inside `checkFileAccess` for the original *and* every
 *               derivative), so a private file returns 403 even to a request that knows its URL.
 *   create      `media.upload`; SVG additionally needs the high-risk `media.svg_upload`.
 *   update      `media.update` for metadata. `media.visibility` is required the moment a write
 *               would change visibility — including the fields-level write of the same request.
 *   delete      `media.delete` (high risk → Super Admin by default) AND no live references.
 *
 * WRITE PIPELINE (runs for every upload, in this order):
 *   beforeValidate → type/size/extension checks, SVG content refusal
 *   beforeChange   → EXIF strip + auto-orient, deterministic filename, content hash, createdBy
 *   afterChange    → audit, targeted cache invalidation
 *   beforeDelete   → refuse when referenced, audit the refusal
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "ملف", plural: "الوسائط" },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "visibility", "mimeType", "filesize", "updatedAt"],
    group: "المحتوى",
    description:
      "مكتبة الصور والملفات. كل ملف يُرفع «خاص» حتى تقرر غير ذلك، ولا يُحذف ملف مستخدم في أي مكان.",
    listSearchableFields: ["filename", "alt", "caption", "sourceFilename"],
    /**
     * The library surface (§13, §14). Payload's default table is replaced for Media only, by a
     * purpose-built view: grid with previews, search, filters, sort, upload with progress, and a
     * usage count per asset. The detail view stays Payload's document editor, extended with the
     * usage panel below.
     */
    components: {
      views: {
        list: { Component: "/components/admin/MediaLibraryView#MediaLibraryView" },
      },
    },
  },
  access: {
    read: async ({ req }) => {
      const user = req.user as AuthUser | null;
      if (isActiveUser(user) && (await permissionsFor(req)).has("media.read")) return true;
      return { visibility: { equals: "public" } };
    },
    create: requirePermission("media.upload"),
    /**
     * Metadata edits need `media.update`. Changing `visibility` needs `media.visibility` on top —
     * checked here against the incoming data, so hiding the field in the UI is never the control.
     */
    update: async ({ req, data }) => {
      const permissions = await permissionsFor(req);
      if (!permissions.has("media.update")) return false;
      if (data && typeof data === "object" && "visibility" in data) {
        return permissions.has("media.visibility");
      }
      return true;
    },
    delete: requirePermission("media.delete"),
  },
  upload: {
    staticDir: process.env.MEDIA_DIR ? path.resolve(process.env.MEDIA_DIR) : path.resolve("media"),
    adminThumbnail: "thumbnail",
    /** Normalised focal coordinates (focalX / focalY, 0–1). The frontend crops, never re-uploads. */
    focalPoint: true,
    /** The policy file is the single allowlist; this mirrors it for Payload's own header check. */
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
    /**
     * DERIVATIVES (§8) — three sizes, each with a stated job, plus the original:
     *
     *   original    untouched upload (EXIF stripped, orientation applied) — downloads, print, OG
     *   thumbnail   400×300   grid tiles, admin previews, tiny cards
     *   card        768×512   in-page cards, article teasers, mobile hero
     *   content     1200×900  article body images, service visuals, desktop cards
     *
     * `hero` is deliberately NOT generated: the layouts that will need it (Phase E page blocks) do
     * not exist yet, and Payload never enlarges an upload to reach a size — a second 1920-wide
     * derivative of a 1200-wide source would be a lie. The next/image pipeline adds delivery-time
     * widths per viewport instead, which is the responsive strategy for the public site.
     */
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "content", width: 1200, height: 900, position: "centre" },
    ],
  },
  fields: [
    {
      name: "visibility",
      type: "select",
      required: true,
      defaultValue: "private",
      index: true,
      label: "الظهور",
      options: [
        { label: "خاص — لا يظهر للزوار", value: "private" },
        { label: "عام — يمكن نشره في الموقع", value: "public" },
      ],
      admin: {
        description:
          "الافتراضي «خاص». الملف الخاص لا يُفتح حتى لمن يعرف رابطه. اجعله «عام» فقط عندما تريد استخدامه في الموقع.",
        position: "sidebar",
      },
      validate: (value: unknown) =>
        typeof value === "string" && (MEDIA_VISIBILITIES as readonly string[]).includes(value)
          ? true
          : "قيمة ظهور غير معروفة.",
    },
    {
      name: "decorative",
      type: "checkbox",
      label: "صورة زخرفية (بلا معنى معلوماتي)",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "فعّلها فقط إذا كانت الصورة زخرفية بحتة — عندها لا يُطلب النص البديل وتُقرأ على قارئات الشاشة كصورة فارغة. الصور التي تحمل معنى تحتاج نصًا بديلًا بالعربية والإنجليزية.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "alt",
          type: "text",
          localized: true,
          label: "النص البديل",
          admin: {
            width: "50%",
            description:
              "وصف مختصر للصورة يُقرأ على قارئات الشاشة. مطلوب بالعربية والإنجليزية قبل جعل الصورة عامة.",
          },
        },
        {
          name: "caption",
          type: "text",
          localized: true,
          label: "التعليق",
          admin: {
            width: "50%",
            description: "نص اختياري يظهر أسفل الصورة عند استخدامها في المحتوى.",
          },
        },
      ],
    },
    {
      name: "altStatus",
      type: "ui",
      label: "اكتمال النص البديل",
      admin: {
        components: { Field: "/components/admin/MediaAltStatus#MediaAltStatus" },
      },
    },
    {
      name: "tags",
      type: "select",
      hasMany: true,
      index: true,
      label: "الوسوم",
      options: [
        { label: "الهوية", value: "brand" },
        { label: "الموقع", value: "website" },
        { label: "الخدمات", value: "services" },
        { label: "المشاريع", value: "projects" },
        { label: "المقالات", value: "articles" },
        { label: "التواصل الاجتماعي", value: "social" },
        { label: "صورة مشاركة", value: "og" },
        { label: "الفريق", value: "team" },
        { label: "أخرى", value: "other" },
      ],
      admin: {
        description:
          "تصنيف خفيف للبحث والفلترة. اختر ما يناسب الاستخدام — لا يوجد تسلسل مجلدات مقصود.",
      },
    },
    {
      type: "collapsible",
      label: "بيانات الملف",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "contentHash",
          type: "text",
          index: true,
          label: "بصمة المحتوى",
          admin: {
            readOnly: true,
            description:
              "بصمة SHA-256 لمحتوى الملف. تُستخدم لكشف الملفات المكررة وللتأكد من أن الاستبدال غيّر الملف فعلًا.",
          },
        },
        {
          name: "sourceFilename",
          type: "text",
          label: "اسم الملف الأصلي",
          admin: {
            readOnly: true,
            description: "الاسم كما رفعه المستخدم — يُحفظ للمرجعية فقط، والمسار المخزَّن يُنظَّف منه.",
          },
        },
        {
          name: "createdBy",
          type: "relationship",
          relationTo: "users",
          label: "رفعه",
          admin: { readOnly: true },
        },
        {
          name: "duplicateOf",
          type: "relationship",
          relationTo: "media",
          index: true,
          label: "نسخة مكررة من",
          admin: {
            readOnly: true,
            description:
              "إن وُجد ملف بنفس المحتوى تمامًا (بصمة SHA-256 متطابقة) يُسجَّل هنا للمراجعة. الرفع لا يُمنع — القرار للمحرر.",
          },
        },
        {
          name: "replacedAt",
          type: "date",
          label: "آخر استبدال للملف",
          admin: {
            readOnly: true,
            date: { pickerAppearance: "dayAndTime" },
            description: "يتحدث تلقائيًا عند استبدال الملف الثنائي مع الحفاظ على هوية السجل.",
          },
        },
      ],
    },
    {
      name: "usage",
      type: "ui",
      label: "الاستخدام",
      admin: {
        components: { Field: "/components/admin/MediaUsagePanel#MediaUsagePanel" },
      },
    },
    {
      name: "assetActions",
      type: "ui",
      label: "إجراءات الملف",
      admin: {
        components: { Field: "/components/admin/MediaActionsPanel#MediaActionsPanel" },
      },
    },
  ],
  endpoints: [
    /**
     * GET /api/media/:id/usage → where this asset is referenced (§16).
     * Exposed as an endpoint so the admin UI, the verification suite and any future publishing gate
     * all read the same answer instead of re-deriving it.
     */
    {
      path: "/:id/usage",
      method: "get",
      handler: async (req) => {
        const mediaId = req.routeParams?.id;
        if (mediaId === undefined) {
          return Response.json({ errors: [{ message: "معرّف الملف مفقود." }] }, { status: 400 });
        }
        const references = await findMediaUsage(req.payload, mediaId as string);
        return Response.json({ references, count: references.length });
      },
    },
    /**
     * GET /api/media/library-meta?ids=1,2,3 → the per-tile facts the grid needs, in one request:
     * usage count, and whether alt/caption exist in BOTH locales (§11, §12 — no AR→EN fallback, so
     * "has Arabic only" is a real state the editor must see).
     *
     * Reading with `locale: "all"` is the only way to answer the locale question in one call, and it
     * is deliberately read-only.
     */
    {
      path: "/library-meta",
      method: "get",
      handler: async (req) => {
        const raw = new URL(req.url ?? "http://localhost", "http://localhost").searchParams.get("ids") ?? "";
        const ids = raw.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 200);
        if (ids.length === 0) {
          return Response.json({ counts: {}, altStatus: {}, captionStatus: {}, decorative: {} });
        }

        const { docs } = await req.payload.find({
          collection: "media",
          where: { id: { in: ids } },
          limit: ids.length,
          depth: 0,
          locale: "all",
          overrideAccess: true,
        });

        const text = (value: unknown, locale: "ar" | "en"): string => {
          if (!value) return "";
          if (typeof value === "string") return value;
          const record = value as Record<string, unknown>;
          return typeof record[locale] === "string" ? (record[locale] as string) : "";
        };
        const statusOf = (value: unknown): string => {
          const ar = text(value, "ar").trim();
          const en = text(value, "en").trim();
          if (ar && en) return "complete";
          if (ar) return "ar-only";
          if (en) return "en-only";
          return "missing";
        };

        const counts: Record<string, number> = {};
        const altStatus: Record<string, string> = {};
        const captionStatus: Record<string, string> = {};
        const decorative: Record<string, boolean> = {};

        for (const id of ids) {
          const references = await findMediaUsage(req.payload, id);
          counts[id] = references.length;
        }
        for (const doc of docs) {
          const key = String(doc.id);
          altStatus[key] = statusOf(doc.alt);
          captionStatus[key] = statusOf(doc.caption);
          decorative[key] = doc.decorative === true;
        }

        return Response.json({ counts, altStatus, captionStatus, decorative });
      },
    },
    /**
     * GET /api/media/capabilities → what THIS user may do with the library. Purely an affordance
     * hint for the admin UI; every write re-checks the same permission server-side.
     */
    {
      path: "/capabilities",
      method: "get",
      handler: async (req) => {
        const permissions = await permissionsFor(req);
        return Response.json({
          read: permissions.has("media.read"),
          upload: permissions.has("media.upload"),
          update: permissions.has("media.update"),
          visibility: permissions.has("media.visibility"),
          delete: permissions.has("media.delete"),
          svgUpload: permissions.has("media.svg_upload"),
        });
      },
    },
    /**
     * POST /api/media/:id/replace → swap the binary while keeping the document (§20).
     *
     * Identity is preserved on purpose: every reference in every future page keeps pointing at the
     * same asset, and the derivatives are regenerated by Payload from the new bytes. The type must
     * stay compatible (image → image; SVG → SVG), because replacing an image with an SVG would
     * silently change the delivery headers and the rendering model of every page that uses it.
     */
    {
      path: "/:id/replace",
      method: "post",
      handler: async (req) => {
        /* Custom endpoints receive the raw request: Payload's own parser is what turns the multipart
           body into `req.file`. Without this line the handler sees no file at all. */
        await addDataAndFileToRequest(req);

        const permissions = await permissionsFor(req);
        if (!permissions.has("media.update") || !permissions.has("media.upload")) {
          return Response.json({ errors: [{ message: "لا تملك صلاحية استبدال الملفات." }] }, { status: 403 });
        }

        const mediaId = req.routeParams?.id as string | number;
        const existing = await req.payload.findByID({ collection: "media", id: mediaId, overrideAccess: true });
        if (!existing) {
          return Response.json({ errors: [{ message: "الملف غير موجود." }] }, { status: 404 });
        }

        const file = req.file;
        if (!file?.data) {
          return Response.json({ errors: [{ message: "لم يصل أي ملف في الطلب." }] }, { status: 400 });
        }

        const declared = (file.mimetype ?? "").toLowerCase();
        const sniffed = sniffMimeType(file.data);
        const wasSvg = existing.mimeType === "image/svg+xml";

        if (wasSvg && (!sniffed.ok || sniffed.mimeType !== "image/svg+xml")) {
          return Response.json(
            { errors: [{ message: "هذا السجل ملف SVG، والاستبدال يجب أن يكون بملف SVG." }] },
            { status: 400 },
          );
        }
        if (!wasSvg && sniffed.ok && sniffed.mimeType === "image/svg+xml") {
          return Response.json(
            { errors: [{ message: "لا يمكن استبدال صورة بملف SVG. أنشئ ملفًا جديدًا بصلاحية SVG." }] },
            { status: 400 },
          );
        }
        if (!sniffed.ok) {
          return Response.json({ errors: [{ message: sniffed.reason }] }, { status: 400 });
        }
        if (declared && declared !== sniffed.mimeType && !(wasSvg && declared === "image/svg+xml")) {
          return Response.json(
            { errors: [{ message: `نوع الملف المُعلن (${declared}) لا يطابق محتواه (${sniffed.mimeType}).` }] },
            { status: 400 },
          );
        }
        if (sniffed.mimeType === "image/svg+xml") {
          if (!permissions.has("media.svg_upload")) {
            return Response.json({ errors: [{ message: "استبدال SVG يحتاج صلاحية رفع ملفات SVG." }] }, { status: 403 });
          }
          const svgCheck = validateSvg(file.data);
          if (!svgCheck.ok) return Response.json({ errors: [{ message: svgCheck.reason }] }, { status: 400 });
        }

        /* Hash the bytes that WILL be stored: the incoming file is normalised here, exactly as the
           upload pipeline would, and the request is marked so the hook does not re-encode again. */
        let normalisedData = file.data;
        if (sniffed.mimeType !== "image/svg+xml") {
          try {
            normalisedData = await normaliseRaster(file.data, sniffed.mimeType);
          } catch {
            return Response.json(
              { errors: [{ message: "تعذّرت معالجة الصورة الجديدة. تأكد من سلامتها ثم أعد المحاولة." }] },
              { status: 400 },
            );
          }
        }

        const previousHash = existing.contentHash ?? null;
        const hash = createHash("sha256").update(normalisedData).digest("hex");
        if (hash === previousHash) {
          return Response.json(
            { errors: [{ message: "الملف الجديد مطابق للملف الحالي — لا يوجد ما يُستبدل." }] },
            { status: 400 },
          );
        }

        /* The hook skips normalisation for this request: the bytes below are already final. */
        (req.context as Record<string, unknown>).mediaNormalised = true;

        const updated = await req.payload.update({
          collection: "media",
          id: mediaId,
          data: { replacedAt: new Date().toISOString() } as never,
          file: {
            data: normalisedData,
            mimetype: sniffed.mimeType,
            name: replaceStoredFilename(existing.filename ?? file.name ?? "asset", sniffed.mimeType, hash),
            size: file.size ?? file.data.length,
          },
          overrideAccess: true,
          req,
        });

        await recordAuditEvent(req.payload, {
          action: "media_binary_replaced",
          summary: `استُبدل ملف الوسائط — ${updated.filename ?? mediaId}`,
          resourceType: "media",
          resourceId: updated.id,
          req,
          details: {
            previousHash,
            newHash: updated.contentHash ?? hash,
            from: { mimeType: existing.mimeType, filesize: existing.filesize },
            to: { mimeType: updated.mimeType, filesize: updated.filesize },
          },
        });

        return Response.json({
          doc: { id: updated.id, filename: updated.filename, width: updated.width, height: updated.height },
          regenerated: ["thumbnail", "card", "content"],
        });
      },
    },
  ],
  hooks: {
    /**
     * THE UPLOAD GATE — validation, normalisation and naming, all in `beforeOperation`.
     *
     * Why here and not in `beforeValidate`: Payload generates the file data (dimensions, derivatives,
     * the buffers that will be written to disk) *before* the validate/change phases run. A check or a
     * rewrite placed later never sees the bytes that are actually stored. `beforeOperation` runs
     * first, so everything below applies to the real upload:
     *
     *   1. type contract  — extension says one thing and the bytes say another → refused in Arabic
     *   2. size ceilings  — 10 MB images, 1 MB SVG
     *   3. SVG policy     — trusted uploader + content refusal (see `validateSvg`)
     *   4. normalisation  — auto-orient, EXIF stripped once, so no derivative can reintroduce it
     *   5. naming         — deterministic, path-safe filename derived from the CONTENT type
     *   6. evidence       — SHA-256 of the stored bytes, handed to `beforeChange` via `req.context`
     *
     * The permission check comes first and returns quietly when the actor may not upload: Payload's
     * own access control answers 403 a moment later, and an unauthorised caller learns nothing about
     * the policy.
     */
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation !== "create" && operation !== "update") return;
        const input = args as {
          data?: Record<string, unknown>;
          file?: { data?: Buffer; mimetype?: string; name?: string; size?: number };
        };
        const file = input.file ?? req.file;
        if (!file?.data) return;

        const permissions = await permissionsFor(req);
        if (!permissions.has("media.upload")) return;

        const originalName = file.name ?? "asset";
        const declared = (file.mimetype ?? "").toLowerCase();

        if (isForbiddenExtension(originalName)) {
          throw publicError("نوع الملف غير مدعوم. الأنواع المسموحة: JPG، PNG، WebP، AVIF، SVG.", 400);
        }

        const sniffed = sniffMimeType(file.data);
        if (!sniffed.ok) throw publicError(sniffed.reason, 400);

        const fromExtension = expectedMimeFromExtension(originalName);
        if (fromExtension && fromExtension !== sniffed.mimeType) {
          throw publicError(
            `نوع الملف لا يطابق محتواه: الامتداد يقول ${fromExtension} والمحتوى ${sniffed.mimeType}. الأنواع المسموحة: JPG، PNG، WebP، AVIF، SVG.`,
            400,
          );
        }
        if (declared && declared !== sniffed.mimeType) {
          throw publicError(
            `نوع الملف المُعلن (${declared}) لا يطابق محتواه الفعلي (${sniffed.mimeType}). الأنواع المسموحة: JPG، PNG، WebP، AVIF، SVG.`,
            400,
          );
        }

        const size = file.size ?? file.data.length;
        if (sniffed.mimeType === "image/svg+xml") {
          if (!permissions.has("media.svg_upload")) {
            throw publicError(
              "رفع ملفات SVG يحتاج صلاحية خاصة (خطر أمني). اطلب من مدير النظام رفع الملف أو منحك الصلاحية.",
              403,
            );
          }
          const svgCheck = validateSvg(file.data);
          if (!svgCheck.ok) throw publicError(svgCheck.reason, 400);
        } else if (size > MAX_IMAGE_BYTES) {
          throw publicError(
            `حجم الصورة يتجاوز الحد المسموح (${Math.round(MAX_IMAGE_BYTES / 1_000_000)} ميجابايت).`,
            400,
          );
        }

        /* Normalisation: orientation baked in, metadata dropped. Runs once, on the stored bytes.
           The replacement endpoint normalises the incoming file itself (it has to hash the bytes it
           compares), and marks the request so the work is not repeated — re-encoding twice would
           make the recorded hash describe bytes that are not the ones on disk. */
        if (sniffed.mimeType !== "image/svg+xml" && req.context.mediaNormalised !== true) {
          try {
            const normalised = await normaliseRaster(file.data, sniffed.mimeType);
            file.data = normalised;
            file.size = normalised.length;
          } catch (error) {
            req.payload.logger.error(
              `[media] normalisation failed for ${originalName}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw publicError("تعذّرت معالجة الصورة. تأكد أن الملف صورة صحيحة ثم أعد المحاولة.", 400);
          }
        }

        file.mimetype = sniffed.mimeType;
        file.name = safeStoredFilename(originalName, sniffed.mimeType);
        file.size = file.data.length;

        req.context.mediaContentHash = createHash("sha256").update(file.data).digest("hex");
        req.context.mediaSourceFilename = originalName;
      },
    ],

    /**
     * Records what the pipeline produced: the hash of the stored bytes (replacement verification and
     * duplicate detection both read it), the original filename as metadata only, and who uploaded it.
     */
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === "create") {
          if (typeof req.context.mediaContentHash === "string") data.contentHash = req.context.mediaContentHash;
          if (typeof req.context.mediaSourceFilename === "string") data.sourceFilename = req.context.mediaSourceFilename;
          const user = req.user as AuthUser | null;
          if (user?.id) data.createdBy = user.id;
        }
        return data;
      },
    ],

    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const visibilityChanged = operation === "update" && previousDoc?.visibility !== doc.visibility;

        if (visibilityChanged) {
          await recordAuditEvent(req.payload, {
            action: "media_visibility_changed",
            summary:
              doc.visibility === "public"
                ? `جعل الملف عامًا — ${doc.filename ?? doc.id}`
                : `جعل الملف خاصًا — ${doc.filename ?? doc.id}`,
            resourceType: "media",
            resourceId: doc.id,
            req,
            details: { from: previousDoc?.visibility ?? null, to: doc.visibility },
          });
        }

        /*
         * DUPLICATE DETECTION (§27) — deliberately lightweight: the content hash is already computed,
         * so finding an earlier asset with the same hash is one indexed query. The upload is never
         * blocked and the editor is never second-guessed: the library shows "نسخة مكررة من …" and
         * the decision stays human.
         */
        if (operation === "create" && doc.contentHash) {
          const { docs: twins } = await req.payload.find({
            collection: "media",
            where: { and: [{ contentHash: { equals: doc.contentHash } }, { id: { not_equals: doc.id } }] },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          });
          const twin = twins[0];
          if (twin) {
            await req.payload.update({
              collection: "media",
              id: doc.id,
              data: { duplicateOf: twin.id } as never,
              depth: 0,
              overrideAccess: true,
              req,
            });
          }
        }

        /* Meaningful-change detection for the audit trail — no need to log a no-op save. */
        if (operation === "create") {
          await recordAuditEvent(req.payload, {
            action: "media_uploaded",
            summary: `رُفع ملف جديد — ${doc.filename ?? doc.id}`,
            resourceType: "media",
            resourceId: doc.id,
            req,
            details: {
              mimeType: doc.mimeType,
              filesize: doc.filesize,
              width: doc.width ?? null,
              height: doc.height ?? null,
              visibility: doc.visibility,
            },
          });
        } else if (!visibilityChanged) {
          const tracked: [string, unknown][] = [
            ["alt", doc.alt],
            ["caption", doc.caption],
            ["tags", doc.tags],
            ["focalX", doc.focalX],
            ["focalY", doc.focalY],
            ["decorative", doc.decorative],
            ["visibility", doc.visibility],
          ];
          const changedFields = tracked
            .filter(
              ([key, value]) =>
                JSON.stringify(previousDoc?.[key as keyof typeof previousDoc] ?? null) !== JSON.stringify(value ?? null),
            )
            .map(([key]) => key);
          if (changedFields.length > 0) {
            await recordAuditEvent(req.payload, {
              action: "media_updated",
              summary: `عُدّلت بيانات الملف — ${doc.filename ?? doc.id}`,
              resourceType: "media",
              resourceId: doc.id,
              req,
              details: { fields: changedFields },
            });
          }
        }

        /*
         * TARGETED invalidation (§21): the asset's own tag, plus the tags of the documents that
         * reference it — changing the logo's alt text must refresh the pages that show it, and must
         * NOT flush the whole site cache.
         */
        try {
          const references = await findMediaUsage(req.payload, doc.id);
          invalidateTags([mediaTag(doc.id as string | number), ...dependentTagsFor(references)]);
        } catch {
          invalidateTags([mediaTag(doc.id as string | number)]);
        }
        return doc;
      },
    ],

    /**
     * SAFE DELETION (§18, §19). A referenced asset is refused with a list of the exact places that
     * use it. There is no force-delete: the owner's preferred V1 is "block while referenced", and a
     * casual override is exactly how a live page ends up with a broken image.
     */
    beforeDelete: [
      async ({ id, req }) => {
        const references = await findMediaUsage(req.payload, id);
        if (references.length > 0) {
          await recordAuditEvent(req.payload, {
            action: "media_delete_blocked",
            summary: `مُنع حذف ملف مستخدم — #${id}`,
            resourceType: "media",
            resourceId: id,
            req,
            /* The refusal below rolls this operation back — the log entry must survive it. */
            detached: true,
            details: { references: references.map((reference) => `${reference.slug}.${reference.fieldPath}`) },
          });
          throw publicError(usageBlockMessage(references), 400);
        }
      },
    ],

    afterDelete: [
      async ({ doc, req }) => {
        await recordAuditEvent(req.payload, {
          action: "media_deleted",
          summary: `حُذف ملف من المكتبة — ${doc?.filename ?? doc?.id}`,
          resourceType: "media",
          resourceId: doc?.id,
          req,
        });
        invalidateTags([mediaTag(doc?.id as string | number)]);
      },
    ],
  },
  timestamps: true,
};

export type MediaPolicyConstants = {
  maxImageBytes: number;
  maxSvgBytes: number;
};

/** Surfaced to the admin UI so the upload screen states the limits instead of surprising anyone. */
export const MEDIA_POLICY_CONSTANTS: MediaPolicyConstants = {
  maxImageBytes: MAX_IMAGE_BYTES,
  maxSvgBytes: MAX_SVG_BYTES,
};

export type MediaRequest = PayloadRequest;
