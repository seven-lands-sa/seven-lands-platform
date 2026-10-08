import { SOCIAL_ICON_KEYS, type SocialIconKey } from "@/components/ui/SocialIcon";

/**
 * Social platform registry (§15) — the platforms the business can actually hold accounts on.
 *
 * `urlPrefix` exists for one reason: validation messages and admin convenience. It is never forced
 * onto a saved URL (marketing legitimately uses short links), but an admin who types `@sevenlands`
 * instead of a URL is told what a correct link looks like for that platform.
 *
 * `defaultIcon` powers the auto-suggestion in §17: choosing Instagram pre-selects `instagram`, and
 * the admin may still pick any other curated mark.
 */

export type SocialPlatformKey =
  | "instagram"
  | "x"
  | "tiktok"
  | "snapchat"
  | "linkedin"
  | "youtube"
  | "facebook"
  | "threads"
  | "whatsapp"
  | "telegram"
  | "behance"
  | "dribbble"
  | "github"
  | "custom";

export type SocialPlatform = {
  key: SocialPlatformKey;
  labelAr: string;
  labelEn: string;
  /** Shown as the field hint in the admin: what a correct URL looks like. */
  urlPrefix?: string;
  defaultIcon: SocialIconKey | (typeof SOCIAL_ICON_KEYS)[number];
};

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  { key: "instagram", labelAr: "إنستغرام", labelEn: "Instagram", urlPrefix: "https://instagram.com/", defaultIcon: "instagram" },
  { key: "x", labelAr: "إكس (تويتر سابقًا)", labelEn: "X (formerly Twitter)", urlPrefix: "https://x.com/", defaultIcon: "x" },
  { key: "tiktok", labelAr: "تيك توك", labelEn: "TikTok", urlPrefix: "https://tiktok.com/@", defaultIcon: "tiktok" },
  { key: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat", urlPrefix: "https://snapchat.com/add/", defaultIcon: "snapchat" },
  { key: "linkedin", labelAr: "لينكدإن", labelEn: "LinkedIn", urlPrefix: "https://linkedin.com/company/", defaultIcon: "linkedin" },
  { key: "youtube", labelAr: "يوتيوب", labelEn: "YouTube", urlPrefix: "https://youtube.com/@", defaultIcon: "youtube" },
  { key: "facebook", labelAr: "فيسبوك", labelEn: "Facebook", urlPrefix: "https://facebook.com/", defaultIcon: "facebook" },
  { key: "threads", labelAr: "ثريدز", labelEn: "Threads", urlPrefix: "https://threads.net/@", defaultIcon: "threads" },
  { key: "whatsapp", labelAr: "واتساب", labelEn: "WhatsApp", urlPrefix: "https://wa.me/", defaultIcon: "whatsapp" },
  { key: "telegram", labelAr: "تيليجرام", labelEn: "Telegram", urlPrefix: "https://t.me/", defaultIcon: "telegram" },
  { key: "behance", labelAr: "بيهانس", labelEn: "Behance", urlPrefix: "https://behance.net/", defaultIcon: "behance" },
  { key: "dribbble", labelAr: "دريبل", labelEn: "Dribbble", urlPrefix: "https://dribbble.com/", defaultIcon: "dribbble" },
  { key: "github", labelAr: "جيت هاب", labelEn: "GitHub", urlPrefix: "https://github.com/", defaultIcon: "github" },
  { key: "custom", labelAr: "أخرى (رابط عام)", labelEn: "Custom (generic link)", defaultIcon: "link" },
];

const PLATFORM_MAP = new Map(SOCIAL_PLATFORMS.map((platform) => [platform.key, platform]));

export function socialPlatform(key: string | null | undefined): SocialPlatform | null {
  if (!key) return null;
  return PLATFORM_MAP.get(key as SocialPlatformKey) ?? null;
}

export function defaultIconFor(platform: string | null | undefined) {
  return socialPlatform(platform)?.defaultIcon ?? "link";
}
