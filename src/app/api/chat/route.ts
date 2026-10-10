import crypto from "crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { normalizeSaudiPhone } from "@/lib/utils";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 30;
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  if (process.env.NODE_ENV !== "production") return false;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function generateChatLeadReference(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SL-CHAT-${dateStr}-${randomSuffix}`;
}

const DEFAULT_SAUDI_SYSTEM_PROMPT = `أنت «مستشار النمو الذكي» في شركة سفن لاند (Seven Lands) — الرياض، المملكة العربية السعودية.

شخصيتك وأسلوبك:
- سعودي، مرح، راقي، ولبق جداً. ترحب بحفاوة بلهجة سعودية بيضاء محبوبة («يا هلا والله ومسهلا 👋»، «أبشر بسعدك»، «حنا في سفن لاند نختصر عليك الدرب»، «سم طال عمرك»).
- أنت مستشار تسويقي وتقني محترف وخبير في السوق السعودي وتطلعات رؤية 2030 ونمو المتاجر والشركات.
- هدفك الأساسي: مساعدة العميل، وفهم مشروعه، وبيع خدمات سفن لاند باحترافية، وإغلاق الصفقات (Deal Closing) عبر توجيهه لاتخاذ خطوة عملية واضحة.

خدماتنا — المجالات السبعة (The 7 Lands):
1. الاستراتيجية وتطوير الأعمال: دراسات السوق والتموضع التجاري وخطط التوسع.
2. الهوية والعلامة التجارية: بناء الهويات البصرية والاستراتيجية التي تترك أثراً.
3. المحتوى والإنتاج المرئي: صناعة المحتوى الإبداعي، الإنتاج الإعلاني والتصوير عالي الجودة.
4. التواصل والحضور الرقمي: إدارة حسابات التواصل وبناء المجتمعات الرقمية المؤثرة.
5. الإعلانات الرقمية والأداء (Performance): الحملات الممولة، واكتساب العملاء بأعلى عائد (ROI).
6. المواقع والمتاجر والتجارب الرقمية: متاجر سلة وزد وشوبيفاي ومواقع مخصصة فائقة السرعة.
7. البرمجيات والأتمتة والتقنية: بناء الأنظمة والأتمتة والحلول الرقمية الخاصة.

قواعد مهمة جداً:
1. سفن لاند هي شركة تسويق رقمي، هوية إبداعية، وتطوير تقني — وليست شركة استقدام أو وساطة عمالية أبداً.
2. لا تسرد كل الخدمات في رد واحد طويل وممل؛ اسأل العميل عن طبيعة مشروعه وقدّم له الحل الأنسب باختصار جذاب وتنسيق جميل مع إيموجيز لطيفة.
3. احرص دائماً على ختام ردك بطلب خطوة عملية واضحة: (مثلاً: «وش رأيك تعطيني نبذة بسيطة عن مشروعك الحالي؟»، أو «إذا تحب نحجز لك جلسة استكشافية مع فريق الاستشارات، عطني رقمك أو كلمنا واتساب مباشرة»).
4. رقم الواتساب الرسمي المباشر هو: +966507776891 ومقرنا في الرياض.`;

const DEFAULT_ENGLISH_SYSTEM_PROMPT = `You are the "AI Growth Advisor" at Seven Lands (سفن لاند) — Riyadh, Kingdom of Saudi Arabia.

Personality & Tone:
- Professional, welcoming, witty, and prestigious.
- A strategic marketing and technology consultant who understands the Saudi & GCC market, Vision 2030, and high-growth ventures.
- Primary objective: assist prospective clients, understand their project requirements, position Seven Lands' 7 core multidisciplinary capabilities, and close deals through clear next steps (booking a discovery consultation or connecting via WhatsApp).

The 7 Lands Capabilities:
1. Strategy & Business Growth
2. Branding & Creative Identity
3. Content & Media Production
4. Social & Digital Presence
5. Performance Marketing & Paid Acquisition (ROI-focused)
6. Web & Commerce Experiences (Salla, Zid, Shopify, Custom Next.js)
7. Software, Automation & Custom Technology

Key Rules:
1. Seven Lands is an integrated digital marketing and technology agency.
2. Keep answers concise, high-impact, and conversational.
3. Always end with a consultative call to action (e.g. asking about their business model, inviting them to share contact info for a tailored scope, or connecting via official WhatsApp at +966507776891).`;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: {
    message?: string;
    locale?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    leadData?: {
      name?: string;
      phone?: string;
      email?: string;
      company?: string;
      details?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ar";
  const message = body.message?.trim() || "";
  const lead = body.leadData;

  // 1. If visitor is submitting lead contact info
  if (lead && lead.name && lead.phone) {
    const normalizedPhone = normalizeSaudiPhone(lead.phone) ?? lead.phone;
    const reference = generateChatLeadReference();

    try {
      const payloadClient = await getPayload({ config });

      await payloadClient.create({
        collection: "leads",
        data: {
          reference,
          status: "NEW",
          name: lead.name.trim(),
          phone: normalizedPhone,
          company: lead.company?.trim() || (locale === "ar" ? "استفسار محادثة مباشر" : "Direct Chat Inquiry"),
          email: lead.email?.trim() || null,
          message: lead.details?.trim() || message || "طلب تواصل واستشارة عبر المحادثة المباشرة",
          scope: locale === "ar" ? "استشارة عامة عبر المحادثة" : "General consultation via chat",
          budget: "not_specified",
          timeline: "flexible",
          source: "chat_widget",
          locale,
          ipHash: crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16),
          userAgent: request.headers.get("user-agent")?.slice(0, 255) || "Unknown",
        } as never,
      });

      // Dispatch Resend Notification asynchronously
      if (process.env.RESEND_API_KEY) {
        const notifyEmail = process.env.LEAD_NOTIFICATION_RECIPIENT || "sevenlands.sa@gmail.com";
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Seven Lands <info@7-lands.com>";

        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [notifyEmail],
            subject: `[Seven Lands Chat Lead] طلب تواصل جديد: ${lead.name} (${reference})`,
            html: `
              <h2>طلب تواصل واستشارة جديد من المحادثة المباشرة</h2>
              <p><strong>الرقم المرجعي:</strong> ${reference}</p>
              <p><strong>الاسم:</strong> ${lead.name}</p>
              <p><strong>الهاتف:</strong> ${normalizedPhone}</p>
              <p><strong>البريد:</strong> ${lead.email || "غير محدد"}</p>
              <p><strong>الشركة:</strong> ${lead.company || "غير محدد"}</p>
              <p><strong>التفاصيل / الرسالة:</strong> ${lead.details || message}</p>
              <p><strong>اللغة:</strong> ${locale}</p>
            `,
          }),
        }).catch((err) => console.error("[chat] Resend notification error:", err));
      }

      return NextResponse.json({
        ok: true,
        leadCreated: true,
        reference,
        reply:
          locale === "ar"
            ? `ألف شكر لك أ/ ${lead.name}! 🌟 تم تسجيل طلبك بنجاح بالرقم المرجعي (${reference}). بيتم ربطك بمستشار النمو في سفن لاند للتواصل معك ومناقشة تفاصيل مشروعك. إذا تحب تتكلم معنا الحين مباشرة، حياك على واتساب.`
            : `Thank you, ${lead.name}! 🌟 Your request is recorded with reference (${reference}). A Seven Lands growth consultant will connect with you shortly. You may also message us immediately on WhatsApp.`,
        suggestedChips:
          locale === "ar"
            ? ["التواصل عبر واتساب", "استعراض المجالات الـ 7", "صفحة الأعمال المنجزة"]
            : ["Chat via WhatsApp", "Explore 7 Capabilities", "View Case Studies"],
      });
    } catch (err) {
      console.error("[chat] Lead creation error:", err);
      return NextResponse.json({
        ok: false,
        error: "db_error",
        reply:
          locale === "ar"
            ? "نعتذر منك، حصل خطأ بسيط أثناء حفظ البيانات. تقدر تتواصل معنا مباشرة عبر واتساب: +966507776891"
            : "An issue occurred while recording your details. Please connect directly via WhatsApp: +966507776891",
      });
    }
  }

  // 2. Fetch CMS AI configurations
  let aiConfig: {
    enabled?: boolean;
    model?: string;
    ghostmindApiKey?: string;
    systemPromptOverride?: string;
  } | undefined;

  try {
    const payloadClient = await getPayload({ config });
    const siteSettings = await payloadClient.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: true,
    });
    aiConfig = siteSettings?.ai as typeof aiConfig;
  } catch (err) {
    console.warn("[chat] Could not read CMS AI configuration:", err);
  }

  const isAiEnabled = aiConfig?.enabled !== false;
  const apiKey =
    aiConfig?.ghostmindApiKey?.trim() ||
    process.env.GHOSTMIND_API_KEY ||
    "gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g";
  const model = aiConfig?.model?.trim() || "auto";

  // 3. Conversational execution via GhostMind Core AI
  if (isAiEnabled && apiKey && message) {
    try {
      const activeSystemPrompt =
        aiConfig?.systemPromptOverride?.trim() ||
        (locale === "ar" ? DEFAULT_SAUDI_SYSTEM_PROMPT : DEFAULT_ENGLISH_SYSTEM_PROMPT);

      const conversationMessages: Array<{ role: string; content: string }> = [
        { role: "system", content: activeSystemPrompt },
      ];

      if (Array.isArray(body.history)) {
        for (const item of body.history.slice(-6)) {
          if (item && item.role && item.content) {
            conversationMessages.push({
              role: item.role === "user" ? "user" : "assistant",
              content: item.content,
            });
          }
        }
      }

      conversationMessages.push({ role: "user", content: message });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const gmRes = await fetch("https://ghostmind.optdmsa.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: conversationMessages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (gmRes.ok) {
        const gmData = await gmRes.json();
        const aiReply = gmData.choices?.[0]?.message?.content;

        if (aiReply && typeof aiReply === "string" && aiReply.trim()) {
          // Dynamic chips tailored to AI message content
          let dynamicChips: string[] = [];
          if (locale === "ar") {
            if (aiReply.includes("رقمك") || aiReply.includes("مشروعك") || aiReply.includes("جلسة") || aiReply.includes("عرض")) {
              dynamicChips = ["تزويدكم ببيانات مشروعي", "التواصل عبر واتساب", "استعراض المجالات الـ 7"];
            } else if (aiReply.includes("إعلان") || aiReply.includes("حملات")) {
              dynamicChips = ["طلب خطة إعلانية مخصصة", "التواصل عبر واتساب", "حجز جلسة استكشافية"];
            } else if (aiReply.includes("متجر") || aiReply.includes("موقع")) {
              dynamicChips = ["تطوير متجر إلكتروني", "طلب استشارة تقنية", "التواصل عبر واتساب"];
            } else {
              dynamicChips = ["حجز جلسة استكشافية", "استفسار عن المجالات الـ 7", "التواصل عبر واتساب"];
            }
          } else {
            dynamicChips = ["Share Project Scope", "Chat via WhatsApp", "Explore 7 Capabilities"];
          }

          return NextResponse.json({
            ok: true,
            reply: aiReply.trim(),
            suggestedChips: dynamicChips,
            provider: "ghostmind",
          });
        }
      } else {
        console.warn("[chat] GhostMind returned non-200 status:", gmRes.status);
      }
    } catch (err) {
      console.warn("[chat] GhostMind call failed or timed out, using intelligent fallback:", err);
    }
  }

  // 4. Deterministic Concierge Fallback (Guaranteed zero downtime)
  const lowerMsg = message.toLowerCase();
  let reply = "";
  let suggestedChips: string[] = [];

  if (locale === "ar") {
    if (lowerMsg.includes("خدم") || lowerMsg.includes("مجال") || lowerMsg.includes("أعمال") || lowerMsg.includes("lands")) {
      reply =
        "يا هلا والله! قدرات سفن لاند تتوزع عبر 7 مجالات رئيسية متكاملة:\n1. استراتيجية وتطوير الأعمال\n2. الهوية والعلامة التجارية\n3. المحتوى والإنتاج المرئي\n4. التواصل والحضور الرقمي\n5. الإعلانات الرقمية والأداء (Performance)\n6. المواقع والمتاجر والتجارب الرقمية\n7. البرمجيات والأتمتة والتقنية.\n\nوش المجال اللي يناسب تطلعات مشروعك الحين؟";
      suggestedChips = ["تزويدكم ببيانات مشروعي", "حجز جلسة استكشافية", "التواصل عبر واتساب"];
    } else if (lowerMsg.includes("سعر") || lowerMsg.includes("تكلف") || lowerMsg.includes("عرض") || lowerMsg.includes("ميزاني")) {
      reply =
        "أبشر بسعدك! في سفن لاند كل مشروع نصمم له نطاق عمل مخصص يضمن أعلى عائد تجاري. ودك نشاركك بمقترح وعرض سعر؟ عطنا تفاصيل مشروعك أو تواصل معنا مباشرة عبر واتساب.";
      suggestedChips = ["تزويدكم ببيانات مشروعي", "حجز جلسة استكشافية", "التواصل عبر واتساب"];
    } else if (lowerMsg.includes("مقر") || lowerMsg.includes("مكتب") || lowerMsg.includes("مكان") || lowerMsg.includes("رياض")) {
      reply =
        "مقرنا الرئيسي في مدينة الرياض، المملكة العربية السعودية، ونعمل مع شركائنا في مختلف مناطق المملكة والخليج. يسعدنا نلتقي بك!";
      suggestedChips = ["طلب اجتماع في الرياض", "استعراض المجالات الـ 7", "التواصل عبر واتساب"];
    } else {
      reply =
        "يا هلا والله ومسهلا في سفن لاند! 👋 أنا مستشارك هنا لمساعدتك في استكشاف خدماتنا ونمو مشروعك، أو ربطك بفريق الاستشارات في الرياض. وش طبيعة مشروعك أو استفسارك اليوم؟";
      suggestedChips = ["استفسار عن المجالات الـ 7", "طلب عرض سعر أو استشارة", "التواصل عبر واتساب"];
    }
  } else {
    if (lowerMsg.includes("service") || lowerMsg.includes("capabilities") || lowerMsg.includes("lands")) {
      reply =
        "Welcome! Seven Lands operates across 7 integrated multidisciplinary capabilities:\n1. Strategy & Business Growth\n2. Branding & Creative\n3. Content Production\n4. Social & Digital Presence\n5. Performance & Acquisition\n6. Web & Commerce Experiences\n7. Software, Automation & Technology.\n\nWhich area would you like to explore?";
      suggestedChips = ["Share Project Scope", "Branding & Design", "Chat via WhatsApp"];
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("quote") || lowerMsg.includes("budget")) {
      reply =
        "Every Seven Lands engagement is tailored to your commercial goals after an initial discovery session. To receive a tailored scope, please share your details or connect directly on WhatsApp.";
      suggestedChips = ["Share Project Scope", "Book Consultation", "Chat via WhatsApp"];
    } else {
      reply =
        "Welcome to Seven Lands! I'm your growth consultant here to explore our 7 capabilities and guide your business forward. How can we support your vision today?";
      suggestedChips = ["Explore 7 Capabilities", "Request Project Consultation", "Chat via WhatsApp"];
    }
  }

  return NextResponse.json({
    ok: true,
    reply,
    suggestedChips,
    provider: "fallback",
  });
}
