import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Accepts the local Saudi formats people actually type (05xxxxxxxx, 5xxxxxxxx,
 * 9665xxxxxxxx, +966 5x xxx xxxx) and returns E.164, or null when invalid.
 */
export function normalizeSaudiPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.replace(/^00966/, "").replace(/^966/, "");
  if (/^5\d{8}$/.test(local)) return `+966${local}`;
  if (/^05\d{8}$/.test(local)) return `+966${local.slice(1)}`;
  return null;
}

/** Display form (owner-supplied): 0507776891 */
export function formatPhoneDisplay(e164: string): string {
  const local = e164.replace(/^\+966/, "");
  return local.padStart(9, "0").replace(/^5/, "05");
}

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(iso: string, locale: "ar" | "en") {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
