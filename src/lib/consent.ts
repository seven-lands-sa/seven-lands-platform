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

/*
 * useSyncExternalStore contract: getSnapshot MUST return the same reference while the store is
 * unchanged. getStoredConsent() builds a fresh object on every call, so passing it directly made
 * React see a "changed" store on every render and loop until it aborted (React error #185) — the
 * whole page crashed for every visitor who had already saved a consent choice.
 * The snapshot is therefore memoised on the raw cookie string.
 */
let cachedRawConsent: string | null | undefined;
let cachedConsent: ConsentState | null = null;

function readRawConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${CONSENT_COOKIE_NAME})=([^;]*)`));
  return match && match[3] ? match[3] : null;
}

/** Referentially stable consent snapshot for useSyncExternalStore. */
export function getConsentSnapshot(): ConsentState | null {
  const raw = readRawConsentCookie();
  if (raw !== cachedRawConsent) {
    cachedRawConsent = raw;
    cachedConsent = raw === null ? null : getStoredConsent();
  }
  return cachedConsent;
}

/** Server snapshot: no consent is ever known during SSR. */
export function getServerConsentSnapshot(): ConsentState | null {
  return null;
}

/** Subscribe to consent changes dispatched by saveConsent(). */
export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("sevenlands:consent_updated", callback);
  return () => {
    window.removeEventListener("sevenlands:consent_updated", callback);
  };
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
