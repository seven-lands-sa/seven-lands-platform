"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { clsx } from "clsx";
import { WhatsAppIcon, ArrowRight } from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  chips?: string[];
  showLeadForm?: boolean;
}

const INVITATION_PROMPTS_AR = [
  "يا هلا والله! أنا هنا لمساعدتك في أي استفسار 👋",
  "جاهز أساعدك في اختيار الخطة الأنسب لمشروعك 🚀",
  "ودك تستشيرنا مجاناً عن نمو وتطوير متجرك؟ ✨",
  "تبي تسأل عن مجالاتنا الـ 7 أو تحجز جلسة استكشاف؟ 🤝",
  "حياك الله، اسألني عن خدماتنا وخطط التسويق الرقمي 💡",
];

const INVITATION_PROMPTS_EN = [
  "Hello! I am here to help you explore our services 👋",
  "Ready to assist you find the best plan for your project 🚀",
  "Looking for a free consultation on ecommerce growth? ✨",
  "Ask about our 7 capabilities or book a discovery session 🤝",
];

export function SalesChatWidget() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadFormActive, setLeadFormActive] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Saudi Persona floating calls-to-action
  const prompts = isAr ? INVITATION_PROMPTS_AR : INVITATION_PROMPTS_EN;
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showPromptBubble, setShowPromptBubble] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % prompts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [prompts.length]);

  // Lead inputs
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadDetails, setLeadDetails] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greeting: ChatMessage = {
      id: "init",
      sender: "bot",
      text: isAr
        ? "مرحباً بك في سفن لاند! أنا مستشارك هنا لمساعدتك في استكشاف مجالاتنا الـ 7، الإجابة عن استفساراتك، أو ربطك بمستشار النمو في الرياض."
        : "Welcome to Seven Lands! I am your concierge here to help you explore our 7 capabilities, answer strategic questions, or connect you directly with our Riyadh advisory team.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      chips: isAr
        ? ["استفسار عن الخدمات الـ 7", "طلب عرض سعر أو استشارة", "تواصل فوري عبر واتساب"]
        : ["Explore the 7 Capabilities", "Request a Project Consultation", "Direct WhatsApp Chat"],
    };
    setMessages([greeting]);
  }, [isAr]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-sales-chat", handleOpen);
    return () => window.removeEventListener("open-sales-chat", handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, leadFormActive]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    if (text === "تواصل فوري عبر واتساب" || text === "Direct WhatsApp Chat" || text === "التواصل عبر واتساب") {
      window.open("https://wa.me/966507776891?text=" + encodeURIComponent(isAr ? "السلام عليكم، أود الاستفسار عن خدمات سفن لاند" : "Hello, I would like to inquire about Seven Lands services"), "_blank");
      return;
    }

    if (
      text === "طلب عرض سعر أو استشارة" ||
      text === "Request a Project Consultation" ||
      text === "طلب عرض سعر لمشروع" ||
      text === "تزويدكم ببيانات مشروعي" ||
      text === "حجز جلسة استكشافية" ||
      text === "طلب خطة إعلانية مخصصة" ||
      text === "Share Project Scope" ||
      text === "Book Consultation"
    ) {
      setLeadFormActive(true);
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "bot",
        text: isAr
          ? "أبشر بسعدك! 🌟 يرجى تزويدنا ببيانات التواصل الأساسية ليرتبط بك مستشار النمو في سفن لاند ويعد لك دراسة ونطاق عمل مخصص:"
          : "Delighted to assist! 🌟 Please share your contact details so our growth advisor can prepare a tailored strategy for your business:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        showLeadForm: true,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      return;
    }

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "init")
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale, history }),
      });
      const data = await res.json();

      const botMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "bot",
        text: data.reply || (isAr ? "شكراً لتواصلك، كيف يمكننا مساعدتك أكثر؟" : "Thank you! How else may we assist?"),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        chips: data.suggestedChips,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "bot",
          text: isAr
            ? "نعتذر عن التأخر المؤقت. يمكنك دائماً التحدث مباشرة مع مستشارنا عبر واتساب: +966507776891"
            : "Apologies for the delay. You can always message us directly on WhatsApp: +966507776891",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          leadData: {
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            company: leadCompany,
            details: leadDetails,
          },
        }),
      });
      const data = await res.json();

      setLeadSubmitted(true);
      setLeadFormActive(false);

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "bot",
          text: data.reply || (isAr ? "تم تسجيل بياناتك بنجاح!" : "Your details have been submitted!"),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      alert(isAr ? "حدث خطأ، يرجى المحاولة لاحقاً" : "An error occurred, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        "fixed end-3 lg:end-6 z-[120] flex flex-col items-end",
        isOpen ? "bottom-3 lg:bottom-6" : "bottom-20 lg:bottom-6"
      )}
    >
      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={isAr ? "محادثة مبيعات سفن لاند" : "Seven Lands Sales Chat"}
          className="mb-2 lg:mb-4 flex h-[580px] max-h-[75vh] lg:max-h-[85vh] w-[calc(100vw-1.5rem)] sm:w-[420px] flex-col overflow-hidden rounded-[1.5rem] border border-ink-950/15 bg-white shadow-2xl transition-all duration-300"
        >
          {/* HEADER */}
          <div className="relative flex items-center justify-between border-b border-ink-950/10 bg-ink-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-emerald-400/60 bg-offwhite shadow-sm">
                <Image
                  src="/brand/advisor-avatar.webp"
                  alt={isAr ? "مستشار سفن لاند" : "Seven Lands Advisor"}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
                <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-ink-950 bg-emerald-500" />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-bold tracking-tight">
                  {isAr ? "مستشار سفن لاندز الذكي" : "Seven Lands Sales Concierge"}
                </h3>
                <p className="flex items-center gap-1.5 text-[0.75rem] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{isAr ? "مستشارك لنمو الأعمال والمبيعات · الرياض" : "Business Growth & Sales · Riyadh"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/966507776891"
                target="_blank"
                rel="noopener noreferrer"
                title={isAr ? "واتساب المباشر" : "Direct WhatsApp"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-300 transition-colors hover:bg-emerald-600 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={isAr ? "إغلاق المحادثة" : "Close chat"}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* MESSAGE STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-offwhite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "flex flex-col",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-[1.125rem] px-4 py-3 text-[0.875rem] leading-[1.7] whitespace-pre-line shadow-xs",
                    msg.sender === "user"
                      ? "bg-ink-950 text-white rounded-ee-xs"
                      : "bg-white text-ink-950 border border-ink-950/10 rounded-es-xs"
                  )}
                >
                  {msg.text}
                </div>
                <span className="mt-1 px-1 text-[0.6875rem] text-muted">
                  {msg.timestamp}
                </span>

                {/* Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="rounded-full border border-ink-950/15 bg-white px-3 py-1 text-[0.75rem] font-medium text-steel-700 transition-colors hover:border-ink-950 hover:bg-ink-950 hover:text-white"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Inline Lead Form */}
            {leadFormActive && !leadSubmitted && (
              <div className="rounded-[1.25rem] border border-ink-950/15 bg-white p-4 shadow-sm">
                <h4 className="text-[0.875rem] font-bold text-ink-950 mb-3">
                  {isAr ? "طلب استشارة ومقترح عمل" : "Consultation & Proposal Intake"}
                </h4>
                <form onSubmit={submitLead} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "الاسم الكريم *" : "Your Name *"}
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full rounded-lg border border-ink-950/15 px-3 py-2 text-[0.8125rem] focus:outline-none focus:border-ink-950"
                  />
                  <input
                    type="tel"
                    required
                    placeholder={isAr ? "رقم الهاتف / واتساب * (05xxxxxxxx)" : "Phone / WhatsApp *"}
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full rounded-lg border border-ink-950/15 px-3 py-2 text-[0.8125rem] focus:outline-none focus:border-ink-950"
                  />
                  <input
                    type="text"
                    placeholder={isAr ? "اسم الجهة أو الشركة (اختياري)" : "Company / Entity (optional)"}
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    className="w-full rounded-lg border border-ink-950/15 px-3 py-2 text-[0.8125rem] focus:outline-none focus:border-ink-950"
                  />
                  <textarea
                    rows={2}
                    placeholder={isAr ? "موجز المشروع أو الاستفسار" : "Project brief / notes"}
                    value={leadDetails}
                    onChange={(e) => setLeadDetails(e.target.value)}
                    className="w-full rounded-lg border border-ink-950/15 px-3 py-2 text-[0.8125rem] focus:outline-none focus:border-ink-950"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-ink-950 py-2 text-[0.8125rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? (isAr ? "جارٍ الإرسال..." : "Sending...") : (isAr ? "إرسال وتعيين مستشار" : "Submit & Connect")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadFormActive(false)}
                      className="rounded-lg border border-ink-950/15 px-3 py-2 text-[0.8125rem] text-steel-600 hover:bg-ink-950/5"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-1.5 text-muted text-[0.75rem] py-1">
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-steel-400" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-steel-400 [animation-delay:0.2s]" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-steel-400 [animation-delay:0.4s]" />
                <span className="ms-1.5">{isAr ? "يكتب الآن..." : "Typing..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="border-t border-ink-950/10 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAr ? "اكتب استفسارك هنا..." : "Type your message..."}
                className="flex-1 rounded-xl border border-ink-950/15 bg-offwhite px-4 py-2.5 text-[0.875rem] text-ink-950 focus:outline-none focus:border-ink-950"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                aria-label={isAr ? "إرسال" : "Send"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between px-1 text-[0.6875rem] text-muted">
              <span>{isAr ? "محادثة مشفرة وآمنة" : "Encrypted & secure"}</span>
              <a
                href="https://wa.me/966507776891"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline"
              >
                +966 50 777 6891
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SAUDI ADVISOR & INVITATION CALLOUT (Visible when chat is closed) */}
      {!isOpen && (
        <div className="relative mb-2 flex flex-col items-end pointer-events-auto">
          {/* Rotating Speech Balloon */}
          {showPromptBubble && (
            <div
              onClick={() => setIsOpen(true)}
              role="button"
              tabIndex={0}
              aria-label={isAr ? "فتح المحادثة والاستفسار" : "Open chat with advisor"}
              className={clsx(
                "group relative mb-2 max-w-[270px] sm:max-w-[320px] cursor-pointer rounded-2xl border border-ink-950/15 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-ink-950/30",
                "animate-in fade-in slide-in-from-bottom-2"
              )}
            >
              {/* Dismiss button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPromptBubble(false);
                }}
                className="absolute top-2.5 start-2.5 flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-offwhite hover:text-ink-950"
                aria-label={isAr ? "إخفاء الرسالة" : "Dismiss"}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2 ps-5 text-[0.6875rem] font-bold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{isAr ? "مستشار النمو متاح الآن · الرياض" : "Growth Advisor Online · Riyadh"}</span>
              </div>

              <p className="mt-1.5 text-[0.875rem] font-bold leading-snug text-ink-950 transition-all duration-300">
                {prompts[activePromptIndex]}
              </p>

              {/* Speech balloon arrow pointing down to character */}
              <div className="absolute -bottom-1.5 end-8 h-3 w-3 rotate-45 border-b border-e border-ink-950/15 bg-white" />
            </div>
          )}

          {/* Floating Saudi Advisor Bust Character */}
          <div
            onClick={() => setIsOpen(true)}
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label={isAr ? "تحدث مع مستشار المبيعات السعودي" : "Chat with Saudi Sales Advisor"}
          >
            {/* Subtle glow behind advisor */}
            <div className="absolute inset-0 mx-auto h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20" />

            <div className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_12px_24px_rgba(6,20,40,0.2)]">
              <Image
                src="/brand/advisor-bust.webp"
                alt={isAr ? "مستشار خدمة العملاء والمبيعات بسفن لاندز" : "Saudi Customer Care & Sales Advisor — Seven Lands"}
                fill
                sizes="112px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON (Desktop launcher) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isAr ? "فتح محادثة مستشار سفن لاند" : "Open Seven Lands Sales Chat"}
        className="hidden lg:flex group relative h-14 items-center gap-3 rounded-full bg-ink-950 px-5 text-white shadow-xl transition-all duration-300 hover:scale-[1.03] hover:bg-black active:scale-[0.98]"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[0.875rem] font-bold tracking-tight">
          {isOpen ? (isAr ? "تصغير" : "Minimize") : (isAr ? "تحدث مع مستشارنا" : "Chat with Advisor")}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-ice-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
