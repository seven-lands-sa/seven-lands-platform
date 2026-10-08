/**
 * Contact value normalisation (§10).
 *
 * The editor types what the business actually publishes — `0507776891` — and the system derives the
 * machine form: `tel:+966507776891`, `https://wa.me/966507776891`, `mailto:…`. Nobody hand-builds a
 * `tel:` link, and no Saudi local number is mangled into something that fails to dial.
 *
 * Pure functions only: the Payload field validators and the static fallback both call them, so the
 * rule cannot drift between the admin and the public site.
 */

const ARABIC_INDIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;

/** ٠١٢٣٤٥٦٧٨٩ and ۰۱۲۳۴۵۶۷۸۹ → ASCII, so a number pasted from an Arabic phone still works. */
export function toAsciiDigits(value: string): string {
  return value.replace(ARABIC_INDIC_DIGITS, (digit) =>
    String(digit.charCodeAt(0) & 0xf),
  );
}

export type NormalizedPhone = {
  /** +9665XXXXXXXX — what a tel: link needs. */
  e164: string;
  /** 05XXXXXXXX for Saudi numbers; the input kept as typed for anything else. */
  display: string;
};

/**
 * Accepts `0507776891`, `050 777 6891`, `+966507776891`, `00966507776891`, `966507776891`.
 * Returns null for anything that is not a plausible phone number — validation stays strict enough
 * to catch typos, loose enough to accept international numbers.
 */
export function normalizePhone(input: unknown): NormalizedPhone | null {
  if (typeof input !== "string") return null;
  const raw = toAsciiDigits(input).trim();
  const digits = raw.replace(/[\s()\-.]/g, "");

  if (!/^\+?\d{8,15}$/.test(digits)) return null;

  let e164: string;
  let display = raw;

  if (digits.startsWith("+")) {
    e164 = digits;
  } else if (digits.startsWith("00")) {
    e164 = `+${digits.slice(2)}`;
  } else if (digits.startsWith("966")) {
    e164 = `+${digits}`;
  } else if (digits.startsWith("0")) {
    e164 = `+966${digits.slice(1)}`;
  } else if (digits.startsWith("5") && digits.length === 9) {
    e164 = `+966${digits}`;
  } else {
    e164 = `+${digits}`;
  }

  const local = /^\+966(5\d{8})$/.exec(e164);
  if (local) display = `0${local[1]}`;

  return { e164, display };
}

/** WhatsApp speaks the same number without the plus: 966507776891. */
export function whatsAppNumber(input: unknown): string | null {
  const normalized = normalizePhone(input);
  return normalized ? normalized.e164.replace(/^\+/, "") : null;
}

export function derivePhoneHref(value: unknown): string | null {
  const normalized = normalizePhone(value);
  return normalized ? `tel:${normalized.e164}` : null;
}

export function deriveWhatsAppHref(value: unknown): string | null {
  const number = whatsAppNumber(value);
  return number ? `https://wa.me/${number}` : null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim()) && value.length <= 254;
}

export function deriveEmailHref(value: unknown): string | null {
  return isValidEmail(value) ? `mailto:${value.trim()}` : null;
}
