import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getConsentSettings, getSiteIdentity, getTrackingSettings } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/system/ScrollReveal";
import { AnalyticsListener } from "@/components/system/AnalyticsListener";
import { CookieConsentBanner } from "@/components/system/CookieConsentBanner";
import { TrackingScripts } from "@/components/system/TrackingScripts";
import { SalesChatWidget } from "@/components/chat/SalesChatWidget";
import { MobileAppDock } from "@/components/layout/MobileAppDock";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#061428" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const identity = await getSiteIdentity(locale as "ar" | "en");
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    metadataBase: new URL(identity.url),
    applicationName: identity.brand.nameEn,
    title: { default: t("title"), template: `%s — ${identity.brand.nameEn}` },
    description: t("description"),
    creator: identity.brand.nameEn,
    publisher: identity.brand.nameEn,
    category: "Marketing, Creative & Technology",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "ar-SA": "/ar",
        en: "/en",
        "x-default": "/ar",
      },
    },
    formatDetection: { telephone: true, address: true, email: false },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png" }],
      apple: [{ url: "/apple-icon.png" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });
  const [trackingSettings, consentSettings] = await Promise.all([
    getTrackingSettings(),
    getConsentSettings(locale as "ar" | "en"),
  ]);
  const currentEnv = process.env.NODE_ENV === "production" ? "production" : "development";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const htmlLang = locale === "ar" ? "ar-SA" : "en";

  return (
    <html lang={htmlLang} dir={dir} className={locale === "en" ? "latin-root" : undefined}>
      <head>
        {/*
          Self-hosted brand typography (Alexandria for Arabic, Manrope for Latin),
          subset by unicode-range and referenced with an explicit link rather than
          imported through the bundler:
          • eslint-disable-next-line @next/next/no-css-tags is not needed here —
            the rule sees a hand-written stylesheet link, which is deliberate: the
            font CSS must resolve to /public/fonts URLs and stay out of the JS
            critical path. It is a static, same-origin, render-blocking-free asset
            that only declares @font-face rules.
        */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <link
          rel="preload"
          href="/fonts/alexandria-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={locale === "ar" ? "/fonts/alexandria-latin.woff2" : "/fonts/manrope-latin.woff2"}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority={locale === "en" ? "high" : undefined}
        />
        <TrackingScripts settings={trackingSettings} env={currentEnv} />
      </head>
      <body className={locale === "ar" ? undefined : "latin"}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[70] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-offwhite"
        >
          {t("skipToContent")}
        </a>

        <NextIntlClientProvider>
          <Header locale={locale} />
          <main id="main" tabIndex={-1} className="pb-24 lg:pb-0">{children}</main>
          <Footer locale={locale} />
          <ScrollReveal />
          <AnalyticsListener />
          <CookieConsentBanner settings={consentSettings} locale={locale} />
          <SalesChatWidget />
          <MobileAppDock locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
