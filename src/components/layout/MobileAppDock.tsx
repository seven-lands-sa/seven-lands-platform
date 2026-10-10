"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { clsx } from "clsx";

interface MobileAppDockProps {
  locale: string;
}

export function MobileAppDock({ locale }: MobileAppDockProps) {
  const pathname = usePathname();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActive = (path: string) => {
    if (path === "/" || path === "") {
      return pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";
    }
    return pathname.includes(path);
  };

  const openChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-sales-chat"));
    }
  };

  return (
    <div
      className="fixed bottom-3 inset-x-3 z-40 lg:hidden pointer-events-none flex justify-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <nav
        aria-label={isAr ? "التنقل السريع للجوال" : "Mobile Quick Dock"}
        className="pointer-events-auto flex items-center justify-between gap-1 w-full max-w-[390px] px-2 py-1.5 rounded-full bg-ink-950/92 backdrop-blur-xl border border-white/15 shadow-[0_12px_36px_rgba(6,20,40,0.45)] text-white/70"
      >
        {/* Home */}
        <Link
          href="/"
          className={clsx(
            "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-full text-[0.6875rem] font-medium transition-all duration-200 active:scale-90",
            isActive("/") ? "text-white font-bold bg-white/10" : "hover:text-white"
          )}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/") ? 2.2 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="tracking-tight">{isAr ? "الرئيسية" : "Home"}</span>
        </Link>

        {/* Services / Lands */}
        <Link
          href="/services"
          className={clsx(
            "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-full text-[0.6875rem] font-medium transition-all duration-200 active:scale-90",
            isActive("/services") ? "text-white font-bold bg-white/10" : "hover:text-white"
          )}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/services") ? 2.2 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="tracking-tight">{isAr ? "المجالات" : "Lands"}</span>
        </Link>

        {/* Work */}
        <Link
          href="/work"
          className={clsx(
            "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-full text-[0.6875rem] font-medium transition-all duration-200 active:scale-90",
            isActive("/work") ? "text-white font-bold bg-white/10" : "hover:text-white"
          )}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/work") ? 2.2 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="tracking-tight">{isAr ? "أعمالنا" : "Work"}</span>
        </Link>

        {/* Chat / Concierge Trigger */}
        <button
          type="button"
          onClick={openChat}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-full text-[0.6875rem] font-medium hover:text-white transition-all duration-200 active:scale-90 cursor-pointer"
          aria-label={isAr ? "محادثة المساعد" : "Open Concierge Chat"}
        >
          <div className="relative mb-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-0.5 -end-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ice-400" />
            </span>
          </div>
          <span className="tracking-tight">{isAr ? "المساعد" : "Concierge"}</span>
        </button>

        {/* Start Project CTA Pill */}
        <Link
          href="/start-a-project"
          className="flex items-center gap-1.5 bg-ice-400 text-ink-950 font-bold px-3.5 py-2 rounded-full text-[0.75rem] shadow-sm hover:bg-ice-400/90 transition-all duration-200 active:scale-95 shrink-0"
        >
          <span>{isAr ? "ابدأ مشروعك" : "Start"}</span>
          <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
