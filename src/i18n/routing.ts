import { defineRouting } from "next-intl/routing";

/**
 * Arabic is the primary locale. English launches in parallel with real LTR layouts
 * and independently written copy (never a literal translation of the Arabic).
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];
