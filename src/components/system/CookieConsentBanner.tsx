"use client";

import { useSyncExternalStore, useState, useEffect } from "react";
import type { ConsentSettingsView } from "@/lib/content/views";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  getStoredConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";

interface CookieConsentBannerProps {
  settings: ConsentSettingsView;
  locale: string;
}

const emptySubscribe = () => () => {};

function getClientMounted(): boolean {
  return true;
}

function getServerMounted(): boolean {
  return false;
}

export function CookieConsentBanner({ settings, locale }: CookieConsentBannerProps) {
  const mounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [manualOpen, setManualOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    const onOpenPreferences = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalyticsAllowed(current.analytics);
        setMarketingAllowed(current.marketing);
      }
      setManualOpen(true);
      setShowPreferences(true);
    };

    window.addEventListener("sevenlands:open_consent_preferences", onOpenPreferences);
    return () => {
      window.removeEventListener("sevenlands:open_consent_preferences", onOpenPreferences);
    };
  }, []);

  if (!mounted || !settings.enabled) {
    return null;
  }

  // Show banner if no consent is recorded or manual preferences triggered
  const showBanner = manualOpen || consent === null;
  if (!showBanner) {
    return null;
  }

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true }, settings.cookieExpiryMonths);
    setManualOpen(false);
    setShowPreferences(false);
  };

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false }, settings.cookieExpiryMonths);
    setManualOpen(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics: analyticsAllowed, marketing: marketingAllowed }, settings.cookieExpiryMonths);
    setManualOpen(false);
    setShowPreferences(false);
  };

  const isAr = locale === "ar";

  return (
    <aside
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6 bg-ink-950/95 backdrop-blur-md border-t border-white/10 text-offwhite shadow-2xl transition-transform duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 id="consent-title" className="text-base font-semibold text-white tracking-wide">
            {settings.bannerTitle || (isAr ? "تفضيلات الخصوصية وملفات تعريف الارتباط" : "Privacy Preferences & Cookies")}
          </h2>
          <p id="consent-desc" className="text-sm text-offwhite/80 leading-relaxed max-w-4xl">
            {settings.bannerDescription || (
              isAr
                ? "نستخدم ملفات تعريف الارتباط الأساسية لتشغيل الموقع، بالإضافة إلى أدوات التحليل والتسويق لتحسين تجربتك وقياس أداء الحملات بموافقتك."
                : "We use essential cookies to operate the site, and analytics and marketing tools to enhance your experience and measure campaigns with your consent."
            )}
          </p>

          {showPreferences && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {isAr ? "الضرورية (دائمًا نشطة)" : "Essential (Always Active)"}
                  </span>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label={isAr ? "الضرورية (دائمًا نشطة)" : "Essential (Always Active)"}
                    className="h-4 w-4 rounded accent-ice-400 opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-offwhite/60 mt-1">
                  {isAr ? "أمان الموقع، الجلسات، وتفضيلات اللغة." : "Security, sessions, and language settings."}
                </p>
              </div>

              <label className="bg-white/5 p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {isAr ? "أدوات التحليل (GA4)" : "Analytics (GA4)"}
                  </span>
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    aria-label={isAr ? "أدوات التحليل (GA4)" : "Analytics (GA4)"}
                    className="h-4 w-4 rounded accent-ice-400 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-offwhite/60 mt-1">
                  {isAr ? "قياس عدد الزوار والصفحات الأكثر زيارة." : "Measure visitor counts and popular pages."}
                </p>
              </label>

              <label className="bg-white/5 p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {isAr ? "التسويق والإعلانات" : "Marketing & Pixels"}
                  </span>
                  <input
                    type="checkbox"
                    checked={marketingAllowed}
                    onChange={(e) => setMarketingAllowed(e.target.checked)}
                    aria-label={isAr ? "التسويق والإعلانات" : "Marketing & Pixels"}
                    className="h-4 w-4 rounded accent-ice-400 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-offwhite/60 mt-1">
                  {isAr ? "قياس تحويلات الحملات (ميتا، سناب، تيك توك)." : "Campaign conversion tracking (Meta, Snap, TikTok)."}
                </p>
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
          {!showPreferences ? (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-ink-950 hover:bg-offwhite transition-colors"
              >
                {settings.acceptAllLabel}
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-offwhite hover:bg-white/15 transition-colors border border-white/10"
              >
                {settings.rejectAllLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-3 py-2 text-sm font-medium text-offwhite/80 hover:text-white transition-colors underline underline-offset-4"
              >
                {settings.preferencesLabel}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-ink-950 hover:bg-offwhite transition-colors"
              >
                {settings.savePreferencesLabel}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-offwhite hover:bg-white/15 transition-colors"
              >
                {settings.acceptAllLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
