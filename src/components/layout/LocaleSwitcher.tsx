"use client";

import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import type { AppLocale } from "@/i18n/routing";

/**
 * Language switch — a single control that shows the OTHER language.
 *
 * Only one language is displayed at a time: on an Arabic page it offers English,
 * on an English page it offers Arabic (the owner's requested pattern). The current
 * language therefore never appears here; it is already visible in the page itself.
 *
 * Deliberately a plain anchor rather than the locale-aware `Link`: this header sits
 * inside a partially prerendered shell, where next-intl's Link resolved the target
 * path from stale server state (clicking it sent visitors to the locale root). The
 * href is computed from the live pathname, so the switch is exact. Before hydration
 * the href falls back to the locale root, which is a correct destination.
 */

const targetLabels: Record<AppLocale, string> = {
  ar: "العربية",
  en: "English",
};

const targetCodes: Record<AppLocale, string> = {
  ar: "عربي",
  en: "EN",
};

export function LocaleSwitcher({
  className,
  /** `full` is used inside the mobile drawer. */
  display = "compact",
}: {
  className?: string;
  display?: "compact" | "full";
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const target: AppLocale = locale === "ar" ? "en" : "ar";

  const fullPath = usePathname() || `/${locale}`;
  const pathWithoutLocale = fullPath.replace(/^\/(ar|en)(?=\/|$)/, "");
  const href = `/${target}${pathWithoutLocale}`;

  const isFull = display === "full";

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={target === "en" ? t("switchToEnglish") : t("switchToArabic")}
      onClick={() => track("language_switch", { from: locale, to: target })}
      className={clsx(
        "group/lang inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-ink-950/20 font-semibold text-ink-950 transition-colors duration-200 hover:border-ink-950/50 hover:bg-ink-950/[0.04]",
        isFull ? "h-12 w-full px-5 text-base" : "h-11 px-3.5 text-[0.875rem]",
        className,
      )}
    >
      {/* Translate glyph: reads as language, not as a browser affordance. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[1.1em] w-[1.1em] shrink-0 text-navy-800"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 6h8M7.5 6c0 3.2-1.6 6-4 8M6 10.5c1.2 2 3 3.6 5 4.5" />
        <path d="M12.5 20 16.4 9.5 20.3 20" />
        <path d="M13.9 16.4h5" />
      </svg>
      <span className="hidden min-[420px]:inline">{targetLabels[target]}</span>
      <span className="min-[420px]:hidden">{targetCodes[target]}</span>
    </a>
  );
}
