import type { AppLocale } from "@/i18n/routing";

/**
 * ============================================================================
 * SEVEN LANDS — CAPABILITY SYSTEM (the seven Lands)
 * ============================================================================
 * Structure per Land:
 *   slug    → /[locale]/services/[slug]
 *   number  → 01..07, the visual anchor of the system
 *   promise → outcome language, not service language
 *   problems→ the visitor's own situation, written as questions
 *   capabilities → scope areas inside the Land
 *
 * ⚠️ PENDING OWNER CONFIRMATION: the exact commercially-sold sub-services have
 * not been confirmed. Capability lists are rendered as scope areas with a
 * single, honest disclaimer (see `scopeNote`) instead of guaranteed offerings.
 * Flip items out of this file as the owner confirms or drops them.
 */

export type LandSlug =
  | "strategy-business-growth"
  | "branding-creative"
  | "content-production"
  | "social-digital-presence"
  | "performance-acquisition"
  | "web-commerce-experiences"
  | "software-automation-technology";

export type LandCopy = {
  title: string;
  /** Short label used in the path/nodes system. */
  short: string;
  promise: string;
  intro: string;
  problems: { question: string; answer: string }[];
  capabilities: string[];
  faqs: { q: string; a: string }[];
  /** Context-aware WhatsApp opener for this Land — never a generic message. */
  wa: string;
};

export type Land = {
  slug: LandSlug;
  number: string;
  /** Custom in-house SVG glyph id — see components/brand/LandGlyphs.tsx */
  glyph: string;
  copy: Record<AppLocale, LandCopy>;
};

export const scopeNote: Record<AppLocale, string> = {
  ar: "نطاق كل مجال يُحدَّد حسب المشروع بعد جلسة الفهم الأولى.",
  en: "The exact scope inside each Land is agreed per project, after the first discovery session.",
};

export const lands: Land[] = [
  {
    slug: "strategy-business-growth",
    number: "01",
    glyph: "strategy",
    copy: {
      ar: {
        title: "الاستراتيجية وتطوير الأعمال",
        short: "الاستراتيجية",
        promise: "نحدد أين تضيع الفرصة، ثم نبني خطة تتحرك على أساسها بقية التخصصات.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة استراتيجية النمو لأعمالي.",
        intro:
          "قبل التنفيذ نجيب على الأسئلة التي تحدد الاتجاه: من العميل؟ ما العرض؟ من أين تأتي النتائج؟ وأين الأولوية الآن؟ الخطة هنا ليست عرضًا تقديميًا، بل قرار بما نبدأ وبما نؤجل.",
        problems: [
          {
            question: "تصرف على أكثر من قناة ولا تعرف أي واحدة تستحق الميزانية؟",
            answer:
              "نرتب القنوات حسب الهدف والجمهور والتكلفة المتوقعة، ونحدد ما يُقاس قبل أن يُصرف عليه.",
          },
          {
            question: "لديك أفكار كثيرة، ولا خطة تُنفَّذ بالترتيب؟",
            answer: "نحوّل الأفكار إلى مراحل واضحة: ما يُبنى أولًا، وما ينتظر، ومن يعمل على ماذا.",
          },
        ],
        capabilities: [
          "استكشاف النشاط والسوق",
          "استراتيجية النمو الرقمي",
          "تحليل المنافسين",
          "رحلة العميل",
          "تطوير العرض والرسالة",
          "تخطيط الحملات",
          "مراجعة الأداء وتحديد الفرص",
        ],
        faqs: [
          {
            q: "هل نستطيع البدء بمجال واحد دون الاستراتيجية؟",
            a: "نعم. لكننا نتفق على الهدف أولًا، حتى لو كان التنفيذ في مجال واحد فقط، لأن الهدف هو ما نرجع إليه في كل قرار.",
          },
          {
            q: "ما الذي يخرج من جلسة الفهم؟",
            a: "صورة واضحة عن الوضع الحالي، والأولوية، والنطاق المقترح، والمدة، قبل أي التزام بالتنفيذ.",
          },
        ],
      },
      en: {
        title: "Strategy & Business Growth",
        short: "Strategy",
        promise:
          "We find where the opportunity is leaking, then build the plan everything else moves on.",
        wa: "Hello Seven Lands, I'd like to discuss a growth strategy for my business.",
        intro:
          "Before execution we answer the questions that set direction: who is the customer, what is the offer, where do results actually come from, and what matters first. The output is a decision about sequence, not a slide deck.",
        problems: [
          {
            question: "You are spending across channels and can't tell which one earns its budget?",
            answer:
              "We rank channels against the goal, the audience and expected cost, and define what gets measured before anything gets spent.",
          },
          {
            question: "Too many ideas, no order to execute them in?",
            answer: "We turn ideas into phases: what gets built now, what waits, and who owns what.",
          },
        ],
        capabilities: [
          "Business & market discovery",
          "Digital growth strategy",
          "Competitor analysis",
          "Customer journey planning",
          "Offer and message development",
          "Campaign planning",
          "Performance review and opportunity mapping",
        ],
        faqs: [
          {
            q: "Can we start with one discipline and skip strategy?",
            a: "Yes. We still agree the goal first, even when execution sits in one discipline, because that goal is what every decision is measured against.",
          },
          {
            q: "What comes out of a discovery session?",
            a: "A clear read on where you are today, what matters first, the recommended scope and a timeline — before you commit to any execution.",
          },
        ],
      },
    },
  },
  {
    slug: "branding-creative",
    number: "02",
    glyph: "branding",
    copy: {
      ar: {
        title: "الهوية والإبداع",
        short: "الهوية",
        promise: "نبني هوية تجعل نشاطك يُقرأ بجدية من أول نظرة.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة مشروع هوية بصرية.",
        intro:
          "نبني الهوية كنظام لا كشعار فقط: الشكل، الألوان، الخطوط، الصوت، وطريقة الظهور في كل نقطة يلتقي فيها العميل بالعلامة.",
        problems: [
          {
            question: "علامتك لا تعكس مستوى عملك؟",
            answer: "نعيد ترتيب الهوية والرسالة والتجربة قبل أن نضيف ضجيجًا حولها.",
          },
          {
            question: "تحتاج مواد احترافية للعروض والمشاركات؟",
            answer: "نُنشئ المواد التي يحتاجها فريقك فعليًا: العروض، الملفات، مواد المعارض والقوالب.",
          },
        ],
        capabilities: [
          "الهوية البصرية",
          "أنظمة العلامة",
          "تصميم الشعارات",
          "دليل استخدام الهوية",
          "ملفات الشركة والعروض التقديمية",
          "تصميم الحملات",
          "المواد المطبوعة",
          "مواد المعارض والرول أب والتغليف عند الحاجة",
        ],
        faqs: [
          {
            q: "هل تستلمون هوية قائمة ونكمل عليها؟",
            a: "نعم. نراجع ما هو موجود، ثم نحدد ما يحتاج ضبطًا وما يحتاج بناءً جديدًا، دون هدم ما يعرفه جمهورك.",
          },
          {
            q: "هل نسلم ملفات قابلة للتعديل؟",
            a: "نعم، مع دليل استخدام يوضح الحد الأدنى للتطبيق الصحيح للهوية.",
          },
        ],
      },
      en: {
        title: "Branding & Creative",
        short: "Branding",
        promise: "An identity that makes your business read as serious from the first look.",
        wa: "Hello Seven Lands, I'd like to discuss a brand identity project.",
        intro:
          "We build identity as a system, not a logo: form, colour, type, voice and how the brand behaves at every point a customer meets it.",
        problems: [
          {
            question: "Your brand doesn't match the level of your work?",
            answer: "We put identity, message and experience in order before adding noise around them.",
          },
          {
            question: "You need credible material for pitches and events?",
            answer:
              "We produce what your team actually uses: company profiles, decks, exhibition material and templates.",
          },
        ],
        capabilities: [
          "Visual identity",
          "Brand systems",
          "Logo design",
          "Brand guidelines",
          "Company profiles & presentations",
          "Campaign design",
          "Print collateral",
          "Event material, roll-ups and packaging where relevant",
        ],
        faqs: [
          {
            q: "Can you work with an existing identity?",
            a: "Yes. We review what exists, then decide what needs tightening and what needs building — without discarding what your audience already recognises.",
          },
          {
            q: "Do we receive editable files?",
            a: "Yes, with guidelines covering the minimum needed to apply the identity correctly.",
          },
        ],
      },
    },
  },
  {
    slug: "content-production",
    number: "03",
    glyph: "content",
    copy: {
      ar: {
        title: "المحتوى والإنتاج",
        short: "المحتوى",
        promise: "محتوى يشرح ما تقدمه ويحفظ علامتك في ذاكرة العميل.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة إنتاج محتوى لعلامتنا.",
        intro:
          "من الكتابة إلى التصوير والمونتاج، ننتج محتوى يخدم هدفًا واضحًا: أن يفهم العميل، وأن يثق، وأن يتحرك.",
        problems: [
          {
            question: "تنشر باستمرار ولا شيء يثبت؟",
            answer: "نبني المحتوى على زوايا ورسائل متكررة تحفظ العلامة في ذهن العميل.",
          },
          {
            question: "محتواك يشرح المنتج ولا يقنع؟",
            answer: "نعيد كتابة الرسالة حول ما يهم العميل، لا حول ما نريد قوله عنه.",
          },
        ],
        capabilities: [
          "استراتيجية المحتوى",
          "كتابة النصوص",
          "محتوى حسابات التواصل",
          "التصوير الفوتوغرافي",
          "تصوير المنتجات",
          "الفيديوهات التسويقية",
          "الريلز والفيديو القصير",
          "إنتاج محتوى UGC",
          "المونتاج",
          "الموشن جرافيك",
        ],
        faqs: [
          {
            q: "هل تستلمون محتوى نكتبه وننتجه؟",
            a: "ننفذ الإنتاج، ونراجع الجودة، ونعيد بناء ما يحتاج تعديلًا حسب خطة النشر.",
          },
          {
            q: "هل يمكن تنفيذ التصوير داخل مقرنا؟",
            a: "نعم، نحدد النطاق والموقع والأيام المطلوبة قبل التنفيذ.",
          },
        ],
      },
      en: {
        title: "Content & Production",
        short: "Content",
        promise: "Content that explains what you offer and keeps your brand in the customer's memory.",
        wa: "Hello Seven Lands, I'd like to discuss content production for our brand.",
        intro:
          "From writing to shooting and editing, we produce content against one clear job: make the customer understand, believe, and act.",
        problems: [
          {
            question: "You publish constantly and nothing sticks?",
            answer: "We build content on repeatable angles and messages that keep the brand in mind.",
          },
          {
            question: "Your content describes the product but never persuades?",
            answer: "We rewrite the message around what the customer cares about, not what we want to say.",
          },
        ],
        capabilities: [
          "Content strategy",
          "Copywriting",
          "Social content",
          "Photography",
          "Product photography",
          "Marketing videos",
          "Reels and short-form video",
          "UGC production",
          "Editing",
          "Motion graphics",
        ],
        faqs: [
          {
            q: "Can we produce content in-house with your direction?",
            a: "Yes. We can lead production, review quality, and rebuild whatever needs work against the publishing plan.",
          },
          {
            q: "Can shoots happen at our premises?",
            a: "Yes. Scope, location and shoot days are agreed before production starts.",
          },
        ],
      },
    },
  },
  {
    slug: "social-digital-presence",
    number: "04",
    glyph: "social",
    copy: {
      ar: {
        title: "التواصل والحضور الرقمي",
        short: "التواصل",
        promise: "حضور مستمر ومنظم بدل حسابات تنشر بلا اتجاه.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة إدارة حسابات التواصل والحضور الرقمي.",
        intro:
          "نُدير الحسابات بخطة وإيقاع ومحتوى واضح، لا بردود فعل يومية. الهدف أن يكون الحساب نقطة ثقة وتحويل، لا أرشيف صور.",
        problems: [
          {
            question: "الحسابات تعمل، لكن بلا نتيجة تجارية واضحة؟",
            answer: "نربط النشر بأهداف محددة: استفسار، زيارة، عملية شراء، أو بناء ثقة قبل البيع.",
          },
          {
            question: "لا وقت لديك لمتابعة النشر والردود؟",
            answer: "نتولى التخطيط والنشر والمتابعة، مع تقرير دوري واضح.",
          },
        ],
        capabilities: [
          "إدارة حسابات التواصل",
          "التخطيط والنشر",
          "إدارة التفاعل والردود",
          "تحسين الحسابات",
          "التقويم الشهري للمحتوى",
          "الحملات الموسمية",
          "دعم الظهور في خرائط جوجل",
        ],
        faqs: [
          {
            q: "هل تُدار الحسابات بموافقتنا على كل منشور؟",
            a: "نعمل بإيقاع موافقات متفق عليه مسبقًا حتى لا يتوقف النشر ولا تتحول المراجعة إلى عمل إضافي عليك.",
          },
          {
            q: "هل تشمل الإدارة الردود على الرسائل؟",
            a: "تُحدد حسب النطاق: إدارة التفاعل العام، أو المتابعة الكاملة للرسائل مع تسليم الاستفسارات لفريقك.",
          },
        ],
      },
      en: {
        title: "Social & Digital Presence",
        short: "Social",
        promise: "A consistent, organised presence instead of accounts that post without direction.",
        wa: "Hello Seven Lands, I'd like to discuss managing our social accounts and digital presence.",
        intro:
          "We run accounts on a plan, a rhythm and clear content — not on daily reaction. The account should build trust and produce enquiries, not accumulate images.",
        problems: [
          {
            question: "The accounts run, but without a commercial outcome?",
            answer:
              "We tie publishing to defined outcomes: an enquiry, a visit, a sale, or trust built ahead of the sale.",
          },
          {
            question: "No time left to publish and reply?",
            answer: "We take on planning, publishing and community management, with a clear periodic report.",
          },
        ],
        capabilities: [
          "Social media management",
          "Planning and publishing",
          "Community and replies management",
          "Account optimisation",
          "Monthly content calendar",
          "Seasonal campaigns",
          "Google Business Profile support",
        ],
        faqs: [
          {
            q: "Do we approve every post?",
            a: "We agree an approval rhythm up front, so publishing never stalls and reviewing never becomes extra work for you.",
          },
          {
            q: "Does management cover direct messages?",
            a: "Scope decides it: public engagement only, or full message handling with enquiries handed back to your team.",
          },
        ],
      },
    },
  },
  {
    slug: "performance-acquisition",
    number: "05",
    glyph: "performance",
    copy: {
      ar: {
        title: "الإعلانات واكتساب العملاء",
        short: "الإعلانات",
        promise: "نربط الإنفاق بهدف واضح، ونقيس ما يحدث بعد النقرة.",
        wa: "مرحبا سفن لاند، أرغب في الاستفسار عن إدارة الحملات الإعلانية.",
        intro:
          "نخطط الحملة، نبني صفحة الهبوط، نضبط القياس، ثم نحسّن بناءً على أرقام حقيقية. لا نطلب زيادة الميزانية قبل أن نعرف أين تذهب النتائج.",
        problems: [
          {
            question: "تصرف على الإعلانات ولا تعرف أين تضيع النتائج؟",
            answer: "نضبط القياس وأحداث التحويل أولًا، ثم نعيد توزيع الميزانية على ما يثبت أنه يعمل.",
          },
          {
            question: "الاستفسارات قليلة أو غير مؤهلة؟",
            answer: "نراجع الرسالة والجمهور وصفحة الهبوط معًا، لأن مشكلة الجودة غالبًا ليست في الإعلان وحده.",
          },
        ],
        capabilities: [
          "إعلانات جوجل",
          "إعلانات ميتا",
          "إعلانات تيك توك",
          "إعلانات سناب شات",
          "توليد العملاء المحتملين",
          "إعادة الاستهداف",
          "تتبع التحويلات",
          "صفحات هبوط للحملات",
          "التحليلات",
          "تحسين معدل التحويل",
          "تقارير الأداء",
        ],
        faqs: [
          {
            q: "من يملك الحساب الإعلاني والميزانية؟",
            a: "الملكية لك دائمًا. نعمل داخلها، وتذهب الميزانية مباشرة إلى المنصات دون وسيط.",
          },
          {
            q: "ما الذي نقيسه في التقارير؟",
            a: "ما يهم قرار العمل: تكلفة الاستفسار، جودة العميل المحتمل، وما بعد النقرة. لا نعرض أرقامًا بلا معنى تجاري.",
          },
        ],
      },
      en: {
        title: "Performance & Acquisition",
        short: "Performance",
        promise: "Spend tied to a clear goal, measured on what happens after the click.",
        wa: "Hello Seven Lands, I'd like to ask about managing our ad campaigns.",
        intro:
          "We plan the campaign, build the landing page, set up measurement, then optimise on real numbers. Nobody gets asked for more budget before we can show where results come from.",
        problems: [
          {
            question: "You spend on ads and can't see where results are lost?",
            answer:
              "We fix measurement and conversion events first, then move budget toward what proves it works.",
          },
          {
            question: "Enquiries are few, or poorly qualified?",
            answer:
              "We review the message, the audience and the landing page together — lead quality is rarely an ad-only problem.",
          },
        ],
        capabilities: [
          "Google Ads",
          "Meta Ads",
          "TikTok Ads",
          "Snapchat Ads",
          "Lead generation",
          "Retargeting",
          "Conversion tracking",
          "Campaign landing pages",
          "Analytics",
          "Conversion rate optimisation",
          "Performance reporting",
        ],
        faqs: [
          {
            q: "Who owns the ad accounts and the budget?",
            a: "You do, always. We work inside your accounts and media spend goes directly to the platforms.",
          },
          {
            q: "What appears in reporting?",
            a: "What changes a business decision: cost per enquiry, lead quality and post-click behaviour — not numbers without commercial meaning.",
          },
        ],
      },
    },
  },
  {
    slug: "web-commerce-experiences",
    number: "06",
    glyph: "web",
    copy: {
      ar: {
        title: "المواقع والمتاجر والتجارب الرقمية",
        short: "المواقع",
        promise: "نبني موقعًا يشرح خدمتك بوضوح ويقود العميل إلى الخطوة التالية.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة مشروع موقع إلكتروني.",
        intro:
          "نعيد ترتيب تجربة الزائر حول ما يحتاج أن يفهمه وما يجب أن يفعله، ثم نبني الموقع أو المتجر على هذا الأساس، مع أساس تقني سليم للظهور في البحث.",
        problems: [
          {
            question: "موقعك موجود، لكنه لا يساعد فريق المبيعات؟",
            answer: "نبني الصفحة حول الاعتراضات الحقيقية: ماذا تسأل عنك قبل أن تتصل؟ نجيب عليها في الصفحة.",
          },
          {
            question: "متجرك يعمل، والعملاء يتوقفون قبل إتمام الطلب؟",
            answer: "نراجع خطوات الشراء والثقة والدفع والسرعة، ونعالج نقاط التوقف بالأولوية.",
          },
        ],
        capabilities: [
          "مواقع الشركات",
          "صفحات الهبوط",
          "المتاجر الإلكترونية",
          "مواقع الحجز والخدمات",
          "تجربة وواجهة المستخدم",
          "بوابات العملاء",
          "تحسين الظهور في محركات البحث من الأساس التقني",
          "تطوير على ووردبريس أو تطوير مخصص حسب الحالة",
        ],
        faqs: [
          {
            q: "هل تبنون على ووردبريس أم بكود مخصص؟",
            a: "نختار حسب الحالة: ما يحتاجه النشاط، من سيديره، والمدة، والميزانية. لا نفرض تقنية واحدة على كل مشروع.",
          },
          {
            q: "هل الموقع سيكون قابلًا للتوسع لاحقًا؟",
            a: "نبني الأساس بحيث يمكن إضافة صفحات وأقسام وحالات استخدام دون إعادة البناء من الصفر.",
          },
        ],
      },
      en: {
        title: "Web, Commerce & Digital Experiences",
        short: "Web",
        promise: "A website that explains your service clearly and moves the customer to the next step.",
        wa: "Hello Seven Lands, I'd like to discuss a website project.",
        intro:
          "We regroup the visitor's experience around what they need to understand and what they should do, then build the site or store on that foundation — with a technical base search engines can read.",
        problems: [
          {
            question: "Your website exists but doesn't help the sales team?",
            answer:
              "We build around the real objections: what does a customer ask before calling? The page answers it.",
          },
          {
            question: "The store works, but customers stop before checkout?",
            answer:
              "We audit steps, trust signals, payment and speed, then fix drop-off points in priority order.",
          },
        ],
        capabilities: [
          "Corporate websites",
          "Landing pages",
          "E-commerce",
          "Booking and service websites",
          "UX/UI",
          "Customer portals",
          "Technical SEO foundation",
          "WordPress or custom development, chosen per case",
        ],
        faqs: [
          {
            q: "Do you build on WordPress or with custom code?",
            a: "It depends on the case: what the business needs, who will run it, the timeline and the budget. We don't impose one stack on every project.",
          },
          {
            q: "Will the site be able to grow later?",
            a: "We build the foundation so pages, sections and new use cases can be added without starting over.",
          },
        ],
      },
    },
  },
  {
    slug: "software-automation-technology",
    number: "07",
    glyph: "technology",
    copy: {
      ar: {
        title: "البرمجيات والأتمتة والتقنية",
        short: "التقنية",
        promise: "نبني أنظمة وأتمتة تختصر العمل اليدوي وتربط الأنظمة ببعضها.",
        wa: "مرحبا سفن لاند، أرغب في مناقشة نظام أو أتمتة لأعمالنا.",
        intro:
          "عندما تتكرر المهام أو تتفرق البيانات بين الأنظمة، نبني الأنظمة والربط والأتمتة التي تنظّم العمل وتُوفر وقت الفريق.",
        problems: [
          {
            question: "فريقك يكرر نفس العمليات يدويًا؟",
            answer: "نحدد المهام المتكررة ونبني أتمتة تنفذها بدقة، مع مراجعة بشرية عند الحاجة.",
          },
          {
            question: "بياناتك موزعة على أكثر من نظام؟",
            answer: "نربط الأنظمة ونجمع ما يهم القرار في مكان واحد قابل للمتابعة.",
          },
        ],
        capabilities: [
          "أنظمة وبرمجيات مخصصة",
          "لوحات المعلومات والبوابات",
          "حلول مرتبطة بإدارة العملاء",
          "الربط والتكامل بين الأنظمة",
          "واجهات برمجية (API)",
          "حلول واتساب للأعمال",
          "أتمتة العمليات",
          "تكاملات الذكاء الاصطناعي",
          "المساعدات والردود الآلية",
          "تطبيقات الجوال حسب النطاق",
          "الاستضافة والنطاقات والبريد الاحترافي",
          "الصيانة والدعم الفني",
        ],
        faqs: [
          {
            q: "هل تُبنى الأنظمة حسب عملنا تحديدًا؟",
            a: "نعم، نبدأ من العملية نفسها لا من قالب جاهز، لأن النظام يجب أن يشبه طريقة عمل الفريق لا العكس.",
          },
          {
            q: "هل تستلمون أنظمة قائمة؟",
            a: "نراجع الحالة التقنية أولًا، ثم نحدد هل الأصلح هو التطوير أو إعادة البناء، بتكلفة ومخاطر واضحة.",
          },
        ],
      },
      en: {
        title: "Software, Automation & Technology",
        short: "Technology",
        promise:
          "Systems and automation that cut manual work and connect the tools you already run on.",
        wa: "Hello Seven Lands, I'd like to discuss software or automation for our business.",
        intro:
          "When tasks repeat or data lives in separate systems, we build the software, integrations and automation that organise the work and give the team its time back.",
        problems: [
          {
            question: "Your team repeats the same work by hand?",
            answer:
              "We map the repetitive tasks and automate them reliably, with human review where it belongs.",
          },
          {
            question: "Your data sits across multiple systems?",
            answer: "We connect systems and surface what decisions need in one monitorable place.",
          },
        ],
        capabilities: [
          "Custom software",
          "Dashboards and portals",
          "CRM-related solutions",
          "System integration",
          "APIs",
          "WhatsApp business solutions",
          "Business process automation",
          "AI integrations",
          "Assistants and automated replies",
          "Mobile applications, when in scope",
          "Hosting, domains and business email",
          "Maintenance and technical support",
        ],
        faqs: [
          {
            q: "Is software built around our process?",
            a: "Yes. We start from the process itself, not a template — the system should fit how the team works, not the reverse.",
          },
          {
            q: "Can you take over an existing system?",
            a: "We assess the current state first, then recommend extending or rebuilding, with the cost and risk of each route made clear.",
          },
        ],
      },
    },
  },
];

export const landBySlug = new Map(lands.map((land) => [land.slug, land]));
