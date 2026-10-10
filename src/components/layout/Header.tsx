import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getNavigation, getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import type { LinkTarget } from "@/lib/content";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { ButtonAnchor, ButtonLink, ArrowRight } from "@/components/ui/Button";

/** Where a CMS link points. Internal links stay locale-aware; external ones leave the site. */
const destination = (link: LinkTarget | null | undefined, fallback: string): string =>
  !link ? fallback : link.kind === "internal" ? link.path : link.url;

const leavesTheSite = (link: LinkTarget | null | undefined): boolean =>
  link?.kind === "external" && link.newTab;

export async function Header({ locale }: { locale?: AppLocale } = {}) {
  const activeLocale = locale ?? ((await getLocale()) as AppLocale);
  const [t, navigation, identity] = await Promise.all([
    getTranslations(),
    getNavigation(activeLocale),
    getSiteIdentity(activeLocale),
  ]);

  /*
    The menu is content: it comes from the Navigation global, so the owner renames or reorders it
    without a deploy. The seeder mirrors the shipped menu exactly, and an empty menu falls back to
    it, so the header can never render bare.
  */
  const homeLabel = activeLocale === "ar" ? "الرئيسية" : "Home";
  const rawItems = navigation.items.map((item) => ({
    href: destination(item.link, "/"),
    label: item.label,
    external: leavesTheSite(item.link),
  }));

  const hasHome = rawItems.some((item) => item.href === "/" || item.href === "" || item.label === homeLabel);
  const items = hasHome
    ? rawItems
    : [{ href: "/", label: homeLabel, external: false }, ...rawItems];

  const ctaHref = destination(navigation.cta?.link, "/start-a-project");
  const ctaLabel = navigation.cta?.label ?? t("nav.start");
  const ctaExternal = leavesTheSite(navigation.cta?.link);

  return (
    <header
      className="sticky top-0 z-50 border-b border-ink-950/10 bg-offwhite pt-[env(safe-area-inset-top)]"
      /*
        Deliberately no backdrop-filter here. It created a containing block that
        captured the fixed-position mobile drawer, clipping it to the header's own
        height. A solid surface also guarantees the header never becomes
        semi-transparent over content while scrolling.
      */
    >
      {/*
        Every item is shrink-0 and the nav can compress (min-w-0), so the language
        control and the menu trigger are never squeezed or clipped at 360px.
      */}
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-3 sm:gap-5 lg:h-20">
        <Link
          href="/"
          aria-label={identity.brand.nameEn}
          className="shrink-0 rounded-md py-1"
        >
          {/* Wordmark drops below 420px so the mark and controls always fit. */}
          <Logo size={34} wordmarkClassName="hidden min-[420px]:inline" />
        </Link>

        <nav aria-label={t("nav.mainNavigation")} className="hidden min-w-0 lg:block">
          <ul className="flex items-center gap-6 xl:gap-7">
            {items.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-[0.9375rem] font-medium text-steel-600 transition-colors duration-200 hover:text-ink-950"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-[0.9375rem] font-medium text-steel-600 transition-colors duration-200 hover:text-ink-950"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Shows the other language only — see LocaleSwitcher. */}
          <LocaleSwitcher />

          {ctaExternal ? (
            <ButtonAnchor
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              size="md"
              className="hidden whitespace-nowrap xl:inline-flex"
              data-analytics="service_cta_click"
              data-analytics-location="header"
            >
              <span>{ctaLabel}</span>
              <ArrowRight />
            </ButtonAnchor>
          ) : (
            <ButtonLink
              href={ctaHref}
              size="md"
              className="hidden whitespace-nowrap xl:inline-flex"
              data-analytics="service_cta_click"
              data-analytics-location="header"
            >
              <span>{ctaLabel}</span>
              <ArrowRight />
            </ButtonLink>
          )}

          <a
            href={withWhatsAppMessage(identity.whatsapp.href, t("wa.generic"))}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            data-analytics-location="header"
            aria-label={t("cta.whatsapp")}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-ink-950/20 text-ink-950 transition-colors duration-200 hover:border-ink-950/50 hover:bg-ink-950/[0.04] lg:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
              <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.9 9.9 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm5.68 14.02c-.24.68-1.4 1.3-1.93 1.36-.52.05-1 .12-3.4-.9-2.88-1.2-4.66-4.2-4.8-4.4-.14-.2-1.13-1.5-1.13-2.86s.7-2.02.96-2.3c.25-.28.55-.35.73-.35l.52.01c.17.01.4-.06.61.47.22.55.75 1.9.82 2.04.06.14.1.3.01.48-.08.19-.14.3-.28.46l-.41.48c-.14.14-.28.29-.13.56.15.28.68 1.2 1.47 1.94 1.01.95 1.86 1.24 2.13 1.38.26.14.42.12.57-.07.15-.2.66-.83.84-1.11.17-.28.35-.22.58-.13.24.09 1.5.75 1.76.89.26.14.43.2.5.32.06.12.06.7-.18 1.38Z" />
            </svg>
          </a>

          <MobileNav
            items={items}
            phoneHref={identity.phone.href}
            whatsappLink={withWhatsAppMessage(identity.whatsapp.href, t("wa.generic"))}
          />
        </div>
      </div>
    </header>
  );
}
