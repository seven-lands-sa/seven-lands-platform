/**
 * ============================================================================
 * ANALYTICS HOOKS
 * ============================================================================
 * No third-party script is loaded until the owner supplies IDs
 * (see docs/PENDING-OWNER-INPUTS.md). Calls below are safe no-ops today and
 * start reporting the moment GA4 / GTM is added to the layout.
 *
 * Events are intentionally limited to meaningful conversion signals.
 */

export type AnalyticsEvent =
  | "whatsapp_click"
  | "phone_click"
  | "maps_click"
  | "brief_form_start"
  | "brief_form_step"
  | "brief_form_submit"
  | "brief_form_error"
  | "service_cta_click"
  | "case_study_view"
  | "language_switch";

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, payload: Payload = {}) {
  if (typeof window === "undefined") return;

  const detail = { event, ...payload };

  try {
    window.dataLayer?.push(detail);
    window.gtag?.("event", event, payload);
    window.dispatchEvent(new CustomEvent("sevenlands:analytics", { detail }));
  } catch {
    /* analytics must never break the page */
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", detail);
  }
}

const CAMPAIGN_KEY = "sl_campaign";
const CAMPAIGN_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"];

/**
 * Campaign context is captured on the landing URL and kept for the session, so a
 * visitor who arrives from an ad and then browses before submitting the brief still
 * carries the source with them. Values are never rendered in the UI.
 */
export function rememberCampaign(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = sessionStorage.getItem(CAMPAIGN_KEY);
    const existing = stored ? (JSON.parse(stored) as Payload) : {};
    const fromUrl = readCampaignFromUrl();
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify({ ...existing, ...fromUrl }));
    }
  } catch {
    /* private mode / storage disabled — attribution is a bonus, never a requirement */
  }
}

function readCampaignFromUrl(): Payload {
  const params = new URLSearchParams(window.location.search);
  const out: Payload = {};
  for (const key of CAMPAIGN_PARAMS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 120);
  }
  return out;
}

/** Merged campaign context: session store first, current URL wins if it adds detail. */
export function campaignContext(): Payload {
  if (typeof window === "undefined") return {};
  let stored: Payload = {};
  try {
    const raw = sessionStorage.getItem(CAMPAIGN_KEY);
    if (raw) stored = JSON.parse(raw) as Payload;
  } catch {
    stored = {};
  }
  return { ...stored, ...readCampaignFromUrl() };
}
