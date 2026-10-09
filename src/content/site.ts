/**
 * ============================================================================
 * SEVEN LANDS — SINGLE SOURCE OF TRUTH FOR BUSINESS FACTS
 * ============================================================================
 * Only verified, owner-supplied data belongs in this file.
 * Anything unknown is listed in `pending` and must NOT be rendered as if it
 * were confirmed. See docs/PENDING-OWNER-INPUTS.md before launch.
 */

import { CANONICAL_SITE_URL } from "@/lib/site-origin";

export const site = {
  brand: {
    nameEn: "Seven Lands",
    nameAr: "سفن لاند",
    /** Canonical spelling — never render "Sevn Land" / "SevenLand" in UI copy. */
    wordmark: "Seven Lands",
  },
  domain: "7-lands.com",
  /**
   * Canonical origin for canonical tags, hreflang, sitemap and OG URLs.
   * Comes from `SITE_CANONICAL_URL` (server-only) — see src/lib/site-origin.ts for why this is
   * not a NEXT_PUBLIC_ variable, and how the runtime/preview origin is derived separately.
   */
  url: CANONICAL_SITE_URL,
  phone: {
    /** Local display format used by the owner. */
    display: "0507776891",
    /** E.164 — used for tel: and wa.me links. */
    e164: "+966507776891",
    waNumber: "966507776891",
  },
  location: {
    labelAr: "بريدة، القصيم، المملكة العربية السعودية",
    labelEn: "Buraydah, Al Qassim, Saudi Arabia",
    shortAr: "بريدة، القصيم",
    shortEn: "Buraydah, Al Qassim",
    mapsUrl: "https://maps.app.goo.gl/e3wYtFWUgd2vRZP28?g_st=iw",
  },
  /** NOTE: confirm with owner before publishing any of these. */
  pending: {
    email: null as string | null,
    streetAddress: null as string | null,
    businessHours: null as string | null,
    social: [] as { label: string; href: string }[],
    crNumber: null as string | null,
  },
} as const;

/** WhatsApp deep link with a context-aware prefilled message. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${site.phone.waNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const telHref = `tel:${site.phone.e164}`;

/** Business category used consistently across metadata and structured data. */
export const category = {
  ar: "التسويق والإبداع والتقنية وتطوير الأعمال",
  en: "Marketing, Creative & Technology",
} as const;

/**
 * Static build-time constants instead of `new Date()`: the value is stable across
 * prerenders (Cache Components rejects unstable values), and the owner bumps these
 * on release. Update COPYRIGHT_YEAR and CONTENT_UPDATED_AT before each launch.
 */
export const COPYRIGHT_YEAR = 2026;
export const CONTENT_UPDATED_AT = "2026-10-07";
