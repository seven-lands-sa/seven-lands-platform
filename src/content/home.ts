import type { AppLocale } from "@/i18n/routing";
import type { LandSlug } from "@/content/services";

/** Homepage section content that is not product data (problems, process, principles). */

export const problems: Record<
  AppLocale,
  {
    heading: string;
    lede: string;
    items: { question: string; answer: string; land: LandSlug }[];
  }
> = {
  ar: {
    heading: "نبدأ من المشكلة، لا من اسم الخدمة.",
    lede: "أربع حالات نراها كثيرًا. إن كانت إحداها تشبه وضعك، فهذا هو المدخل الصحيح.",
    items: [
      {
        question: "علامتك لا تعكس مستوى عملك؟",
        answer: "نرتب الهوية والرسالة والتجربة قبل زيادة الضجيج حولها.",
        land: "branding-creative",
      },
      {
        question: "الإعلانات تعمل، لكن النتائج غير واضحة؟",
        answer: "نربط الحملات بالقياس وصفحات الهبوط وما يحدث بعد النقرة.",
        land: "performance-acquisition",
      },
      {
        question: "موقعك موجود، لكنه لا يساعد فريق المبيعات؟",
        answer: "نعيد بناء التجربة حول ما يحتاج العميل أن يفهمه ويفعله.",
        land: "web-commerce-experiences",
      },
      {
        question: "فريقك يكرر نفس العمليات يدويًا؟",
        answer: "نبحث أين يمكن للبرمجيات والأتمتة أن تختصر الوقت وتقلل الأخطاء.",
        land: "software-automation-technology",
      },
    ],
  },
  en: {
    heading: "We start from the problem, not the service name.",
    lede: "Four situations we meet constantly. If one of them sounds like your business, that's the right door in.",
    items: [
      {
        question: "Your brand doesn't match the level of your work?",
        answer: "We put identity, message and experience in order before adding more noise.",
        land: "branding-creative",
      },
      {
        question: "Campaigns run, but the results stay fuzzy?",
        answer: "We connect campaigns to measurement, landing pages and what happens after the click.",
        land: "performance-acquisition",
      },
      {
        question: "Your site exists but doesn't help sales?",
        answer: "We rebuild the experience around what a customer must understand and do.",
        land: "web-commerce-experiences",
      },
      {
        question: "Your team repeats the same work by hand?",
        answer: "We look for where software and automation can save time and cut errors.",
        land: "software-automation-technology",
      },
    ],
  },
};

export const process: Record<
  AppLocale,
  { heading: string; lede: string; steps: { label: string; body: string }[] }
> = {
  ar: {
    heading: "من أول جلسة إلى خطوة قابلة للقياس.",
    lede: "أربع مراحل واضحة، بلا مسرحيات عملية طويلة.",
    steps: [
      { label: "نفهم", body: "نبدأ بالنشاط والسوق والمشكلة، لا بقالب جاهز." },
      { label: "نخطط", body: "نحدد الأولويات والقنوات وما الذي يجب بناؤه فعلًا." },
      { label: "نبني", body: "تعمل فرق المحتوى والتصميم والتسويق والتقنية في اتجاه واحد." },
      { label: "نقيس ونطوّر", body: "نراجع ما حدث ونحسّن بناءً على النتائج، لا الانطباعات." },
    ],
  },
  en: {
    heading: "From the first session to a measurable next step.",
    lede: "Four stages, no long process theatre.",
    steps: [
      { label: "Understand", body: "We start with the business, the market and the actual problem." },
      { label: "Plan", body: "We define priorities, channels and what truly needs to be built." },
      { label: "Build", body: "Creative, marketing and technology move together." },
      { label: "Measure & improve", body: "We learn from real performance and iterate." },
    ],
  },
};

export const principles: Record<
  AppLocale,
  { heading: string; lede: string; items: { title: string; body: string }[] }
> = {
  ar: {
    heading: "تخصصات مختلفة. قرار واحد.",
    lede: "لا نريد للعميل أن يدير خمس جهات لتنفيذ فكرة واحدة.",
    items: [
      {
        title: "قرار واحد",
        body: "الرسالة والتصميم والحملة والتقنية تُدار حول هدف تجاري واحد، لا كملفات منفصلة.",
      },
      {
        title: "تفكير تجاري أولًا",
        body: "نقيس نجاح الشغل بما يتحرك في العمل: استفسار، بيع، أو وقت يُوفَّر على الفريق.",
      },
      {
        title: "تنفيذ إبداعي وتقني في مكان واحد",
        body: "الجانب البصري والجانب التقني يعملان معًا من البداية، لا كمرحلتين منفصلتين.",
      },
      {
        title: "فهم للسوق المحلي",
        body: "نعمل من القصيم، ونعرف كيف يتصرف العميل السعودي وكيف يتخذ قراره.",
      },
    ],
  },
  en: {
    heading: "Different disciplines. One decision.",
    lede: "Nobody should manage five vendors to deliver one idea.",
    items: [
      {
        title: "One decision",
        body: "Message, design, campaign and technology run against a single commercial goal — not separate files.",
      },
      {
        title: "Business-first thinking",
        body: "Work is judged on what moves in the business: an enquiry, a sale, or hours returned to your team.",
      },
      {
        title: "Creative and technical, in one place",
        body: "Visual and technical work run together from day one, not as two separate handoffs.",
      },
      {
        title: "Local market understanding",
        body: "We work from Al Qassim and we know how Saudi customers behave and how they decide.",
      },
    ],
  },
};

export const positioning: Record<
  AppLocale,
  { heading: string; body: string; facts: { label: string; value: string }[] }
> = {
  ar: {
    heading: "نعمل كشركة واحدة، لا كخمس جهات.",
    body: "الهوية والمحتوى والحملات والمواقع والبرمجيات تحت مسؤولية فريق واحد، حول هدف تجاري واحد نتفق عليه من البداية.",
    facts: [
      { label: "نموذج العمل", value: "سبعة مجالات تحت سقف واحد" },
      { label: "نقطة البداية", value: "الهدف التجاري، ثم الخدمة" },
      { label: "المقر", value: "بريدة، القصيم" },
    ],
  },
  en: {
    heading: "One company, not five vendors.",
    body: "Brand, content, campaigns, websites and software sit with one team, against a single commercial goal agreed at the start.",
    facts: [
      { label: "Model", value: "Seven capabilities under one roof" },
      { label: "Starting point", value: "The commercial goal, then the service" },
      { label: "Based in", value: "Buraydah, Al Qassim" },
    ],
  },
};
