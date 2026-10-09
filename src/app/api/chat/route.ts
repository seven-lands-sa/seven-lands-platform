import crypto from "crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { normalizeSaudiPhone } from "@/lib/utils";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
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

  // If visitor is submitting lead contact info
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
            ? `شكراً لك أ/ ${lead.name}! تم تسجيل طلبك بنجاح بالرقم المرجعي (${reference}). سيتواصل معك مستشار النمو في سفن لاند قريباً جداً. يمكنك أيضاً التحدث معنا مباشرة عبر واتساب للمتابعة الفورية.`
            : `Thank you, ${lead.name}! Your request has been recorded with reference (${reference}). A Seven Lands growth advisor will reach out shortly. You can also connect directly via WhatsApp.`,
      });
    } catch (err) {
      console.error("[chat] Lead creation error:", err);
      return NextResponse.json({
        ok: false,
        error: "db_error",
        reply:
          locale === "ar"
            ? "نعتذر عن حدوث خطأ أثناء تسجيل البيانات. يمكنك التواصل معنا مباشرة عبر واتساب: +966507776891"
            : "We encountered an issue saving your request. Please message us directly on WhatsApp: +966507776891",
      });
    }
  }

  // Conversational response generation (Deterministic Concierge V1)
  const lowerMsg = message.toLowerCase();

  let reply = "";
  let suggestedChips: string[] = [];

  if (locale === "ar") {
    if (lowerMsg.includes("خدم") || lowerMsg.includes("مجال") || lowerMsg.includes("أعمال") || lowerMsg.includes("lands")) {
      reply =
        "تتوزع قدرات سفن لاند عبر 7 مجالات رئيسية متكاملة:\n1. استراتيجية ونمو الأعمال\n2. الهوية والعلامة التجارية\n3. الإنتاج الإبداعي وصناعة المحتوى\n4. التواجد الرقمي والشبكات\n5. الأداء واكتساب العملاء\n6. التجارب الرقمية والتجارة\n7. البرمجيات والأتمتة والتقنية.\n\nهل تود استكشاف مجال معين أو مشاركة نطاق مشروعك لنرشدك؟";
      suggestedChips = ["طلب عرض سعر لمشروع", "استراتيجية ونمو", "الهوية والتصميم", "التواصل عبر واتساب"];
    } else if (lowerMsg.includes("سعر") || lowerMsg.includes("تكلف") || lowerMsg.includes("عرض") || lowerMsg.includes("ميزاني")) {
      reply =
        "في سفن لاند نصمم نطاق العمل بدقة وفقاً لأهداف كل مشروع وطبيعته الاستراتيجية بعد جلسة فهم وتشخيص أولى. لتزويدك بمقترح مخصص، يسعدنا تزويدنا ببياناتك أو التواصل مباشرة مع فريق الاستشارات.";
      suggestedChips = ["تزويدكم ببيانات المشروع", "حجز جلسة استشارية", "تواصل واتساب فوري"];
    } else if (lowerMsg.includes("مقر") || lowerMsg.includes("مكتب") || lowerMsg.includes("مكان") || lowerMsg.includes("رياض")) {
      reply =
        "يقع مقر سفن لاند الرئيسي في مدينة الرياض، المملكة العربية السعودية. ونعمل مع شركائنا ونقود مشاريعنا محلياً وفي كافة أنحاء الخليج.";
      suggestedChips = ["طلب اجتماع في الرياض", "خدماتنا", "تواصل واتساب"];
    } else {
      reply =
        "مرحباً بك في سفن لاند! أنا مستشارك هنا لمساعدتك في استكشاف خدماتنا، أو ربطك بمستشار النمو، أو بدء مشروع جديد. كيف يمكننا مساعدتك اليوم؟";
      suggestedChips = ["استفسار عن الخدمات الـ 7", "طلب عرض سعر أو استشارة", "تواصل فوري عبر واتساب"];
    }
  } else {
    if (lowerMsg.includes("service") || lowerMsg.includes("capabilities") || lowerMsg.includes("lands")) {
      reply =
        "Seven Lands operates across 7 integrated multidisciplinary capabilities:\n1. Strategy & Business Growth\n2. Branding & Creative\n3. Content Production\n4. Social & Digital Presence\n5. Performance & Acquisition\n6. Web & Commerce Experiences\n7. Software, Automation & Technology.\n\nWhich area would you like to explore for your business?";
      suggestedChips = ["Request a Project Proposal", "Branding & Design", "Strategy & Growth", "Chat via WhatsApp"];
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("quote") || lowerMsg.includes("budget")) {
      reply =
        "Every Seven Lands engagement is tailored specifically to your commercial goals after an initial discovery session. To receive a tailored scope, please share your project details or connect directly with our advisory team.";
      suggestedChips = ["Share Project Details", "Book Consultation", "WhatsApp Quick Connect"];
    } else if (lowerMsg.includes("riyadh") || lowerMsg.includes("location") || lowerMsg.includes("office")) {
      reply =
        "Seven Lands is headquartered in Riyadh, Kingdom of Saudi Arabia, partnering with enterprises and high-growth ventures across the Kingdom and GCC.";
      suggestedChips = ["Book a Meeting in Riyadh", "Our Capabilities", "WhatsApp Contact"];
    } else {
      reply =
        "Welcome to Seven Lands! I'm here to assist you in exploring our 7 capabilities, answering strategic questions, or connecting you with a growth consultant. How can we help today?";
      suggestedChips = ["Explore the 7 Capabilities", "Request a Project Consultation", "Direct WhatsApp Chat"];
    }
  }

  return NextResponse.json({
    ok: true,
    reply,
    suggestedChips,
  });
}
