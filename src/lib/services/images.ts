/**
 * SEVEN LANDS — VISUAL MEDIA REGISTRY
 *
 * Dedicated authentic photographic assets for the 7 Lands and editorial sections.
 * Formatted as WebP with high-resolution source and responsive sizing.
 */

export interface ServiceMediaAsset {
  src: string;
  altAr: string;
  altEn: string;
}

export const SERVICE_MEDIA: Record<string, ServiceMediaAsset> = {
  "strategy-business-growth": {
    src: "/media/services/01-strategy-growth.webp",
    altAr: "استراتيجية ونمو الأعمال — مقر سفن لاند في الرياض وإطلالة مركز الملك عبدالله المالي",
    altEn: "Strategy & Business Growth — Seven Lands Riyadh Boardroom with KAFD Skyline",
  },
  "branding-creative": {
    src: "/media/services/02-branding-creative.webp",
    altAr: "الهوية والعلامة التجارية — حرفية التصميم والخط العربي والمطبوعات الفاخرة",
    altEn: "Branding & Creative Identity — Typography Craft, Arabic Calligraphy & Tactile Print",
  },
  "content-production": {
    src: "/media/services/03-content-production.webp",
    altAr: "الإنتاج الإبداعي وصناعة المحتوى — كاميرات سينمائية واستوديو متكامل في الرياض",
    altEn: "Creative Content Production — Cinema Optics, Anamorphic Rig & Studio Lighting",
  },
  "social-digital-presence": {
    src: "/media/services/04-social-presence.webp",
    altAr: "التواجد الرقمي والشبكات — إدارة الحملات وصناعة التأثير واستوديو المحتوى",
    altEn: "Social & Digital Presence — Content Command Center & Campaign Production",
  },
  "performance-acquisition": {
    src: "/media/services/05-performance-acquisition.webp",
    altAr: "الأداء واكتساب العملاء — تحليلات وبيانات دقيقة لنمو المبيعات ونماذج الإسناد",
    altEn: "Performance & Acquisition — Growth Marketing Telemetry & Conversion Funnel",
  },
  "web-commerce-experiences": {
    src: "/media/services/06-web-experiences.webp",
    altAr: "التجارب الرقمية والتجارة — مواقع وتطبيقات تفاعلية متقدمة ومتاجر إلكترونية رائدة",
    altEn: "Web & Commerce Experiences — Flagship Digital Platforms & Responsive UI",
  },
  "software-automation-technology": {
    src: "/media/services/07-technology-automation.webp",
    altAr: "البرمجيات والأتمتة والتقنية — حلول سحابية وأنظمة رقمية متطورة وهندسة برمجية",
    altEn: "Software, Automation & Technology — Cloud Infrastructure & Backend Systems",
  },
};

export const CRAFT_MEDIA = {
  identity: {
    serviceSlug: "branding-creative",
    src: "/media/craft/craft-identity-system.webp",
    titleAr: "هندسة الهوية والعلامة التجارية",
    titleEn: "Brand Identity Architecture",
    descAr: "بناء أدلة بصرية متكاملة، ونظم طباعة راقية، ومعايير تصميم تتجاوز المؤقت.",
    descEn: "Comprehensive visual systems, refined typography, and enduring design standards.",
  },
  flagship: {
    serviceSlug: "web-commerce-experiences",
    src: "/media/craft/craft-digital-flagship.webp",
    titleAr: "منصات وتجارب التجارة الرقمية",
    titleEn: "Digital Commerce Flagships",
    descAr: "واجهات تفاعلية سريعة وتجارب شراء سلسة مبنية على أحدث تقنيات الويب السحابية.",
    descEn: "Ultra-fast interactive interfaces and seamless checkout on modern cloud tech.",
  },
  film: {
    serviceSlug: "content-production",
    src: "/media/craft/craft-commercial-film.webp",
    titleAr: "الإنتاج السينمائي والتصوير التجاري",
    titleEn: "Cinematic Film & Commercials",
    descAr: "إخراج سينمائي ومعدات تصوير عالمية تعكس هيبة العلامة التجارية وروح السعودية.",
    descEn: "Cinematic direction and global-standard optics reflecting Saudi ambition.",
  },
  growth: {
    serviceSlug: "performance-acquisition",
    src: "/media/craft/craft-growth-engine.webp",
    titleAr: "محركات النمو والأداء الرقمي",
    titleEn: "Growth & Performance Engines",
    descAr: "تحسين تكلفة الاكتساب، وتوجيه الميزانيات بدقة رياضية، وربط القنوات بعائد حقيقي.",
    descEn: "CAC optimization, mathematical ad allocation, and transparent ROI attribution.",
  },
};
