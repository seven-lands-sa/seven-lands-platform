/**
 * Cookie-based Consent Engine & Consent Mode v2 Signals
 *
 * Saudi Privacy Compliance & Global Consent Standards:
 * - Necessary: always granted (security, sessions, language, routing)
 * - Analytics: opt-in (GA4, Clarity)
 * - Marketing: opt-in (Meta, TikTok, Snap, LinkedIn, Google Ads)
 *
 * Choice is stored in a first-party cookie `sl_consent` (JSON) with configurable expiry (default 6 months).
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const CONSENT_COOKIE_NAME = "sl_consent";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: "",
};

export function getStoredConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${CONSENT_COOKIE_NAME})=([^;]*)`));
    if (!match || !match[3]) return null;
    const parsed = JSON.parse(decodeURIComponent(match[3]));
    if (typeof parsed === "object" && parsed !== null && "necessary" in parsed) {
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        updatedAt: String(parsed.updatedAt || new Date().toISOString()),
      };
    }
  } catch {
    /* Cookie read/parse error fallback */
  }
  return null;
}

export function saveConsent(
  consent: { analytics: boolean; marketing: boolean },
  expiryMonths: number = 6,
): ConsentState {
  const fullConsent: ConsentState = {
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    updatedAt: new Date().toISOString(),
  };

  if (typeof document !== "undefined") {
    try {
      const maxAge = Math.max(1, expiryMonths) * 30 * 24 * 60 * 60; // seconds
      const value = encodeURIComponent(JSON.stringify(fullConsent));
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
      
      // Update Google Consent Mode v2 if window.gtag exists
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: consent.analytics ? "granted" : "denied",
          ad_storage: consent.marketing ? "granted" : "denied",
          ad_user_data: consent.marketing ? "granted" : "denied",
          ad_personalization: consent.marketing ? "granted" : "denied",
        });
      }

      window.dispatchEvent(new CustomEvent("sevenlands:consent_updated", { detail: fullConsent }));
    } catch {
      /* Write failed */
    }
  }

  return fullConsent;
}
