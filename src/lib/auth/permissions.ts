/**
 * The single source of truth for authorization in the Seven Lands Admin Control Center.
 *
 * Every permission is `resource.action`. Adding a resource means adding entries here and
 * nothing else — the admin UI, the role seeding, the access helpers and the documentation
 * all derive from this file.
 */

export type PermissionGroupKey =
  | "content"
  | "media"
  | "leads"
  | "seo"
  | "marketing"
  | "analytics"
  | "settings"
  | "users"
  | "system";

export type Permission =
  // Content — الصفحات والخدمات والأعمال والمقالات
  | "pages.read"
  | "pages.create"
  | "pages.update"
  | "pages.publish"
  | "pages.archive"
  | "pages.delete"
  | "services.read"
  | "services.update"
  | "services.publish"
  | "projects.read"
  | "projects.update"
  | "projects.publish"
  | "insights.read"
  | "insights.update"
  | "insights.publish"
  // Media — الوسائط
  | "media.read"
  | "media.upload"
  | "media.update"
  | "media.visibility"
  | "media.delete"
  | "media.svg_upload"
  // Leads — العملاء المحتملون
  | "leads.read"
  | "leads.update"
  | "leads.export"
  // SEO — تحسين الظهور
  | "seo.read"
  | "seo.update"
  // Marketing & tracking — التسويق والتتبع
  | "tracking.read"
  | "tracking.manage"
  // Analytics — التحليلات
  | "analytics.read"
  // Website settings — إعدادات الموقع
  | "settings.read"
  | "settings.general.update"
  | "settings.contact.update"
  | "settings.hours.update"
  | "settings.social.update"
  | "settings.navigation.update"
  | "settings.update"
  // Users — المستخدمون
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.suspend"
  | "users.delete"
  // System — النظام
  | "scripts.manage"
  | "roles.read"
  | "roles.manage"
  | "audit.read";

export type PermissionDefinition = {
  key: Permission;
  /** Arabic label shown in the admin. */
  label: string;
  /** Arabic explanation — what this actually allows, in business language. */
  description: string;
  /**
   * High-risk permissions can weaken security, expose personal data, execute third-party
   * code on the public site, or destroy content. They default to Super Admin only.
   */
  highRisk?: boolean;
};

export const PERMISSIONS: readonly PermissionDefinition[] = [
  // ── Content ─────────────────────────────────────────────────────────────────
  {
    key: "pages.read",
    label: "قراءة الصفحات",
    description: "الاطّلاع على الصفحات ومحتواها دون أي تعديل.",
  },
  {
    key: "pages.create",
    label: "إنشاء صفحات",
    description: "إضافة صفحات جديدة إلى الموقع.",
  },
  {
    key: "pages.update",
    label: "تعديل الصفحات",
    description: "تعديل محتوى الصفحات الحالية.",
  },
  {
    key: "pages.publish",
    label: "نشر الصفحات",
    description: "إظهار التعديلات على الموقع العام فورًا.",
  },
  {
    key: "pages.archive",
    label: "أرشفة الصفحات",
    description: "إخفاء صفحة مخصصة عن الموقع مع الاحتفاظ بها وبسجلها — لا حذف نهائي.",
  },
  {
    key: "pages.delete",
    label: "حذف الصفحات",
    description: "حذف صفحة نهائيًا. عملية غير قابلة للتراجع بعد اعتمادها.",
    highRisk: true,
  },
  {
    key: "services.read",
    label: "قراءة الخدمات",
    description: "الاطّلاع على بيانات الخدمات.",
  },
  {
    key: "services.update",
    label: "تعديل الخدمات",
    description: "تعديل وصف الخدمات ومحتواها.",
  },
  {
    key: "services.publish",
    label: "نشر الخدمات",
    description: "إظهار تعديلات الخدمات على الموقع العام.",
  },
  {
    key: "projects.read",
    label: "قراءة الأعمال",
    description: "الاطّلاع على الأعمال ومحتواها.",
  },
  {
    key: "projects.update",
    label: "تعديل الأعمال",
    description: "تعديل بيانات الأعمال ومحتواها.",
  },
  {
    key: "projects.publish",
    label: "نشر الأعمال",
    description: "إظهار تعديلات الأعمال على الموقع العام.",
  },
  {
    key: "insights.read",
    label: "قراءة المقالات",
    description: "الاطّلاع على المقالات.",
  },
  {
    key: "insights.update",
    label: "تعديل المقالات",
    description: "إضافة وتعديل المقالات.",
  },
  {
    key: "insights.publish",
    label: "نشر المقالات",
    description: "إظهار المقالات على الموقع العام.",
  },

  // ── Media ───────────────────────────────────────────────────────────────────
  {
    key: "media.read",
    label: "قراءة الوسائط",
    description: "الاطّلاع على مكتبة الصور والملفات.",
  },
  {
    key: "media.upload",
    label: "رفع الوسائط",
    description: "رفع صور وملفات جديدة إلى المكتبة.",
  },
  {
    key: "media.update",
    label: "تعديل بيانات الوسائط",
    description:
      "تعديل النص البديل والتعليق والوسوم ونقطة التركيز. لا يشمل استبدال الملف نفسه ولا تغيير الظهور.",
  },
  {
    key: "media.visibility",
    label: "تغيير ظهور الوسائط",
    description:
      "تحويل الملف بين «خاص» و«عام». «عام» يعني أن أي زائر يستطيع فتح الملف، لذلك هو قرار نشر وليس تعديلًا عاديًا.",
  },
  {
    key: "media.delete",
    label: "حذف الوسائط",
    description:
      "حذف ملفات من المكتبة. صورة مستخدمة في مكان ما لا تُحذف حتى تُزال الإشارات إليها.",
    highRisk: true,
  },
  {
    key: "media.svg_upload",
    label: "رفع ملفات SVG",
    description:
      "SVG ملف نصي قابل لتنفيذ سكربتات. الرفع محصور بمن يملك هذه الصلاحية، ويُفحص المحتوى قبل الحفظ. خطر أمني — مدير النظام فقط افتراضيًا.",
    highRisk: true,
  },

  // ── Leads ───────────────────────────────────────────────────────────────────
  {
    key: "leads.read",
    label: "قراءة العملاء المحتملين",
    description: "الاطّلاع على بيانات التواصل التي يرسلها الزوار — بيانات شخصية.",
    highRisk: true,
  },
  {
    key: "leads.update",
    label: "تعديل حالة العملاء",
    description: "تغيير حالة العميل المحتمل وإضافة ملاحظات داخلية.",
  },
  {
    key: "leads.export",
    label: "تصدير العملاء",
    description: "تنزيل قوائم العملاء المحتملين إلى ملف.",
    highRisk: true,
  },

  // ── SEO ─────────────────────────────────────────────────────────────────────
  {
    key: "seo.read",
    label: "قراءة إعدادات الظهور",
    description: "الاطّلاع على عناوين الصفحات ووصفها وبيانات المشاركة.",
  },
  {
    key: "seo.update",
    label: "تعديل إعدادات الظهور",
    description: "تعديل العناوين والأوصاف وبيانات المشاركة في محركات البحث.",
  },

  // ── Marketing & tracking ────────────────────────────────────────────────────
  {
    key: "tracking.read",
    label: "قراءة إعدادات التتبع",
    description: "الاطّلاع على أدوات التحليل والبكسل المربوطة بالموقع.",
  },
  {
    key: "tracking.manage",
    label: "إدارة أدوات التتبع",
    description:
      "ربط أو تعديل أدوات التحليل والبكسل. يتحكم بما يُحمَّل في متصفح الزائر — إضافة حساسة.",
    highRisk: true,
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  {
    key: "analytics.read",
    label: "قراءة التحليلات",
    description: "الاطّلاع على تقارير الزيارات والتحويلات.",
  },

  // ── Website settings ────────────────────────────────────────────────────────
  {
    key: "settings.read",
    label: "قراءة إعدادات الموقع",
    description: "الاطّلاع على بيانات التواصل وساعات العمل وغيرها.",
  },
  {
    key: "settings.general.update",
    label: "تعديل الهوية والإعدادات العامة",
    description:
      "اسم الشركة ووصفها والشعار وصورة المشاركة الافتراضية، ولغة الموقع والمنطقة الزمنية والموقع الجغرافي.",
  },
  {
    key: "settings.contact.update",
    label: "تعديل بيانات التواصل",
    description: "أرقام الهاتف والواتساب والبريد والعنوان التي تظهر في الموقع.",
  },
  {
    key: "settings.hours.update",
    label: "تعديل مواعيد العمل",
    description: "ساعات العمل الأسبوعية والاستثناءات (أعياد، إغلاق مؤقت، ساعات خاصة).",
  },
  {
    key: "settings.social.update",
    label: "تعديل حسابات التواصل الاجتماعي",
    description: "إضافة حسابات التواصل الاجتماعي وتعديلها وترتيبها وإظهارها أو إخفاؤها.",
  },
  {
    key: "settings.navigation.update",
    label: "تعديل الهيدر والفوتر",
    description:
      "روابط القائمة الرئيسية وزر الإجراء الأساسي وروابط الفوتر ومجموعاته ونص الحقوق.",
  },
  {
    key: "settings.update",
    label: "تعديل إعدادات النظام للموقع",
    description:
      "إعدادات متقدمة على مستوى الموقع (الظهور الافتراضي، التحليلات، الأوامر المخصصة) — لم تُنفَّذ بعد.",
    highRisk: true,
  },

  // ── Users ───────────────────────────────────────────────────────────────────
  {
    key: "users.read",
    label: "قراءة المستخدمين",
    description: "الاطّلاع على قائمة المستخدمين وأدوارهم.",
  },
  {
    key: "users.create",
    label: "إضافة مستخدمين",
    description: "إنشاء حسابات وصول جديدة للنظام.",
    highRisk: true,
  },
  {
    key: "users.update",
    label: "تعديل المستخدمين",
    description: "تعديل بيانات المستخدم ودوره داخل النظام.",
    highRisk: true,
  },
  {
    key: "users.suspend",
    label: "إيقاف المستخدمين",
    description: "إيقاف حساب أو إعادة تنشيطه، وإنهاء جلساته الحالية.",
    highRisk: true,
  },

  {
    key: "users.delete",
    label: "حذف المستخدمين",
    description: "حذف حساب مستخدم نهائيًا مع إلغاء وصوله بالكامل. عملية غير قابلة للتراجع.",
    highRisk: true,
  },

  // ── System ──────────────────────────────────────────────────────────────────
  {
    key: "scripts.manage",
    label: "إدارة الأوامر المخصصة",
    description:
      "إضافة أوامر برمجية مخصصة تعمل في متصفح الزائر. صلاحية متقدمة للمطوّرين فقط وتُسجَّل بالكامل.",
    highRisk: true,
  },
  {
    key: "roles.read",
    label: "قراءة الأدوار",
    description: "الاطّلاع على الأدوار والأذونات الممنوحة لكل دور.",
  },
  {
    key: "roles.manage",
    label: "إدارة الأدوار والأذونات",
    description: "إنشاء أدوار وتعديل الأذونات — تحكّم كامل في صلاحيات كل المستخدمين.",
    highRisk: true,
  },
  {
    key: "audit.read",
    label: "قراءة سجل الأحداث",
    description: "الاطّلاع على سجل العمليات الحساسة داخل النظام.",
    highRisk: true,
  },
] as const;

export type PermissionGroup = {
  key: PermissionGroupKey;
  label: string;
  description: string;
  permissions: readonly PermissionDefinition[];
};

/** Maps a single-prefix group to the resource prefix it owns. */
const GROUP_PREFIX: Record<PermissionGroupKey, string> = {
  content: "pages.",
  media: "media.",
  leads: "leads.",
  seo: "seo.",
  marketing: "tracking.",
  analytics: "analytics.",
  settings: "settings.",
  users: "users.",
  system: "roles.",
};

const group = (
  key: PermissionGroupKey,
  label: string,
  description: string,
): { key: PermissionGroupKey; label: string; description: string; permissions: PermissionDefinition[] } => ({
  key,
  label,
  description,
  permissions: PERMISSIONS.filter((p) => p.key.startsWith(GROUP_PREFIX[key])),
});

/**
 * The groups shown in the admin, in sidebar order. `content` and `system` are assembled
 * explicitly because they own more than one resource prefix.
 */
export const PERMISSION_GROUPS: readonly PermissionGroup[] = [
  {
    key: "content",
    label: "المحتوى",
    description: "الصفحات والخدمات والأعمال والمقالات.",
    permissions: PERMISSIONS.filter((p) =>
      ["pages.", "services.", "projects.", "insights."].some((prefix) => p.key.startsWith(prefix)),
    ),
  },
  group("media", "الوسائط", "الصور والملفات المستخدمة في الموقع."),
  group("leads", "العملاء المحتملون", "طلبات التواصل الواردة من الموقع."),
  group("seo", "تحسين الظهور", "العناوين والأوصاف وبيانات المشاركة."),
  group("marketing", "التسويق والتتبع", "أدوات التحليل والبكسل."),
  group("analytics", "التحليلات", "تقارير الزيارات والتحويلات."),
  group("settings", "إعدادات الموقع", "بيانات تظهر في كل الصفحات."),
  group("users", "المستخدمون", "حسابات الوصول إلى لوحة التحكم."),
  {
    key: "system",
    label: "النظام",
    description: "أذونات متقدمة تمسّ أمان النظام وسجلّه.",
    permissions: PERMISSIONS.filter((p) => ["scripts.", "roles.", "audit."].some((prefix) => p.key.startsWith(prefix))),
  },
] as const;

export const ALL_PERMISSIONS: readonly Permission[] = PERMISSIONS.map((p) => p.key);

export const HIGH_RISK_PERMISSIONS: readonly Permission[] = PERMISSIONS.filter((p) => p.highRisk).map((p) => p.key);

const permissionSet = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && permissionSet.has(value);
}

export function permissionDefinition(permission: Permission): PermissionDefinition | undefined {
  return PERMISSIONS.find((p) => p.key === permission);
}
